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
       CHARACTER PREPARATION
       =========================================================

       Каждая строка разбивается на символы.

       При этом:
       - <em> сохраняется;
       - слова не меняются;
       - HTML-структура страницы не требуется менять вручную.

       Это позволяет сделать очень лёгкий эффект
       постепенной сборки отдельных букв и знаков.
       ========================================================= */

    function prepareCharacters(element) {

        const nodes = [
            ...element.childNodes
        ];

        let characterIndex = 0;

        function processNode(node) {

            if (node.nodeType === Node.TEXT_NODE) {

                const text = node.textContent;

                if (!text.trim()) {
                    return;
                }

                const fragment = document.createDocumentFragment();

                [...text].forEach(function (character) {

                    const span =
                        document.createElement("span");

                    span.className =
                        "about__char";

                    span.textContent =
                        character === " "
                            ? "\u00A0"
                            : character;

                    span.dataset.charIndex =
                        String(characterIndex++);

                    fragment.appendChild(span);
                });

                node.parentNode.replaceChild(
                    fragment,
                    node
                );

                return;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {

                [
                    ...node.childNodes
                ].forEach(processNode);
            }
        }

        nodes.forEach(processNode);

        return [
            ...element.querySelectorAll(".about__char")
        ];
    }


    /*
     * Подготавливаем буквы только один раз.
     */

    const fragmentCharacters =
        fragments.map(prepareCharacters);

    const textCharacters =
        textLines.map(prepareCharacters);


    /* =========================================================
       CHARACTER ORDER
       =========================================================

       Не используем обычный порядок 1 → 2 → 3.

       Внутри каждой строки буквы получают слегка
       перемешанный порядок. Благодаря этому строка
       ощущается как собирающаяся композиция, а не
       как печатающаяся строка.
       ========================================================= */

    function getRevealOrder(characters) {

        return characters
            .map(function (element, index) {

                const character =
                    element.textContent;

                const code =
                    character.charCodeAt(0);

                const score =
                    (
                        index * 37 +
                        code * 17 +
                        (index % 5) * 13
                    ) % 101;

                return {
                    element,
                    index,
                    score
                };
            })
            .sort(function (a, b) {

                return a.score - b.score;
            });
    }


    const fragmentOrders =
        fragmentCharacters.map(getRevealOrder);

    const textOrders =
        textCharacters.map(getRevealOrder);


    /* =========================================================
       MAIN RENDER
       ========================================================= */

    function render(progress) {

        progress = clamp(progress);


        /* =====================================================
           1. MAIN TEXT
           =====================================================

           Каждая следующая строка начинается примерно через
           один и тот же интервал scroll-progress.

           Это создаёт ощущение:

           строка
           ↓
           строка
           ↓
           строка

           а не непрерывной анимации всего блока.
           ===================================================== */

        const lineStarts = [
            0.07,
            0.26,
            0.45,
            0.64,
            0.82
        ];

        const lineEnds = [
            0.28,
            0.47,
            0.66,
            0.85,
            0.96
        ];


        fragments.forEach(function (fragment, lineIndex) {

            const local =
                range(
                    progress,
                    lineStarts[lineIndex] ?? 0.07,
                    lineEnds[lineIndex] ?? 0.28
                );


            /*
             * Вся строка слегка входит из размытия.
             */

            const baseBlur =
                4.5 * (1 - local);

            const baseY =
                7 * (1 - local);


            fragment.style.opacity =
                String(
                    0.12 +
                    local * 0.88
                );

            fragment.style.filter =
                "blur(" +
                baseBlur.toFixed(2) +
                "px)";


            setTransform(
                fragment,
                0,
                baseY
            );


            /* -------------------------------------------------
               LETTER ASSEMBLY
               ------------------------------------------------- */

            const order =
                fragmentOrders[lineIndex] || [];


            order.forEach(function (item, index) {

                const character =
                    item.element;

                const total =
                    Math.max(1, order.length);


                /*
                 * Большая часть букв появляется в первой
                 * половине локального интервала.
                 *
                 * Поэтому это не выглядит как печатание.
                 */

                const stagger =
                    index / total * 0.48;

                const charProgress =
                    ease(
                        clamp(
                            (local - stagger) /
                            0.52
                        )
                    );


                /*
                 * Знаки препинания и пробелы собираются
                 * чуть быстрее.
                 */

                const isPunctuation =
                    /[.,;:!?\u2014\u2013-]/.test(
                        character.textContent
                    );


                const punctuationBoost =
                    isPunctuation ? 0.12 : 0;


                const finalProgress =
                    ease(
                        clamp(
                            charProgress +
                            punctuationBoost
                        )
                    );


                const x =
                    (
                        ((index % 3) - 1) *
                        1.8
                    ) *
                    (1 - finalProgress);


                const y =
                    (
                        index % 2 === 0
                            ? 3
                            : -2
                    ) *
                    (1 - finalProgress);


                const blur =
                    4 *
                    (1 - finalProgress);


                character.style.opacity =
                    finalProgress.toFixed(4);

                character.style.filter =
                    "blur(" +
                    blur.toFixed(2) +
                    "px)";


                character.style.transform =
                    "translate3d(" +
                    x.toFixed(2) +
                    "px, " +
                    y.toFixed(2) +
                    "px, 0)";
            });
        });


        /* =====================================================
           2. DESCRIPTION
           =====================================================

           Появляется после того, как основной текст
           уже практически собран.
           ===================================================== */

        const textStarts = [
            0.88,
            0.925,
            0.955
        ];

        const textEnds = [
            0.98,
            1.00,
            1.00
        ];


        textLines.forEach(function (line, lineIndex) {

            const local =
                range(
                    progress,
                    textStarts[lineIndex] ?? 0.88,
                    textEnds[lineIndex] ?? 0.98
                );


            line.style.opacity =
                String(
                    0.12 +
                    local * 0.88
                );


            line.style.filter =
                "blur(" +
                (3.5 * (1 - local)).toFixed(2) +
                "px)";


            line.style.transform =
                "translate3d(0, " +
                (5 * (1 - local)).toFixed(2) +
                "px, 0)";


            const order =
                textOrders[lineIndex] || [];


            order.forEach(function (item, index) {

                const character =
                    item.element;

                const total =
                    Math.max(1, order.length);


                const stagger =
                    index / total * 0.36;


                const charProgress =
                    ease(
                        clamp(
                            (local - stagger) /
                            0.64
                        )
                    );


                character.style.opacity =
                    charProgress.toFixed(4);


                character.style.filter =
                    "blur(" +
                    (
                        3 *
                        (1 - charProgress)
                    ).toFixed(2) +
                    "px)";


                character.style.transform =
                    "translate3d(0, " +
                    (
                        2 *
                        (1 - charProgress)
                    ).toFixed(2) +
                    "px, 0)";
            });
        });


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
       REDUCED MOTION
       ========================================================= */

    function renderReducedMotion() {

        fragments.forEach(function (fragment) {

            fragment.style.opacity = "1";
            fragment.style.filter = "none";
            fragment.style.transform = "none";


            fragment
                .querySelectorAll(".about__char")
                .forEach(function (character) {

                    character.style.opacity = "1";
                    character.style.filter = "none";
                    character.style.transform = "none";
                });
        });


        textLines.forEach(function (line) {

            line.style.opacity = "1";
            line.style.filter = "none";
            line.style.transform = "none";


            line
                .querySelectorAll(".about__char")
                .forEach(function (character) {

                    character.style.opacity = "1";
                    character.style.filter = "none";
                    character.style.transform = "none";
                });
        });


        technical.forEach(function (element) {

            element.style.opacity = "0.12";
            element.style.transform = "none";
        });


        boundaries.forEach(function (element) {

            element.style.opacity = "0.10";
            element.style.transform = "none";
        });


        if (cross) {

            cross.style.opacity = "0.12";

            cross
                .querySelectorAll("line, circle")
                .forEach(function (element) {

                    element.style.opacity = "1";
                });
        }


        section.classList.add(
            "is-complete"
        );
    }


    if (reducedMotion) {

        renderReducedMotion();

        return;
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


    requestUpdate();

})();