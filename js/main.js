// Burger menu toggle
const burger = document.querySelector('.burger');
const mobileMenu = document.getElementById('mobile-menu');
const overlay = document.getElementById('mobile-menu-overlay');

function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('mobile-menu--open');
    overlay.classList.toggle('mobile-menu__overlay--visible', isOpen);
    burger.classList.toggle('burger--active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

burger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// Закрытие меню при клике на ссылку (чтобы не оставалось открытым после перехода)
document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('mobile-menu--open');
        overlay.classList.remove('mobile-menu__overlay--visible');
        burger.classList.remove('burger--active');
        document.body.style.overflow = '';
    });
});