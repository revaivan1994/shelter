(function () {
    const PETS_URL = 'pets.json';
    const cardsContainer = document.getElementById('friends-cards');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    if (!cardsContainer || !prevBtn || !nextBtn) return;

    let allPets = [];
    let currentGroup = [];
    let isAnimating = false;

  
    function getVisibleCount() {
        const w = window.innerWidth;
        if (w > 1279) return 3;
        if (w > 720) return 2;
        return 1;
    }

    function shuffle(array) {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
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
                <h3 class="card__name">${pet.name}</h3>
                <button class="btn card__btn" type="button">Learn more</button>
            </div>
        `;
        return card;
    }

    function renderGroup(group) {
        cardsContainer.innerHTML = '';
        group.forEach(pet => cardsContainer.appendChild(createCard(pet)));
    }

    function pickNextGroup(count) {
        const currentNames = currentGroup.map(p => p.name);
        const pool = allPets.filter(p => !currentNames.includes(p.name));
        const shuffled = shuffle(pool);
        return shuffled.slice(0, count);
    }


    function slide(direction) {
        if (isAnimating || allPets.length === 0) return;
        isAnimating = true;

        const count = getVisibleCount();
        const nextGroup = pickNextGroup(count);

        const leavingClass = direction === 'next'
            ? 'friends__cards--leaving-next'
            : 'friends__cards--leaving-prev';

        cardsContainer.classList.add(leavingClass);

        const onLeaveEnd = () => {
            cardsContainer.removeEventListener('transitionend', onLeaveEnd);

            currentGroup = nextGroup;
            renderGroup(currentGroup);

   
            cardsContainer.classList.remove(leavingClass);
            cardsContainer.classList.add('friends__cards--entering',
                direction === 'next' ? 'friends__cards--leaving-prev' : 'friends__cards--leaving-next');


            void cardsContainer.offsetWidth;

            cardsContainer.classList.remove('friends__cards--leaving-next', 'friends__cards--leaving-prev', 'friends__cards--entering');

            const onEnterEnd = () => {
                cardsContainer.removeEventListener('transitionend', onEnterEnd);
                isAnimating = false;
            };
            cardsContainer.addEventListener('transitionend', onEnterEnd);
        };

        cardsContainer.addEventListener('transitionend', onLeaveEnd);
    }

    function init() {
        fetch(PETS_URL)
            .then(res => res.json())
            .then(data => {
                allPets = data;
                const count = getVisibleCount();
                currentGroup = shuffle(allPets).slice(0, count);
                renderGroup(currentGroup);
            })
            .catch(err => console.error('Failed to load pets.json', err));
    }

    nextBtn.addEventListener('click', () => slide('next'));
    prevBtn.addEventListener('click', () => slide('prev'));

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isAnimating) return;
            const count = getVisibleCount();
            if (count !== currentGroup.length) {
                currentGroup = shuffle(allPets).slice(0, count);
                renderGroup(currentGroup);
            }
        }, 200);
    });

    init();
})();