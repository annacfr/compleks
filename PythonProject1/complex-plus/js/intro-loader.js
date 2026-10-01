/*
 * COMPLEX PLUS — INTRO LOADER
 *
 * Подключение:
 * <script src="js/intro-loader.js"></script>
 *
 * Скрипт не вмешивается в существующий JS сайта.
 */

(function () {
    'use strict';

    const loader = document.getElementById('cpIntroLoader');

    if (!loader) return;

    const STORAGE_KEY = 'cp-intro-seen';
    const REDUCED_MOTION = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /*
     * Для интеграции:
     * true  — первый визит: полная сцена; следующие визиты: короткая.
     * false — показывать полную сцену при каждом обновлении страницы.
     */
    const SKIP_AFTER_FIRST_VISIT = false;

    /*
     * Если понадобится полностью отключить intro:
     * добавьте data-cp-intro-disabled="true" на body.
     */
    if (document.body.dataset.cpIntroDisabled === 'true') {
        loader.remove();
        return;
    }

    const firstVisit = !sessionStorage.getItem(STORAGE_KEY);

    let duration = 3550;

    if (REDUCED_MOTION) {
        duration = 350;
    } else if (SKIP_AFTER_FIRST_VISIT && !firstVisit) {
        loader.classList.add('cp-intro-loader--short');
        duration = 900;
    }

    function finishLoader() {
        if (!loader || loader.classList.contains('cp-intro-loader--finished')) {
            return;
        }

        loader.classList.add('cp-intro-loader--leaving');

        window.setTimeout(function () {
            loader.classList.add('cp-intro-loader--finished');
            loader.setAttribute('aria-hidden', 'true');

            document.documentElement.classList.remove('cp-intro-lock');
            document.body.classList.remove('cp-intro-lock');

            window.setTimeout(function () {
                loader.remove();
            }, 600);
        }, 90);
    }

    function initCursor() {
        const desktopPointer = window.matchMedia &&
            window.matchMedia('(pointer: fine)').matches;

        if (!desktopPointer) return;

        const cursor = document.createElement('div');
        cursor.className = 'cp-intro-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        document.body.appendChild(cursor);

        document.body.classList.add('cp-intro-cursor-active');

        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        let rafId = null;

        function render() {
            currentX += (targetX - currentX) * 0.16;
            currentY += (targetY - currentY) * 0.16;

            cursor.style.left = currentX + 'px';
            cursor.style.top = currentY + 'px';
            cursor.style.opacity = '1';

            rafId = window.requestAnimationFrame(render);
        }

        function move(event) {
            targetX = event.clientX;
            targetY = event.clientY;
        }

        function onPointerOver(event) {
            const target = event.target.closest('a, button, [role="button"]');
            cursor.classList.toggle('cp-intro-cursor--hover', !!target);
        }

        window.addEventListener('pointermove', move, { passive: true });
        document.addEventListener('pointerover', onPointerOver, { passive: true });

        render();

        window.setTimeout(function () {
            if (rafId) window.cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', move);
            document.removeEventListener('pointerover', onPointerOver);
            document.body.classList.remove('cp-intro-cursor-active');

            cursor.style.opacity = '0';

            window.setTimeout(function () {
                cursor.remove();
            }, 250);
        }, duration + 500);
    }

    function init() {
        document.documentElement.classList.add('cp-intro-lock');
        document.body.classList.add('cp-intro-lock');

        initCursor();

        /*
         * sessionStorage означает:
         * в рамках одной вкладки полная заставка показывается
         * только при первом входе.
         */
        if (firstVisit) {
            sessionStorage.setItem(STORAGE_KEY, '1');
        }

        window.setTimeout(finishLoader, duration);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
