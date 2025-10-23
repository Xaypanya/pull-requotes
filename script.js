// Board state
let allQuotes = [];
const profileCache = {};
let cards = [];
let searchTerm = '';

// Camera/View state
let offsetX = 0;
let offsetY = 0;

// Auto-scroll state
let autoScrollInterval = null;
let currentCardIndex = 0;
let isAutoScrolling = false;
let restartTimeout = null;
let canAutoScroll = false;

// Card dimensions (responsive)
function getCardDimensions() {
    const width = window.innerWidth;
    if (width <= 480) {
        return { width: 240, height: 280, spacing: 350 };
    } else if (width <= 768) {
        return { width: 280, height: 320, spacing: 400 };
    }
    return { width: 450, height: 380, spacing: 500 };
}

let CARD_WIDTH = getCardDimensions().width;
let CARD_HEIGHT = getCardDimensions().height;
let GRID_SPACING = getCardDimensions().spacing;

// Mouse/Touch state
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffsetX = 0;
let dragStartOffsetY = 0;
let lastTouchDistance = 0;

// DOM elements
const board = document.getElementById('board');
const cardsContainer = document.getElementById('cards-container');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');

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

// Filter quotes based on search term
function getFilteredQuotes() {
    if (!searchTerm) return allQuotes;
    const term = searchTerm.toLowerCase();
    return allQuotes.filter(q => 
        q.quote.toLowerCase().includes(term) ||
        q.githubUsername.toLowerCase().includes(term) ||
        (q.date && q.date.includes(term))
    );
}

// Generate card positions in a grid
function generateCards() {
    cards = [];
    const filteredQuotes = getFilteredQuotes();

    // Responsive column count based on screen width
    const width = window.innerWidth;
    let cols;
    if (width <= 480) {
        cols = 2; // Two columns on mobile
    } else if (width <= 768) {
        cols = 2; // Two columns on tablet
    } else {
        cols = 4; // Four columns on desktop
    }

    const rows = Math.ceil(filteredQuotes.length / cols);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cardIndex = row * cols + col;

            if (cardIndex >= filteredQuotes.length) {
                continue;
            }

            const quote = filteredQuotes[cardIndex];

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

    createCardElements();
    centerAllCards();
    updateCardPositions();
    
    // Start auto-scroll if cards fit on screen
    checkAndStartAutoScroll();
}

