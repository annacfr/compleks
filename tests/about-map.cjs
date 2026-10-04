// Regression coverage: map, About scroll story, reverse scroll and reduced motion.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(__dirname, "../PythonProject1/complex-plus");
const mime = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml"
};

const server = http.createServer(async (request, response) => {
    try {
        const file = path.join(
            root,
            new URL(request.url, "http://localhost").pathname
        );
        const body = await fs.readFile(file);
        response.writeHead(200, {
            "Content-Type": mime[path.extname(file)] || "application/octet-stream"
        });
        response.end(body);
    } catch {
        response.writeHead(404);
        response.end();
    }
});

async function scrollStory(page, target, index = 0) {
    await page.evaluate(({ target, index }) => {
        const section = document.querySelector(".about-section");
        const story = section.querySelector(".about__story");
        const steps = [...section.querySelectorAll("[data-about-step]")];
        const final = section.querySelector("[data-about-final]");
        const sectionTop = section.getBoundingClientRect().top + scrollY;
        const anchor = innerHeight * 0.58;
        let y = sectionTop + story.offsetTop - anchor;

        if (target === "step") {
            y += steps[index].offsetTop + steps[index].offsetHeight / 2 + 8;
        }

        if (target === "final") {
            y = sectionTop + final.offsetTop - anchor + innerHeight * 0.74;
        }

        scrollTo({ top: y, behavior: "instant" });
    }, { target, index });

    await page.waitForTimeout(760);
}

(async () => {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

    const browser = await chromium.launch({
        executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
        args: ["--no-sandbox", "--disable-gpu"]
    });

    try {
        for (const width of [320, 360, 390, 430, 768, 1440]) {
            for (const reducedMotion of ["no-preference", "reduce"]) {
                const page = await browser.newPage({
                    viewport: { width, height: 900 },
                    isMobile: width <= 768,
                    hasTouch: width <= 768,
                    reducedMotion
                });
                const errors = [];
                const missing = [];

                page.on("pageerror", error => errors.push(error.message));
                page.on("response", response => {
                    if (
                        response.url().includes("127.0.0.1") &&
                        response.status() >= 400
                    ) {
                        missing.push(response.url());
                    }
                });

                await page.route(
                    /^https?:\/\/(?!127\.0\.0\.1)/,
                    route => route.abort()
                );
                await page.goto(
                    "http://127.0.0.1:" +
                    server.address().port +
                    "/index.html"
                );
                await page.waitForSelector(".services__problem-section");
                await page.waitForSelector("#cpIntroLoader", {
                    state: "hidden"
                });

                assert.equal(
                    await page.evaluate(
                        () => document.documentElement.scrollWidth <= innerWidth
                    ),
                    true,
                    "horizontal overflow " + width
                );

                const line = await page.evaluate(() => {
                    const rail = document.querySelector(".about__rail");
                    const points = [
                        ...document.querySelectorAll(".about__point")
                    ];
                    const railRect = rail.getBoundingClientRect();

                    return {
                        width: railRect.width,
                        pointOffsets: points.map(point => {
                            const rect = point.getBoundingClientRect();
                            return Math.abs(
                                rect.left + rect.width / 2 - railRect.left
                            );
                        })
                    };
                });

                assert(
                    line.width <= 1.5,
                    "rail is wider than 1.5px: " + line.width
                );
                assert(
                    line.pointOffsets.every(offset => offset < 0.75),
                    "points are not aligned to rail: " +
                    JSON.stringify(line.pointOffsets)
                );

                if (reducedMotion === "reduce") {
                    const state = await page.evaluate(() => ({
                        ready: document
                            .querySelector(".about-section")
                            .classList.contains("is-scroll-ready"),
                        revealedSteps: document.querySelectorAll(
                            ".about__step.is-revealed"
                        ).length,
                        revealedFinal: document.querySelectorAll(
                            "[data-about-final-part].is-revealed"
                        ).length,
                        fillTransform: getComputedStyle(
                            document.querySelector(".about__rail-fill")
                        ).transform
                    }));

                    assert.equal(state.ready, false);
                    assert.equal(state.revealedSteps, 4);
                    assert.equal(state.revealedFinal, 4);
                    assert.equal(state.fillTransform, "none");
                } else {
                    await scrollStory(page, "start");
                    let state = await page.evaluate(() => ({
                        revealed: document.querySelectorAll(
                            ".about__step.is-revealed"
                        ).length,
                        progress: parseFloat(
                            getComputedStyle(
                                document.querySelector(".about-section")
                            ).getPropertyValue("--about-line-progress")
                        )
                    }));

                    assert.equal(state.revealed, 0);
                    assert(state.progress <= 0.01);

                    for (let index = 0; index < 4; index += 1) {
                        await scrollStory(page, "step", index);
                        state = await page.evaluate(() => ({
                            revealed: document.querySelectorAll(
                                ".about__step.is-revealed"
                            ).length,
                            current: [
                                ...document.querySelectorAll(".about__step")
                            ].findIndex(step =>
                                step.classList.contains("is-current")
                            )
                        }));

                        assert.equal(state.revealed, index + 1);
                        assert.equal(state.current, index);
                    }

                    await scrollStory(page, "final");
                    assert.equal(
                        await page.locator(
                            "[data-about-final-part].is-revealed"
                        ).count(),
                        4
                    );

                    if ([390, 1440].includes(width)) {
                        await page.screenshot({
                            path: "/tmp/about-story-final-" + width + ".png"
                        });
                    }

                    await scrollStory(page, "start");
                    state = await page.evaluate(() => ({
                        revealed: document.querySelectorAll(
                            ".about__step.is-revealed"
                        ).length,
                        final: document.querySelectorAll(
                            "[data-about-final-part].is-revealed"
                        ).length
                    }));
                    assert.deepEqual(state, { revealed: 0, final: 0 });
                }

                if (
                    [390, 1440].includes(width) &&
                    reducedMotion === "no-preference"
                ) {
                    await scrollStory(page, "step", 2);
                    await page.screenshot({
                        path: "/tmp/about-story-" + width + ".png"
                    });
                }

                assert.deepEqual(errors, []);
                assert.deepEqual(missing, []);
                console.log(
                    "PASS About story",
                    width,
                    reducedMotion
                );
                await page.close();
            }
        }
    } finally {
        await browser.close();
        await new Promise(resolve => server.close(resolve));
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
