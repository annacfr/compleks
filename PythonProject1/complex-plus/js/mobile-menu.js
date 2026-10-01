document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const inner = header?.querySelector('.header__inner');
    const navigation = header?.querySelector('.navigation');
    if (!header || !inner || !navigation) return;

    let button = header.querySelector('.mobile-menu');
    if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'mobile-menu';
        button.setAttribute('aria-label', 'Открыть меню');
        button.innerHTML = '<span></span><span></span><span></span>';
        inner.append(button);
    }

    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
        const isOpen = header.classList.toggle('header--menu-open');
        button.setAttribute('aria-expanded', String(isOpen));
        button.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        header.classList.remove('header--menu-open');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Открыть меню');
    }));
});
