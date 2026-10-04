(function () {
    "use strict";

    /*
     * COMPLEX PLUS - ABOUT
     *
     * Одна scroll-driven сцена.
     *
     * 0 → 1:
     *   0.00 - начало сцены
     *   0.10 - первая строка
     *   0.29 - вторая строка
     *   0.48 - третья строка
     *   0.67 - четвёртая строка
     *   0.84 - пятая строка
     *   0.91 - поясняющий текст
     *   1.00 - полностью собранная композиция
     *
     * Никакого перехвата wheel.
     * Никаких таймеров.
     * Никакого отдельного scroll-lock.
     */

    const section = document.querySelector(".about-section");

    if (!section) {
        return;
    }

    const fragments = [
        ...section.querySelectorAll(".about__fragment")
    ];

    const textLines = [
        ...section.querySelectorAll(".about__text-line")
    ];

    const technical = [
        ...section.querySelectorAll(".about__technical")
    ];

    const boundaries = [
        ...section.querySelectorAll(".about__boundary")
    ];

    const cross = section.querySelector(".about__cross");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* =========================================================
       HELPERS
       ========================================================= */

    function clamp(value, min = 0, max = 1) {
        return Math.max(min, Math.min(max, value));
    }


    function ease(value) {
        value = clamp(value);

        return value * value * (3 - 2 * value);
    }


    function range(progress, start, end) {
        if (end <= start) {
            return progress >= end ? 1 : 0;
        }

        return ease(
            clamp(
                (progress - start) /
                (end - start)
            )
        );
    }


    function setTransform(
        element,
        x = 0,
        y = 0,
        scale = 1
    ) {
        if (reducedMotion) {
            element.style.transform = "none";
            return;
        }

        element.style.transform =
            "translate3d(" +
            x.toFixed(2) +
            "px, " +
            y.toFixed(2) +
            "px, 0) " +
            "scale(" +
            scale.toFixed(4) +
            ")";
    }


    // SVG overlays follow the actual glyph positions, including mobile wrapping.
    // The original text stays in the DOM for selection and screen readers.
    const ns = "http://www.w3.org/2000/svg";
    const measure = document.createElement("canvas").getContext("2d");
    const inkLines = new Map();

    function prepareInk() {
        if (reducedMotion || !measure) return;
        [...fragments, ...textLines].forEach(function (line) {
            let ink = inkLines.get(line);
            if (!ink) {
                const source = document.createElement("span");
                source.className = "about__ink-source";
                source.append(...line.childNodes);
                const svg = document.createElementNS(ns, "svg");
                svg.classList.add("about__ink");
                svg.setAttribute("aria-hidden", "true");
                svg.setAttribute("focusable", "false");
                line.append(source, svg);
                ink = { source, svg, glyphs: [] };
                inkLines.set(line, ink);
            }
            ink.svg.replaceChildren();
            ink.glyphs = [];
            const box = line.getBoundingClientRect();
            ink.svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
            const walker = document.createTreeWalker(ink.source, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                const style = getComputedStyle(node.parentElement);
                measure.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
                const metrics = measure.measureText("Hg");
                const ascent = metrics.fontBoundingBoxAscent || parseFloat(style.fontSize) * .8;
                const descent = metrics.fontBoundingBoxDescent || parseFloat(style.fontSize) * .2;
                for (let i = 0; i < node.length; i++) {
                    if (/\s/.test(node.textContent[i])) continue;
                    const range = document.createRange();
                    range.setStart(node, i);
                    range.setEnd(node, i + 1);
                    const rect = range.getBoundingClientRect();
                    const glyph = document.createElementNS(ns, "text");
                    glyph.textContent = node.textContent[i];
                    glyph.setAttribute("x", rect.left - box.left);
                    glyph.setAttribute("y", rect.top - box.top + (rect.height - ascent - descent) / 2 + ascent);
                    glyph.style.fontFamily = style.fontFamily;
                    glyph.style.fontSize = style.fontSize;
                    glyph.style.fontWeight = style.fontWeight;
                    glyph.style.stroke = style.color;
                    const length = parseFloat(style.fontSize) * 4;
                    glyph.style.strokeDasharray = length;
                    glyph.style.strokeDashoffset = length;
                    ink.svg.append(glyph);
                    ink.glyphs.push({ glyph, length });
                }
            }
        });
        section.classList.add("is-scroll-ready");
    }

    function drawInk(lines, starts, ends, progress) {
        lines.forEach(function (line, index) {
            const ink = inkLines.get(line);
            if (!ink) return;
            const local = range(progress, starts[index] ?? starts[0], ends[index] ?? ends[0]);
            const fill = range(local, .55, 1);
            ink.source.style.opacity = String(.14 + .86 * fill);
            ink.svg.style.opacity = String(1 - fill);
            ink.glyphs.forEach(function ({ glyph, length }, i) {
                const stagger = i / Math.max(1, ink.glyphs.length - 1) * .18;
                const draw = range(local, stagger, .7 + stagger);
                glyph.style.strokeDashoffset = String(length * (1 - draw));
            });
        });
    }

    /* =========================================================
       MAIN RENDER
       ========================================================= */

    function render(progress) {

        progress = clamp(progress);


        drawInk(fragments, [0.02, .18, .34, .50, .66], [.28, .44, .60, .76, .92], progress);
        drawInk(textLines, [.76, .81, .86], [.94, .97, 1], progress);

        /* =====================================================
           3. GEOMETRY
           =====================================================

           Геометрия больше не является главным объектом.

           Она:
           - присутствует;
           - слегка двигается;
           - освобождает центр;
           - остаётся почти незаметной.
           ===================================================== */

        const geometry =
            range(
                progress,
                0.08,
                0.78
            );


        const finalGeometry =
            range(
                progress,
                0.82,
                1
            );


        boundaries.forEach(function (element) {

            const isLeft =
                element.classList.contains(
                    "about__boundary--left"
                );

            const direction =
                isLeft ? -1 : 1;


            /*
             * Очень небольшое расхождение от центра.
             */

            const x =
                direction *
                (
                    10 +
                    geometry * 17
                );


            element.style.opacity =
                (
                    0.13 -
                    finalGeometry * 0.035
                ).toFixed(4);


            setTransform(
                element,
                x,
                0
            );
        });


        /* =====================================================
           4. TECHNICAL LABELS
           ===================================================== */

        technical.forEach(function (element, index) {

            const direction =
                index % 2 === 0
                    ? -1
                    : 1;


            const x =
                direction *
                7 *
                (1 - geometry);


            const y =
                (
                    index % 3 === 0
                        ? -1
                        : 1
                ) *
                3 *
                (1 - geometry);


            element.style.opacity =
                (
                    0.10 +
                    geometry * 0.08
                ).toFixed(4);


            setTransform(
                element,
                x,
                y
            );
        });


        /* =====================================================
           5. OLD CORNER MARKERS
           =====================================================

           Старые внешние маркеры больше не нужны.

           Декоративные углы теперь находятся непосредственно
           вокруг "Комплекс Плюс".
           ===================================================== */

        /* =====================================================
           6. CENTRAL CROSS
           ===================================================== */

        if (cross) {

            const crossProgress =
                range(
                    progress,
                    0.15,
                    0.65
                );


            cross.style.opacity =
                (
                    0.16 -
                    0.04 * finalGeometry
                ).toFixed(4);


            const circle =
                cross.querySelector("circle");

            const lines =
                cross.querySelectorAll("line");


            lines.forEach(function (line) {

                line.style.opacity =
                    (
                        0.35 +
                        crossProgress * 0.20
                    ).toFixed(4);
            });


            if (circle) {

                circle.style.opacity =
                    (
                        0.35 +
                        crossProgress * 0.15
                    ).toFixed(4);
            }
        }


        /* =====================================================
           7. STATE
           ===================================================== */

        section.classList.toggle(
            "is-assembling",
            progress > 0.01 &&
            progress < 0.96
        );


        section.classList.toggle(
            "is-complete",
            progress >= 0.985
        );
    }


    /* =========================================================
       SCROLL LOOP
       ========================================================= */

    let ticking = false;


    function update() {

        ticking = false;


        const rect =
            section.getBoundingClientRect();


        const totalScroll =
            Math.max(
                1,
                section.offsetHeight -
                window.innerHeight
            );


        const progress =
            clamp(
                (-rect.top) /
                totalScroll
            );


        render(progress);
    }


    function requestUpdate() {

        if (ticking) {
            return;
        }

        ticking = true;

        requestAnimationFrame(
            update
        );
    }


    /* =========================================================
       EVENTS
       ========================================================= */

    window.addEventListener(
        "scroll",
        requestUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        function () { prepareInk(); requestUpdate(); },
        {
            passive: true
        }
    );


    if (
        document.fonts &&
        document.fonts.ready
    ) {

        document.fonts.ready.then(function () { prepareInk(); requestUpdate(); });
    }


    prepareInk();
    update();

})();