// Create card DOM elements
function createCardElements() {
    cardsContainer.innerHTML = '';

    cards.forEach((card, cardIndex) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'quote-card';

        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <button class="copy-btn" title="Copy quote">📋</button>
                    <div class="quote-text">"${card.quote.quote}"</div>
                    <div class="quote-author">— @${card.quote.githubUsername}</div>
                    <div class="flip-hint">Click to flip</div>
                </div>
                <div class="card-back">
                    <div class="profile">
                        <a href="https://github.com/${card.quote.githubUsername}" target="_blank" class="profile-avatar-link">
                            <img class="profile-avatar" src="https://github.com/${card.quote.githubUsername}.png" alt="${card.quote.githubUsername}" onerror="this.src='img/pull-requotes.png'; this.classList.add('placeholder');">
                        </a>
                        <div class="profile-info">
                            <a href="https://github.com/${card.quote.githubUsername}" target="_blank" class="profile-name-link">
                                <div class="profile-name">Loading...</div>
                            </a>
                        </div>
                    </div>
                    ${card.quote.date ? `<div class="quote-date">${card.quote.date}</div>` : ''}
                </div>
            </div>
        `;

        // Copy button functionality
        const copyBtn = cardEl.querySelector('.copy-btn');
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(card.quote.quote);
            copyBtn.textContent = '✓';
            setTimeout(() => copyBtn.textContent = '📋', 1500);
        });

        // Card flip functionality
        cardEl.addEventListener('click', (e) => {
            if (!e.target.closest('.copy-btn, .profile-avatar-link, .profile-name-link')) {
                cardEl.classList.toggle('flipped');
            }
        });

        // Add staggered animation delay
        cardEl.style.animationDelay = `${cardIndex * 0.1}s`;
        
        card.element = cardEl;
        cardsContainer.appendChild(cardEl);
    });

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

// Center view to show all cards
function centerAllCards() {
    if (cards.length === 0) return;
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    cards.forEach(card => {
        minX = Math.min(minX, card.x);
        maxX = Math.max(maxX, card.x + card.width);
        minY = Math.min(minY, card.y);
        maxY = Math.max(maxY, card.y + card.height);
    });
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;
    
    offsetX = windowCenterX - centerX;
    offsetY = windowCenterY - centerY;
}

// Fetch GitHub profiles and repos
async function fetchProfiles() {
    for (const card of cards) {
        const username = card.quote.githubUsername;
        const profileNameEl = card.element.querySelector('.profile-name');

        // If profile is cached, display it immediately
        if (profileCache[username]) {
            const profile = profileCache[username];
            if (profileNameEl) {
                const stats = [];
                stats.push(`⭐ ${profile.totalStars}`);
                stats.push(`📦 ${profile.publicRepos}`);
                if (profile.topLanguages.length > 0) {
                    stats.push(`🗿 ${profile.topLanguages.join(', ')}`);
                }
                profileNameEl.innerHTML = `<div class="profile-display-name">${profile.name || username}</div><div class="profile-stats">${stats.join(' • ')}</div>`;
            }
        } else {
            // Only fetch if not cached
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
    stopAutoScroll(); // Stop auto-scroll when user interacts
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
    checkAndReturnToCards();
});

// Touch events
board.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        stopAutoScroll(); // Stop auto-scroll when user interacts
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
        dragStartOffsetX = offsetX;
        dragStartOffsetY = offsetY;
    }
}, { passive: true });

board.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartX;
        const deltaY = e.touches[0].clientY - dragStartY;
        offsetX = dragStartOffsetX + deltaX;
        offsetY = dragStartOffsetY + deltaY;
        updateCardPositions();
    }
}, { passive: true });

board.addEventListener('touchend', () => {
    isDragging = false;
    checkAndReturnToCards();
}, { passive: true });

// Handle window resize
window.addEventListener('resize', () => {
    const dimensions = getCardDimensions();
    CARD_WIDTH = dimensions.width;
    CARD_HEIGHT = dimensions.height;
    GRID_SPACING = dimensions.spacing;

    // Regenerate cards with new dimensions
    generateCards();
});

// Create emoji background pattern
function createEmojiPattern() {
    const emojiPattern = document.createElement('div');
    emojiPattern.id = 'emoji-pattern';
    emojiPattern.style.cssText = `
        position: fixed;
        top: -50%;
        left: -50%;
        width: 200vw;
        height: 200vh;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        opacity: 0.05;
        transform: rotate(30deg);
        transform-origin: center center;
    `;

    const emojis = ['💻', '⭐', '🚀', '💡', '🎨', '🔧', '⚡', '📦', '🐙', '✨'];
    const cols = Math.ceil(window.innerWidth * 2 / 80);
    const rows = Math.ceil(window.innerHeight * 2 / 80);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const emoji = document.createElement('span');
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            const rotation = (Math.random() - 0.5) * 60; // Random rotation between -30 and 30 degrees
            emoji.style.cssText = `
                position: absolute;
                left: ${j * 80}px;
                top: ${i * 80}px;
                font-size: 30px;
                user-select: none;
                transform: rotate(${rotation}deg);
            `;
            emojiPattern.appendChild(emoji);
        }
    }

    document.body.insertBefore(emojiPattern, document.body.firstChild);
}

// Theme toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.target === searchInput) return;
    
    const step = 100;
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            stopAutoScroll(); // Stop auto-scroll when user navigates
            offsetY += step;
            updateCardPositions();
            break;
        case 'ArrowDown':
            e.preventDefault();
            stopAutoScroll();
            offsetY -= step;
            updateCardPositions();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            stopAutoScroll();
            offsetX += step;
            updateCardPositions();
            break;
        case 'ArrowRight':
            e.preventDefault();
            stopAutoScroll();
            offsetX -= step;
            updateCardPositions();
            break;
        case ' ':
            e.preventDefault();
            stopAutoScroll();
            focusRandomCard();
            updateCardPositions();
            break;
        case 'Escape':
            searchInput.value = '';
            searchTerm = '';
            generateCards();
            break;
        case '/':
            e.preventDefault();
            searchInput.focus();
            break;
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    generateCards();
});

// Background confetti easter egg
function createConfetti() {
    const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f'];
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Background single-click for confetti
board.addEventListener('click', (e) => {
    if (e.target === board || e.target === cardsContainer) {
        createConfetti();
    }
});

// Auto-scroll functionality
function checkAndStartAutoScroll() {
    stopAutoScroll();
    
    if (cards.length === 0) return;
    
    // Check if all cards can fit on screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    cards.forEach(card => {
        minX = Math.min(minX, card.x);
        maxX = Math.max(maxX, card.x + card.width);
        minY = Math.min(minY, card.y);
        maxY = Math.max(maxY, card.y + card.height);
    });
    
    const totalWidth = maxX - minX;
    const totalHeight = maxY - minY;
    
    // Enable auto-scroll for all screen sizes if there are more than 2 cards
    if (cards.length > 2) {
        canAutoScroll = true;
        startAutoScroll();
    } else {
        canAutoScroll = false;
    }
}

function startAutoScroll() {
    if (isAutoScrolling || cards.length <= 1) return;
    
    isAutoScrolling = true;
    currentCardIndex = 0;
    
    autoScrollInterval = setInterval(() => {
        // Check if all cards are already visible
        if (areAllCardsVisible()) {
            stopAutoScroll();
            return;
        }
        
        focusOnCard(currentCardIndex);
        currentCardIndex = (currentCardIndex + 1) % cards.length;
    }, 4000); // Change card every 4 seconds
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
    isAutoScrolling = false;
    
    // Clear any existing restart timeout
    if (restartTimeout) {
        clearTimeout(restartTimeout);
    }
    
    // Set timeout to restart auto-scroll after 5 seconds of inactivity
    if (canAutoScroll) {
        restartTimeout = setTimeout(() => {
            startAutoScroll();
        }, 5000);
    }
}

function focusOnCard(index) {
    if (index >= cards.length) return;
    
    const card = cards[index];
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;
    
    // Calculate offset to center the card with smooth transition
    const targetOffsetX = windowCenterX - (card.x + CARD_WIDTH / 2);
    const targetOffsetY = windowCenterY - (card.y + CARD_HEIGHT / 2);
    
    // Smooth transition
    const startOffsetX = offsetX;
    const startOffsetY = offsetY;
    const duration = 2000; // 2 second transition
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smoother easing function (ease-in-out)
        const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        offsetX = startOffsetX + (targetOffsetX - startOffsetX) * easeProgress;
        offsetY = startOffsetY + (targetOffsetY - startOffsetY) * easeProgress;
        
        updateCardPositions();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Check if user is in empty space and return to cards
function checkAndReturnToCards() {
    if (cards.length === 0) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Check if any card is visible in viewport
    let hasVisibleCard = false;
    
    for (const card of cards) {
        const cardLeft = card.x + offsetX;
        const cardRight = cardLeft + card.width;
        const cardTop = card.y + offsetY;
        const cardBottom = cardTop + card.height;
        
        // Check if card overlaps with viewport
        if (cardRight > 0 && cardLeft < viewportWidth && 
            cardBottom > 0 && cardTop < viewportHeight) {
            hasVisibleCard = true;
            break;
        }
    }
    
    // If no cards are visible, smoothly return to center immediately
    if (!hasVisibleCard) {
        const startOffsetX = offsetX;
        const startOffsetY = offsetY;
        
        // Calculate target position to center all cards
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        cards.forEach(card => {
            minX = Math.min(minX, card.x);
            maxX = Math.max(maxX, card.x + card.width);
            minY = Math.min(minY, card.y);
            maxY = Math.max(maxY, card.y + card.height);
        });
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const windowCenterX = window.innerWidth / 2;
        const windowCenterY = window.innerHeight / 2;
        
        const targetOffsetX = windowCenterX - centerX;
        const targetOffsetY = windowCenterY - centerY;
        
        const duration = 1000;
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            offsetX = startOffsetX + (targetOffsetX - startOffsetX) * easeProgress;
            offsetY = startOffsetY + (targetOffsetY - startOffsetY) * easeProgress;
            
            updateCardPositions();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
}

// Check if all cards are visible in viewport
function areAllCardsVisible() {
    if (cards.length === 0) return true;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    for (const card of cards) {
        const cardLeft = card.x + offsetX;
        const cardRight = cardLeft + card.width;
        const cardTop = card.y + offsetY;
        const cardBottom = cardTop + card.height;
        
        // If any card is not fully visible, return false
        if (cardLeft < 0 || cardRight > viewportWidth || 
            cardTop < 0 || cardBottom > viewportHeight) {
            return false;
        }
    }
    
    return true;
}

// Initialize
initTheme();
createEmojiPattern();
loadQuotes();