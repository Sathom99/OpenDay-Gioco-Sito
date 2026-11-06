let score = 0;
let timeLeft = 30;
let moleInterval;
let countdownInterval;
let isPlaying = false;
let lastHoleId = -1;
let difficulty = 'medium';
let bestScore = Number(localStorage.getItem('talpa-best-score') || 0);

const difficultySettings = {
    easy: {
        label: 'Facile',
        duration: 35,
        interval: 900,
        activeMoles: 1
    },
    medium: {
        label: 'Medio',
        duration: 30,
        interval: 700,
        activeMoles: 1
    },
    hard: {
        label: 'Difficile',
        duration: 20,
        interval: 500,
        activeMoles: 2
    }
};

const moleTypes = {
    easy: [
        { type: 'normal', emoji: '🐹', points: 1 },
        { type: 'bonus', emoji: '🐰', points: 2 },
        { type: 'sparkle', emoji: '🐭', points: 3 }
    ],
    medium: [
        { type: 'normal', emoji: '🐹', points: 1 },
        { type: 'bonus', emoji: '🐰', points: 2 },
        { type: 'rare', emoji: '🐭', points: 3 }
    ],
    hard: [
        { type: 'normal', emoji: '🐹', points: 1 },
        { type: 'bonus', emoji: '🐰', points: 2 },
        { type: 'rare', emoji: '🐭', points: 3 }
    ]
};

const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const bestScoreDisplay = document.getElementById('best-score');
const finalScoreDisplay = document.getElementById('final-score');
const modal = document.getElementById('game-over-modal');
const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const gameBoard = document.getElementById('game-board');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const holes = document.querySelectorAll('.hole');

function updateBestScoreDisplay() {
    bestScoreDisplay.textContent = bestScore;
}

function updateDifficultyButtons() {
    difficultyButtons.forEach(button => {
        const isActive = button.dataset.difficulty === difficulty;
        button.classList.toggle('scale-105', isActive);
        button.classList.toggle('ring-4', isActive);
        button.classList.toggle('ring-white/80', isActive);
        button.classList.toggle('opacity-100', isActive);
        button.classList.toggle('opacity-70', !isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function setDifficulty(nextDifficulty) {
    difficulty = nextDifficulty;
    updateDifficultyButtons();

    if (!isPlaying) {
        timeLeft = difficultySettings[difficulty].duration;
        timeDisplay.textContent = timeLeft;
        timeDisplay.classList.remove('text-red-600', 'animate-pulse');
    } else {
        startGame();
    }
}

function randomHole(excludedIds = []) {
    const availableIds = [...holes].map((_, index) => index).filter(id => !excludedIds.includes(id));

    if (availableIds.length === 0) {
        return null;
    }

    const id = availableIds[Math.floor(Math.random() * availableIds.length)];
    if (id === lastHoleId && availableIds.length > 1) {
        return randomHole(excludedIds);
    }

    lastHoleId = id;
    return holes[id];
}

function randomMoleType() {
    const types = moleTypes[difficulty];
    const totalWeight = types.length;
    const index = Math.floor(Math.random() * totalWeight);
    return types[index];
}

function peep() {
    if (!isPlaying) return;

    holes.forEach(hole => {
        const mole = hole.querySelector('.mole');
        mole.classList.remove('up', 'whacked', 'bonus', 'rare', 'sparkle', 'normal');
        mole.dataset.points = '1';
        mole.innerText = '🐹';
    });

    const activeMoles = difficultySettings[difficulty].activeMoles;
    const chosenHoles = [];

    for (let i = 0; i < activeMoles; i++) {
        const hole = randomHole(chosenHoles);
        if (!hole) break;

        chosenHoles.push(Number(hole.dataset.id));
        const mole = hole.querySelector('.mole');
        const selectedType = randomMoleType();

        mole.classList.add(selectedType.type);
        mole.dataset.points = String(selectedType.points);
        mole.innerText = selectedType.emoji;
        mole.classList.add('up');
    }
}

function whack(event) {
    if (!isPlaying) return;
    if (!event.isTrusted) return;

    const mole = this.querySelector('.mole');

    if (mole.classList.contains('up') && !mole.classList.contains('whacked')) {
        const points = Number(mole.dataset.points) || 1;
        score += points;
        scoreDisplay.textContent = score;

        mole.innerText = '😵';
        mole.classList.add('whacked');
        mole.classList.remove('up');
    }
}

holes.forEach(hole => {
    hole.addEventListener('mousedown', whack);
    hole.addEventListener('touchstart', (event) => {
        event.preventDefault();
        whack.call(hole, event);
    });
});

function startGame() {
    score = 0;
    timeLeft = difficultySettings[difficulty].duration;
    isPlaying = true;
    lastHoleId = -1;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    modal.classList.add('hidden');
    startBtn.classList.add('hidden');

    gameBoard.classList.remove('opacity-50', 'pointer-events-none');

    clearInterval(moleInterval);
    clearInterval(countdownInterval);

    peep();

    moleInterval = setInterval(peep, difficultySettings[difficulty].interval);

    countdownInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 5) {
            timeDisplay.classList.add('text-red-600', 'animate-pulse');
        } else {
            timeDisplay.classList.remove('text-red-600', 'animate-pulse');
        }

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(moleInterval);
    clearInterval(countdownInterval);

    holes.forEach(hole => {
        hole.querySelector('.mole').classList.remove('up');
    });

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('talpa-best-score', String(bestScore));
    }

    updateBestScoreDisplay();
    gameBoard.classList.add('opacity-50', 'pointer-events-none');

    finalScoreDisplay.textContent = score;
    modal.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
});

updateBestScoreDisplay();
updateDifficultyButtons();
timeDisplay.textContent = difficultySettings[difficulty].duration;
