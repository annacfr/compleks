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


    /* =========================================================
       MAIN RENDER
       ========================================================= */

    function render(progress) {

        progress = clamp(progress);


        // Весь текст уже виден. Прокрутка меняет только резкость строк.
        const lineStarts = [0.07, 0.26, 0.45, 0.64, 0.82];
        const lineEnds = [0.28, 0.47, 0.66, 0.85, 0.96];
        const textStarts = [0.88, 0.925, 0.955];
        const textEnds = [0.98, 1, 1];

        function sharpen(lines, starts, ends, blur) {
            lines.forEach(function (line, index) {
                const local = range(progress, starts[index] ?? starts[0], ends[index] ?? ends[0]);
                line.style.filter = "blur(" + (blur * (1 - local)).toFixed(2) + "px)";
            });
        }

        sharpen(fragments, lineStarts, lineEnds, 4.5);
        sharpen(textLines, textStarts, textEnds, 2.5);

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
        requestUpdate,
        {
            passive: true
        }
    );


    if (
        document.fonts &&
        document.fonts.ready
    ) {

        document.fonts.ready.then(
            requestUpdate
        );
    }


    section.classList.add("is-scroll-ready");
    update();

})();
