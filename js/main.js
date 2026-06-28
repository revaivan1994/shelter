// Burger menu toggle
const burger = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobile-menu');
const overlay = document.getElementById('mobile-menu-overlay');

function openMenu() {
    mobileMenu.classList.add('mobile-menu--open');
    overlay.classList.add('mobile-menu__overlay--visible');
    burger.classList.add('burger--active');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    mobileMenu.classList.remove('mobile-menu--open');
    overlay.classList.remove('mobile-menu__overlay--visible');
    burger.classList.remove('burger--active');
    document.body.style.overflow = '';
}

burger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains('mobile-menu--open')) {
        closeMenu();
    } else {
        openMenu();
    }
});

// Закрытие по клику в любом месте вне меню (включая "пустые" зоны хедера)
document.addEventListener('click', (e) => {
    const isMenuOpen = mobileMenu.classList.contains('mobile-menu--open');
    if (!isMenuOpen) return;

    const clickedInsideMenu = mobileMenu.contains(e.target);
    const clickedBurger = burger.contains(e.target);

    if (!clickedInsideMenu && !clickedBurger) {
        closeMenu();
    }
});

// Закрытие при клике на ссылку меню
document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', closeMenu);
});