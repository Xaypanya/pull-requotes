// Board state
let allQuotes = [];
const profileCache = {};
let cards = [];

// Camera/View state
let offsetX = 0;
let offsetY = 0;

// Card dimensions
const CARD_WIDTH = 450;
const CARD_HEIGHT = 380;
const GRID_SPACING = 500;

// Mouse state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffsetX = 0;
let dragStartOffsetY = 0;

// DOM elements
const board = document.getElementById('board');
const cardsContainer = document.getElementById('cards-container');
const loading = document.getElementById('loading');

// Fetch quotes from JSON
async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        allQuotes = await response.json();

        // Generate cards
        generateCards();
        loading.classList.add('hide');
    } catch (error) {
        console.error('Error loading quotes:', error);
        loading.textContent = 'Error loading quotes';
    }
}

// Generate card positions in a grid
function generateCards() {
    cards = [];
    const cols = 4;
    const rows = 4;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cardIndex = row * cols + col;

            // Stop if we've used all available quotes
            if (cardIndex >= allQuotes.length) {
                continue;
            }

            const quote = allQuotes[cardIndex];

            const x = col * GRID_SPACING;
            const y = row * GRID_SPACING;
            const rotation = (Math.sin(col * 1.5) * Math.cos(row * 2) * 0.05);

            cards.push({
                x,
                y,
                quote,
                rotation,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                element: null
            });
        }
    }

    // Create DOM elements for cards
    createCardElements();
    focusRandomCard();
    updateCardPositions();
}

// Create card DOM elements
function createCardElements() {
    cardsContainer.innerHTML = '';

    for (const card of cards) {
        const cardEl = document.createElement('div');
        cardEl.className = 'quote-card';

        cardEl.innerHTML = `
            <div class="quote-text">"${card.quote.quote}"</div>
            <div class="quote-author">— @${card.quote.githubUsername}</div>
            <div class="profile">
                <a href="https://github.com/${card.quote.githubUsername}" target="_blank" class="profile-avatar-link">
                    <img class="profile-avatar" src="https://github.com/${card.quote.githubUsername}.png" alt="${card.quote.githubUsername}">
                </a>
                <div class="profile-info">
                    <a href="https://github.com/${card.quote.githubUsername}" target="_blank" class="profile-name-link">
                        <div class="profile-name">Loading...</div>
                    </a>
                </div>
                <div class="quote-date">${card.quote.date || ''}</div>
            </div>
        `;

        card.element = cardEl;
        cardsContainer.appendChild(cardEl);
    }

    // Fetch GitHub profiles
    fetchProfiles();
}

// Focus on a random card on load
function focusRandomCard() {
    const randomIndex = Math.floor(Math.random() * cards.length);
    const randomCard = cards[randomIndex];

    // Center the board view on the random card
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;

    // Calculate offset to center the card
    offsetX = windowCenterX - (randomCard.x + CARD_WIDTH / 2);
    offsetY = windowCenterY - (randomCard.y + CARD_HEIGHT / 2);
}

// Fetch GitHub profiles and repos
async function fetchProfiles() {
    for (const card of cards) {
        const username = card.quote.githubUsername;
        if (!profileCache[username]) {
            try {
                // Fetch user profile
                const userResponse = await fetch(`https://api.github.com/users/${username}`);
                const profile = await userResponse.json();

                // Fetch user repos for stars and languages
                const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=100`);
                const repos = await reposResponse.json();

                // Calculate total stars and collect languages
                let totalStars = 0;
                const languages = new Set();

                if (Array.isArray(repos)) {
                    repos.forEach(repo => {
                        if (repo.stargazers_count) {
                            totalStars += repo.stargazers_count;
                        }
                        if (repo.language) {
                            languages.add(repo.language);
                        }
                    });
                }

                profile.totalStars = totalStars;
                profile.topLanguages = Array.from(languages).slice(0, 3);
                profile.publicRepos = profile.public_repos || 0;

                profileCache[username] = profile;

                // Update card with profile info
                const profileNameEl = card.element.querySelector('.profile-name');
                if (profileNameEl) {
                    const stats = [];
                    stats.push(`⭐ ${profile.totalStars}`);
                    stats.push(`📦 ${profile.publicRepos}`);
                    if (profile.topLanguages.length > 0) {
                        stats.push(`🗿 ${profile.topLanguages.join(', ')}`);
                    }
                    profileNameEl.innerHTML = `<div class="profile-display-name">${profile.name || username}</div><div class="profile-stats">${stats.join(' • ')}</div>`;
                }

            } catch (error) {
                console.error(`Error fetching profile for ${username}:`, error);
                // Update with fallback if API fails
                const profileNameEl = card.element.querySelector('.profile-name');
                if (profileNameEl) {
                    profileNameEl.innerHTML = `<div class="profile-display-name">${username}</div>`;
                }
            }
        }
    }
}

// Update card positions based on offset
function updateCardPositions() {
    for (const card of cards) {
        if (card.element) {
            const x = card.x + offsetX;
            const y = card.y + offsetY;

            card.element.style.left = x + 'px';
            card.element.style.top = y + 'px';
            card.element.style.transform = `rotate(${card.rotation}rad)`;
            card.element.style.setProperty('--rotation', `${(card.rotation * 180) / Math.PI}deg`);
        }
    }
}

// Mouse events
board.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartOffsetX = offsetX;
    dragStartOffsetY = offsetY;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        offsetX = dragStartOffsetX + deltaX;
        offsetY = dragStartOffsetY + deltaY;

        updateCardPositions();
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    updateCardPositions();
});

// Initialize
loadQuotes();
