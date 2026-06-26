(function () {
    const PETS_URL = 'pets.json';
    const gridContainer = document.querySelector('.friends__grid');
    const paginationContainer = document.querySelector('.pagination');

    if (!gridContainer || !paginationContainer) return;

    let allPets = [];
    let fullDeck = [];       // 48 карточек
    let currentPage = 1;
    let cardsPerPage = 8;
    let totalPages = 6;
    let isAnimating = false;

    // Сколько карточек на странице — зависит от ширины экрана
    function getCardsPerPage() {
        const w = window.innerWidth;
        if (w > 1279) return 8;   // desktop: 6 страниц
        if (w > 720) return 6;    // tablet: 8 страниц
        return 3;                 // mobile: 16 страниц
    }

    // Перемешать массив (Фишер-Йейтс)
    function shuffle(array) {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Сгенерировать 48 карточек: каждый питомец повторяется поровну,
    // соседние карточки не совпадают
    function generateDeck(pets, total) {
        const repeats = total / pets.length; // например 48/8 = 6
        let pool = [];
        for (let i = 0; i < repeats; i++) {
            pool = pool.concat(shuffle(pets));
        }
        pool = shuffle(pool);

        // Разрешаем конфликты соседей простым свапом
        for (let i = 1; i < pool.length; i++) {
            if (pool[i].name === pool[i - 1].name) {
                // ищем дальше элемент, который можно поставить сюда без конфликта
                let swapped = false;
                for (let j = i + 1; j < pool.length; j++) {
                    if (pool[j].name !== pool[i - 1].name &&
                        (j === pool.length - 1 || pool[j].name !== pool[j + 1].name) &&
                        (i === pool.length - 1 || pool[j].name !== pool[i + 1]?.name)) {
                        [pool[i], pool[j]] = [pool[j], pool[i]];
                        swapped = true;
                        break;
                    }
                }
                // fallback: если не нашли — просто свапнем с следующим
                if (!swapped && i < pool.length - 1) {
                    [pool[i], pool[i + 1]] = [pool[i + 1], pool[i]];
                }
            }
        }
        return pool;
    }

    function getImgSrc(pet) {
        let src = pet.img.startsWith('/') ? pet.img.slice(1) : pet.img;
        if (!src.endsWith('.png')) src += '.png';
        return src;
    }

    function createCard(pet) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card__image">
                <img src="${getImgSrc(pet)}" alt="${pet.name} the ${pet.type.toLowerCase()}" width="270" height="270">
            </div>
            <div class="card__body">
                <h2 class="card__name">${pet.name}</h2>
                <button class="btn card__btn" type="button">Learn more</button>
            </div>
        `;
        return card;
    }

    function renderPage(page) {
        const start = (page - 1) * cardsPerPage;
        const end = start + cardsPerPage;
        const pageCards = fullDeck.slice(start, end);

        gridContainer.innerHTML = '';
        pageCards.forEach(pet => gridContainer.appendChild(createCard(pet)));
    }

    function renderPagination() {
        const isFirst = currentPage === 1;
        const isLast = currentPage === totalPages;

        paginationContainer.innerHTML = `
            <button class="pagination__btn ${isFirst ? 'pagination__btn--disabled' : ''}"
                type="button" data-action="first" aria-label="First page" ${isFirst ? 'disabled' : ''}>&lt;&lt;</button>
            <button class="pagination__btn ${isFirst ? 'pagination__btn--disabled' : ''}"
                type="button" data-action="prev" aria-label="Previous page" ${isFirst ? 'disabled' : ''}>&lt;</button>
            <button class="pagination__btn pagination__btn--active" type="button"
                aria-label="Page ${currentPage}" aria-current="page">${currentPage}</button>
            <button class="pagination__btn ${isLast ? 'pagination__btn--disabled' : ''}"
                type="button" data-action="next" aria-label="Next page" ${isLast ? 'disabled' : ''}>&gt;</button>
            <button class="pagination__btn ${isLast ? 'pagination__btn--disabled' : ''}"
                type="button" data-action="last" aria-label="Last page" ${isLast ? 'disabled' : ''}>&gt;&gt;</button>
        `;

        paginationContainer.querySelectorAll('.pagination__btn').forEach(btn => {
            if (btn.disabled) return;
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'first') goToPage(1);
                if (action === 'prev') goToPage(currentPage - 1);
                if (action === 'next') goToPage(currentPage + 1);
                if (action === 'last') goToPage(totalPages);
            });
        });
    }

    function goToPage(page) {
        if (isAnimating || page < 1 || page > totalPages || page === currentPage) return;
        isAnimating = true;

        gridContainer.classList.add('friends__grid--leaving');

        const onLeaveEnd = () => {
            gridContainer.removeEventListener('transitionend', onLeaveEnd);

            currentPage = page;
            renderPage(currentPage);
            renderPagination();

            gridContainer.classList.add('friends__grid--entering');
            void gridContainer.offsetWidth; // reflow
            gridContainer.classList.remove('friends__grid--leaving', 'friends__grid--entering');

            const onEnterEnd = () => {
                gridContainer.removeEventListener('transitionend', onEnterEnd);
                isAnimating = false;
            };
            gridContainer.addEventListener('transitionend', onEnterEnd);
        };

        gridContainer.addEventListener('transitionend', onLeaveEnd);
    }

    function setupForViewport() {
        const newCardsPerPage = getCardsPerPage();
        if (newCardsPerPage === cardsPerPage && fullDeck.length) return; // ничего не изменилось

        cardsPerPage = newCardsPerPage;
        totalPages = 48 / cardsPerPage;
        currentPage = 1;
        renderPage(currentPage);
        renderPagination();
    }

    function init() {
        fetch(PETS_URL)
            .then(res => res.json())
            .then(data => {
                allPets = data;
                fullDeck = generateDeck(allPets, 48);
                cardsPerPage = getCardsPerPage();
                totalPages = 48 / cardsPerPage;
                currentPage = 1;
                renderPage(currentPage);
                renderPagination();
            })
            .catch(err => console.error('Failed to load pets.json', err));
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setupForViewport, 200);
    });

    init();
})();