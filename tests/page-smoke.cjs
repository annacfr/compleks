// Run with Playwright installed: node tests/page-smoke.cjs
// CHROMIUM_EXECUTABLE_PATH can select an existing Chromium binary.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const repositoryRoot = path.resolve(__dirname, "..");
const root = path.join(repositoryRoot, "PythonProject1/complex-plus");
const pages = [
  "index.html",
  "service-mezhevanie.html",
  "service-kpt.html",
  "service-inspection-act.html",
  "service-tech-plan-building.html",
  "service-expert-conclusion.html",
];
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const published = pathname.startsWith("/compleks/");
    const servingRoot = published ? repositoryRoot : root;
    let relativePath = published
      ? pathname.slice("/compleks".length)
      : pathname;
    if (relativePath.endsWith("/")) relativePath += "index.html";
    const filename = path.resolve(servingRoot, "." + relativePath);
    if (!filename.startsWith(servingRoot + path.sep))
      throw new Error("Invalid path");
    const content = await fs.readFile(filename);
    response.writeHead(200, {
      "Content-Type":
        mime[path.extname(filename)] || "application/octet-stream",
    });
    response.end(content);
  } catch {
    response.writeHead(404);
    response.end();
  }
});

(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = "http://127.0.0.1:" + server.address().port;
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
      args: ["--no-sandbox", "--disable-gpu"],
    });
    for (const mobile of [false, true]) {
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1440, height: 900 },
        isMobile: mobile,
        hasTouch: mobile,
        reducedMotion: "reduce",
      });
      // These checks cover local code and assets, independent of Google Fonts.
      await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) =>
        route.abort(),
      );
      for (const file of pages) {
        const page = await context.newPage();
        const errors = [];
        const missing = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("response", (response) => {
          if (response.url().startsWith(base) && response.status() >= 400)
            missing.push(response.url());
        });
        await page.goto(base + "/" + file);
        if (file === "index.html") {
          await page.waitForSelector(".services__problem-section");
          assert.equal(
            await page.locator("#problem-detail-index").textContent(),
            "01 / 06",
          );
          assert.equal(
            await page.locator(".services__service-tab.is-active").count(),
            0,
          );
          for (const key of ["geodesy", "legal", "cadastral"]) {
            await page.locator('[data-service="' + key + '"]').click();
            assert.equal(
              await page
                .locator("#service-panel")
                .getAttribute("aria-labelledby"),
              "service-tab-" + key,
            );
            assert.equal(
              await page
                .locator(".services__detail-graphic")
                .getAttribute("data-service"),
              key,
            );
            assert(
              await page.locator(".services__drawing--" + key).isVisible(),
            );
          }
          for (const number of [6, 2, 5, 1]) {
            await page.locator('[data-problem="' + number + '"]').click();
            assert.equal(
              await page.locator("#problem-detail-index").textContent(),
              "0" + number + " / 06",
            );
            assert(
              (await page.locator(".services__problem-section").count()) >= 5,
            );
          }
          await page.evaluate(() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "instant",
            }),
          );
          await page.waitForFunction(
            () =>
              parseFloat(
                document.querySelector(".hero-scroll__track i").style.height,
              ) > 175,
          );
          const positions = await page
            .locator(".hero-scroll__step")
            .evaluateAll((items) =>
              items.map((item) => parseFloat(item.style.top)),
            );
          assert(
            positions.every((top, i) => !i || top - positions[i - 1] >= 17),
          );
          assert(await page.locator("#contacts a[href^='tel:']").isVisible());
        } else if (!mobile) {
          assert.notEqual(
            await page
              .locator("body")
              .evaluate((el) => getComputedStyle(el).cursor),
            "none",
          );
        }
        if (mobile) {
          await page.locator(".mobile-menu").click();
          assert.equal(
            await page.locator(".mobile-menu").getAttribute("aria-expanded"),
            "true",
          );
        }
        const duplicates = await page.locator("[id]").evaluateAll((items) => {
          const ids = items.map((item) => item.id);
          return ids.filter((id, i) => ids.indexOf(id) !== i);
        });
        assert.deepEqual(duplicates, [], file + " duplicate IDs");
        assert.deepEqual(errors, [], file + " JS errors");
        assert.deepEqual(missing, [], file + " missing assets");
        console.log("PASS", mobile ? "mobile" : "desktop", file);
        await page.close();
      }
      await context.close();
    }
    const entryContext = await browser.newContext({ reducedMotion: "reduce" });
    await entryContext.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) =>
      route.abort(),
    );
    const entryPage = await entryContext.newPage();
    await entryPage.goto(base + "/compleks/?preview=1#contacts");
    await entryPage.waitForSelector(".services__problem-section");
    const entryUrl = new URL(entryPage.url());
    assert.equal(entryUrl.pathname, "/compleks/PythonProject1/complex-plus/");
    assert.equal(entryUrl.search, "?preview=1");
    assert.equal(entryUrl.hash, "#contacts");
    await entryPage.waitForFunction(() => {
      const box = document.getElementById("contacts").getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    });
    await entryPage.goto(base + "/compleks/index.html");
    await entryPage.waitForSelector(".services__problem-section");
    assert.equal(
      new URL(entryPage.url()).pathname,
      "/compleks/PythonProject1/complex-plus/",
    );
    console.log("PASS Pages root entry, query and fragment preservation");
    await entryContext.close();
    const noJsContext = await browser.newContext({ javaScriptEnabled: false });
    await noJsContext.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) =>
      route.abort(),
    );
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto(base + "/compleks/");
    await noJsPage.waitForURL("**/compleks/PythonProject1/complex-plus/");
    console.log("PASS Pages root redirect without JavaScript");
    await noJsContext.close();
    const animatedContext = await browser.newContext();
    await animatedContext.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) =>
      route.abort(),
    );
    const animatedPage = await animatedContext.newPage();
    await animatedPage.goto(base + "/index.html");
    await animatedPage.waitForSelector(".services__problem-section");
    await animatedPage.evaluate(() => {
      for (const key of ["cadastral", "geodesy", "legal"]) {
        document
          .querySelector('[data-service="' + key + '"]')
          .dispatchEvent(new Event("mouseenter"));
      }
      for (const number of [2, 3, 6]) {
        document.querySelector('[data-problem="' + number + '"]').click();
      }
    });
    await animatedPage.waitForFunction(
      () =>
        document.getElementById("service-detail-code").textContent ===
          "LAW / 003" &&
        document.getElementById("problem-detail-index").textContent ===
          "06 / 06",
    );
    await animatedPage.locator("#service-tab-legal").press("ArrowDown");
    await animatedPage.waitForFunction(
      () =>
        document.getElementById("service-detail-code").textContent ===
        "CAD / 001",
    );
    assert.equal(
      await animatedPage
        .locator("#service-tab-cadastral")
        .getAttribute("aria-selected"),
      "true",
    );
    console.log("PASS animated rapid tab switching and keyboard wraparound");
    await animatedContext.close();
    const context = await browser.newContext({ reducedMotion: "reduce" });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) =>
      route.abort(),
    );
    const page = await context.newPage();
    await page.route("**/services.html", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.continue();
    });
    await page.goto(base + "/index.html#contacts");
    await page.waitForSelector(".services__problem-section");
    await page.waitForFunction(() => {
      const box = document.getElementById("contacts").getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    });
    console.log("PASS delayed cross-page anchor");
    await page.unroute("**/services.html");
    await page.route("**/services.html", (route) =>
      route.fulfill({ status: 503, body: "Unavailable" }),
    );
    await page.goto(base + "/index.html");
    await page.waitForSelector(
      "#services-container [role=status] a[href^='tel:']",
    );
    console.log("PASS services loading failure fallback");
    await context.close();
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
