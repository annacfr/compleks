/* =========================================================
   COMPLEX PLUS — HERO INTERACTIONS
   ========================================================= */
(function () {
    "use strict";

    const DISTRICTS = [
        { name: "oct", mask: 30 },
        { name: "vorosh", mask: 60 },
        { name: "perv", mask: 90 },
        { name: "sov", mask: 120 },
        { name: "rail", mask: 150 },
        { name: "kirov", mask: 180 },
        { name: "lenin", mask: 210 },
        { name: "prolet", mask: 240 }
    ];

    const DISTRICT_ANIMATION_MS = 2500;
    const DISTRICT_GAP_MS = 100;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function smoothstep(value) {
        return value * value * (3 - 2 * value);
    }

    function initHeroReadyState(hero) {
        const loader = document.getElementById("cpIntroLoader");

        if (!loader || loader.classList.contains("cp-intro-loader--finished")) {
            hero.classList.add("hero--ready");
            return;
        }

        const observer = new MutationObserver(function () {
            const finished =
                loader.classList.contains("cp-intro-loader--finished") ||
                !document.body.contains(loader);

            if (!finished) {
                return;
            }

            hero.classList.add("hero--ready");
            observer.disconnect();
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
            childList: true,
            subtree: true
        });
    }

    function initCursor(cursor) {
        const finePointer =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(pointer: fine)").matches;

        if (!cursor || !finePointer) {
            return;
        }

        document.body.appendChild(cursor);
        document.body.classList.add("has-custom-cursor");
        cursor.style.setProperty("--hero-green", "#06291d");

        let mouseX = -100;
        let mouseY = -100;
        let currentX = -100;
        let currentY = -100;
        let visible = false;
        let frame = null;

        function render() {
            currentX += (mouseX - currentX) * 0.18;
            currentY += (mouseY - currentY) * 0.18;

            cursor.style.transform =
                "translate3d(" +
                (currentX - 7) +
                "px, " +
                (currentY - 7) +
                "px, 0)";

            frame = requestAnimationFrame(render);
        }

        function move(event) {
            mouseX = event.clientX;
            mouseY = event.clientY;

            if (!visible) {
                visible = true;
                cursor.classList.add("is-visible");
            }
        }

        function leave() {
            visible = false;
            cursor.classList.remove("is-visible", "is-active");
        }

        document.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("pointerleave", leave, { passive: true });

        // Delegation also covers controls in the asynchronously loaded services.
        document.addEventListener("pointerover", function (event) {
            cursor.classList.toggle(
                "is-active",
                Boolean(event.target.closest("a, button, input, textarea, select, label"))
            );
        }, { passive: true });

        render();

        window.addEventListener(
            "pagehide",
            function () {
                if (frame !== null) {
                    cancelAnimationFrame(frame);
                }

                leave();
            },
            { once: true }
        );
    }

    /* =========================================================
       GLOBAL PAGE SCROLL INDICATOR
       ========================================================= */

    function initProgress(scroll) {
        if (!scroll) {
            return;
        }

        const track = scroll.querySelector(".hero-scroll__track");

        if (!track) {
            return;
        }

        const progress = track.querySelector("i");
        const steps = Array.from(
            scroll.querySelectorAll(".hero-scroll__step")
        );

        if (!progress || !steps.length) {
            return;
        }

        const sectionIds = [
            "home",
            "about",
            "services",
            "documents",
            "contacts"
        ];

        let sections = [];
        let targetProgress = 0;
        let currentProgress = 0;
        let animationFrame = null;

        function collectSections() {
            sections = sectionIds
                .map(function (id) {
                    const section =
                        document.getElementById(id);

                    if (!section) {
                        return null;
                    }

                    return {
                        id: id,
                        element: section,
                        top:
                            section.getBoundingClientRect().top +
                            window.scrollY
                    };
                })
                .filter(Boolean);

            positionSteps();
        }

        function positionSteps() {
            const trackHeight = track.clientHeight;

            if (!trackHeight) {
                return;
            }

            const visibleSteps = steps.filter(function (step) {
                const exists = sections.some(function (section) {
                    return section.id === step.dataset.section;
                });
                step.hidden = !exists;
                return exists;
            });
            visibleSteps.forEach(function (step, index) {
                step.style.top = (trackHeight * index / Math.max(1, visibleSteps.length - 1)).toFixed(2) + "px";
            });
        }

        function updateTarget() {
            const maxScroll = Math.max(
                1,
                document.documentElement.scrollHeight -
                window.innerHeight
            );

            targetProgress = clamp(
                window.scrollY / maxScroll,
                0,
                1
            );

            let activeId =
                sections.length
                    ? sections[0].id
                    : "home";

            sections.forEach(function (section) {
                if (
                    window.scrollY >=
                    section.top - window.innerHeight * 0.18
                ) {
                    activeId = section.id;
                }
            });

            steps.forEach(function (step) {
                step.classList.toggle(
                    "is-active",
                    step.dataset.section === activeId
                );
            });

            if (animationFrame === null) {
                animationFrame =
                    requestAnimationFrame(render);
            }
        }

        function render() {
            currentProgress +=
                (targetProgress - currentProgress) * 0.12;

            if (
                Math.abs(
                    targetProgress - currentProgress
                ) < 0.0005
            ) {
                currentProgress = targetProgress;
            }

            const trackHeight = track.clientHeight;

            const y =
                trackHeight * currentProgress;

            progress.style.height =
                y.toFixed(2) + "px";

            if (
                currentProgress !== targetProgress
            ) {
                animationFrame =
                    requestAnimationFrame(render);
            } else {
                animationFrame = null;
            }
        }

        function refresh() {
            collectSections();
            updateTarget();
        }

        refresh();
        document.documentElement.classList.add("has-custom-scroll");

        window.addEventListener(
            "scroll",
            updateTarget,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            refresh
        );

        const servicesContainer =
            document.getElementById(
                "services-container"
            );

        window.addEventListener("load", refresh, { once: true });
        if ("ResizeObserver" in window) {
            new ResizeObserver(refresh).observe(document.querySelector("main"));
        }

        if (servicesContainer) {
            const observer =
                new MutationObserver(refresh);

            observer.observe(
                servicesContainer,
                {
                    childList: true,
                    subtree: true
                }
            );
        }
    }

    /* =========================================================
       DISTRICT MAP
       ========================================================= */

    function getMapTransform(canvas, maskImage) {
        const rect =
            canvas.getBoundingClientRect();

        const scale = Math.min(
            rect.width / maskImage.naturalWidth,
            rect.height / maskImage.naturalHeight
        );

        return {
            scale: scale,
            offsetX:
                (rect.width -
                    maskImage.naturalWidth * scale) / 2,
            offsetY:
                (rect.height -
                    maskImage.naturalHeight * scale) / 2
        };
    }

    function createDistrictMasks(maskCanvas, sourceData) {
        const masks = new Map();

        DISTRICTS.forEach(function (district) {
            const canvas =
                document.createElement("canvas");

            canvas.width = maskCanvas.width;
            canvas.height = maskCanvas.height;

            const context =
                canvas.getContext("2d");

            const imageData =
                context.createImageData(
                    maskCanvas.width,
                    maskCanvas.height
                );

            for (
                let index = 0;
                index < sourceData.length;
                index += 4
            ) {
                if (
                    sourceData[index] !==
                    district.mask
                ) {
                    continue;
                }

                imageData.data[index] = 255;
                imageData.data[index + 1] = 255;
                imageData.data[index + 2] = 255;
                imageData.data[index + 3] = 255;
            }

            context.putImageData(
                imageData,
                0,
                0
            );

            masks.set(
                district.name,
                canvas
            );
        });

        return masks;
    }

    function getDistrictBounds(
        maskCanvas,
        sourceData,
        maskValue
    ) {
        let minX = maskCanvas.width;
        let minY = maskCanvas.height;
        let maxX = -1;
        let maxY = -1;
        let sumX = 0;
        let sumY = 0;
        let count = 0;

        for (
            let y = 0;
            y < maskCanvas.height;
            y += 1
        ) {
            for (
                let x = 0;
                x < maskCanvas.width;
                x += 1
            ) {
                const index =
                    (y * maskCanvas.width + x) * 4;

                if (
                    sourceData[index] !== maskValue
                ) {
                    continue;
                }

                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
                sumX += x;
                sumY += y;
                count += 1;
            }
        }

        if (!count) {
            return null;
        }

        return {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY,
            centerX: sumX / count,
            centerY: sumY / count
        };
    }

    function initDistrictAnimation() {
        const canvas =
            document.querySelector(
                ".district-glow-canvas"
            );

        if (!canvas) {
            return;
        }

        const context =
            canvas.getContext("2d");

        if (!context) {
            return;
        }

        const maskImage = new Image();
        const maskCanvas =
            document.createElement("canvas");

        const maskContext =
            maskCanvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );

        if (!maskContext) {
            return;
        }

        let sourceData = null;
        let districtMasks = new Map();
        let currentIndex = 0;
        let animationFrame = null;
        let transitionTimer = null;

        function resize() {
            const rect =
                canvas.getBoundingClientRect();

            const dpr =
                window.devicePixelRatio || 1;

            canvas.width =
                Math.max(
                    1,
                    Math.round(rect.width * dpr)
                );

            canvas.height =
                Math.max(
                    1,
                    Math.round(rect.height * dpr)
                );

            context.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );
        }

        function scheduleNextDistrict() {
            currentIndex =
                (currentIndex + 1) %
                DISTRICTS.length;

            animateDistrict(
                DISTRICTS[currentIndex]
            );
        }

        function animateDistrict(district) {
            if (animationFrame !== null) {
                cancelAnimationFrame(
                    animationFrame
                );
            }

            if (transitionTimer !== null) {
                clearTimeout(
                    transitionTimer
                );
            }

            const bounds =
                getDistrictBounds(
                    maskCanvas,
                    sourceData,
                    district.mask
                );

            const districtMask =
                districtMasks.get(
                    district.name
                );

            if (!bounds || !districtMask) {
                scheduleNextDistrict();
                return;
            }

            const transform =
                getMapTransform(
                    canvas,
                    maskImage
                );

            const centerX =
                bounds.centerX *
                transform.scale +
                transform.offsetX;

            const centerY =
                bounds.centerY *
                transform.scale +
                transform.offsetY;

            const width =
                (bounds.maxX -
                    bounds.minX) *
                transform.scale;

            const height =
                (bounds.maxY -
                    bounds.minY) *
                transform.scale;

            const maxRadius =
                Math.min(
                    Math.max(width, height) *
                        0.52,
                    210 *
                        transform.scale
                );

            const start =
                performance.now();

            function frame(now) {
                const raw =
                    clamp(
                        (now - start) /
                            DISTRICT_ANIMATION_MS,
                        0,
                        1
                    );

                const progress =
                    smoothstep(raw);

                const radius =
                    Math.max(
                        1,
                        maxRadius *
                            progress
                    );

                const fadeOut =
                    raw > 0.78
                        ? 1 -
                          smoothstep(
                              (raw - 0.78) /
                                  0.22
                          )
                        : 1;

                const rect =
                    canvas.getBoundingClientRect();

                context.clearRect(
                    0,
                    0,
                    rect.width,
                    rect.height
                );

                const gradient =
                    context.createRadialGradient(
                        centerX,
                        centerY,
                        0,
                        centerX,
                        centerY,
                        radius
                    );

                gradient.addColorStop(
                    0,
                    "rgba(45, 105, 75, " +
                        0.38 * fadeOut +
                        ")"
                );

                gradient.addColorStop(
                    0.34,
                    "rgba(45, 105, 75, " +
                        0.25 * fadeOut +
                        ")"
                );

                gradient.addColorStop(
                    0.68,
                    "rgba(45, 105, 75, " +
                        0.10 * fadeOut +
                        ")"
                );

                gradient.addColorStop(
                    1,
                    "rgba(45, 105, 75, 0)"
                );

                context.fillStyle =
                    gradient;

                context.beginPath();

                context.arc(
                    centerX,
                    centerY,
                    radius,
                    0,
                    Math.PI * 2
                );

                context.fill();

                context.globalCompositeOperation =
                    "destination-in";

                context.drawImage(
                    districtMask,
                    transform.offsetX,
                    transform.offsetY,
                    maskCanvas.width *
                        transform.scale,
                    maskCanvas.height *
                        transform.scale
                );

                context.globalCompositeOperation =
                    "source-over";

                if (raw < 1) {
                    animationFrame =
                        requestAnimationFrame(
                            frame
                        );

                    return;
                }

                transitionTimer =
                    window.setTimeout(
                        scheduleNextDistrict,
                        DISTRICT_GAP_MS
                    );
            }

            animationFrame =
                requestAnimationFrame(frame);
        }

        maskImage.onload = function () {
            maskCanvas.width =
                maskImage.naturalWidth;

            maskCanvas.height =
                maskImage.naturalHeight;

            maskContext.clearRect(
                0,
                0,
                maskCanvas.width,
                maskCanvas.height
            );

            maskContext.drawImage(
                maskImage,
                0,
                0
            );

            sourceData =
                maskContext.getImageData(
                    0,
                    0,
                    maskCanvas.width,
                    maskCanvas.height
                ).data;

            districtMasks =
                createDistrictMasks(
                    maskCanvas,
                    sourceData
                );

            resize();

            animateDistrict(
                DISTRICTS[0]
            );
        };

        window.addEventListener(
            "resize",
            resize
        );

        maskImage.src =
            "images/district-mask.png";
    }

    function init() {
        const hero =
            document.querySelector(".hero");

        if (!hero) {
            return;
        }

        initHeroReadyState(hero);

        initCursor(
            document.querySelector(
                ".hero-cursor"
            )
        );

        initProgress(
            document.querySelector(
                ".hero-scroll"
            )
        );

        initDistrictAnimation();
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }
})();