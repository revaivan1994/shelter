(function () {
    const PETS_URL = 'pets.json'; 

    const overlay = document.getElementById('popup-overlay');
    const closeBtn = document.getElementById('popup-close');

    if (!overlay || !closeBtn) return;

    let allPets = [];

    function getImgSrc(pet) {
        let src = pet.img.startsWith('/') ? pet.img.slice(1) : pet.img;
        if (!src.endsWith('.png')) src += '.png';
        return src;
    }

    function formatList(arr) {
        if (!arr || !arr.length || (arr.length === 1 && arr[0] === 'none')) {
            return 'None';
        }
        return arr.join(', ');
    }

    function openPopup(pet) {
        document.getElementById('popup-img').src = getImgSrc(pet);
        document.getElementById('popup-img').alt = pet.name;
        document.getElementById('popup-name').textContent = pet.name;
        document.getElementById('popup-type').textContent = pet.type;
        document.getElementById('popup-breed').textContent = pet.breed;
        document.getElementById('popup-age').textContent = pet.age;
        document.getElementById('popup-description').textContent = pet.description;
        document.getElementById('popup-inoculations').textContent = formatList(pet.inoculations);
        document.getElementById('popup-diseases').textContent = formatList(pet.diseases);
        document.getElementById('popup-parasites').textContent = formatList(pet.parasites);

        overlay.classList.add('popup-overlay--visible');
        document.body.classList.add('popup-open');
    }

    function closePopup() {
        overlay.classList.remove('popup-overlay--visible');
        document.body.classList.remove('popup-open');
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card || !card.dataset.petName) return;

        const pet = allPets.find(p => p.name === card.dataset.petName);
        if (pet) openPopup(pet);
    });

    closeBtn.addEventListener('click', closePopup);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
    });

    fetch(PETS_URL)
        .then(res => res.json())
        .then(data => { allPets = data; })
        .catch(err => console.error('Failed to load pets.json for popup', err));
})();