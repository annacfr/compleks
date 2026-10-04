(function () {
    "use strict";

    const section = document.querySelector(".about-section");

    if (!section) {
        return;
    }

    const story = section.querySelector(".about__story");
    const rail = section.querySelector(".about__rail");
    const steps = [...section.querySelectorAll("[data-about-step]")];
    const finalBlock = section.querySelector("[data-about-final]");
    const finalParts = [...section.querySelectorAll("[data-about-final-part]")];
    const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (
        !story ||
        !rail ||
        !steps.length ||
        !finalBlock
    ) {
        return;
    }

    function clamp(value, min = 0, max = 1) {
        return Math.max(min, Math.min(max, value));
    }

    function smooth(value) {
        const progress = clamp(value);
        return progress * progress * (3 - 2 * progress);
    }

    function range(value, start, end) {
        if (end <= start) {
            return value >= end ? 1 : 0;
        }

        return smooth((value - start) / (end - start));
    }

    let metrics = null;
    let frameRequested = false;

    function measure() {
        metrics = {
            railHeight: rail.offsetHeight,
            stepPoints: steps.map(function (step) {
                return step.offsetTop + step.offsetHeight / 2;
            })
        };
    }

    function showStaticState() {
        section.classList.remove("is-scroll-ready");
        section.classList.add("is-line-complete");

        steps.forEach(function (step) {
            step.classList.add("is-revealed");
            step.classList.remove("is-current", "is-past");
        });

        finalParts.forEach(function (part) {
            part.classList.add("is-revealed");
        });
    }

    function render() {
        frameRequested = false;

        if (motionPreference.matches) {
            showStaticState();
            return;
        }

        if (!metrics) {
            measure();
        }

        section.classList.add("is-scroll-ready");

        const sectionRect = section.getBoundingClientRect();
        const storyRect = story.getBoundingClientRect();
        const finalRect = finalBlock.getBoundingClientRect();
        const viewportAnchor = window.innerHeight * 0.58;
        const storyCursor = viewportAnchor - storyRect.top;
        const lineProgress = clamp(
            storyCursor / Math.max(1, metrics.railHeight)
        );

        const labelProgress = range(
            window.innerHeight * 0.88 - sectionRect.top,
            0,
            window.innerHeight * 0.28
        );

        section.style.setProperty(
            "--about-line-progress",
            lineProgress.toFixed(4)
        );
        section.style.setProperty(
            "--about-label-opacity",
            labelProgress.toFixed(4)
        );
        section.style.setProperty(
            "--about-label-shift",
            (18 * (1 - labelProgress)).toFixed(2) + "px"
        );

        let activeIndex = -1;

        metrics.stepPoints.forEach(function (point, index) {
            if (storyCursor >= point) {
                activeIndex = index;
            }
        });

        steps.forEach(function (step, index) {
            const isRevealed = index <= activeIndex;

            step.classList.toggle("is-revealed", isRevealed);
            step.classList.toggle("is-current", index === activeIndex);
            step.classList.toggle(
                "is-past",
                isRevealed && index < activeIndex
            );
        });

        const lineComplete = lineProgress >= 0.997;
        section.classList.toggle("is-line-complete", lineComplete);

        const finalProgress = clamp(
            (viewportAnchor - finalRect.top) /
            Math.max(1, window.innerHeight * 0.78)
        );
        const finalThresholds = [0.08, 0.28, 0.52, 0.74];

        finalParts.forEach(function (part, index) {
            part.classList.toggle(
                "is-revealed",
                finalProgress >= finalThresholds[index]
            );
        });
    }

    function requestRender() {
        if (frameRequested) {
            return;
        }

        frameRequested = true;
        window.requestAnimationFrame(render);
    }

    function handleResize() {
        metrics = null;
        requestRender();
    }

    if (motionPreference.matches) {
        showStaticState();
        return;
    }

    measure();
    render();

    window.addEventListener("scroll", requestRender, {
        passive: true
    });
    window.addEventListener("resize", handleResize);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(handleResize);
    }
}());
