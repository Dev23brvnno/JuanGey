// Configuración de particles.js
particlesJS('particles-js', {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 6,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab"
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});

const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');
const statsBody = document.getElementById('statsBody');
const difficultySelect = document.getElementById('difficultySelect');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

let score = 0;
let enemies = [];
let gameLoop;
let spawnInterval;
let difficulty = 1;
let spawnRate = 1000; // Tiempo inicial entre la generación de enemigos (en milisegundos)
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let isGameRunning = false;

function updatePlayerPosition(e) {
    const rect = gameContainer.getBoundingClientRect();
    let x = e.clientX - rect.left - player.offsetWidth / 2;
    let y = e.clientY - rect.top - player.offsetHeight / 2;

    x = Math.max(0, Math.min(x, gameContainer.offsetWidth - player.offsetWidth));
    y = Math.max(0, Math.min(y, gameContainer.offsetHeight - player.offsetHeight));

    player.style.left = x + 'px';
    player.style.top = y + 'px';
}

function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    const side = Math.floor(Math.random() * 4);
    switch(side) {
        case 0: // top
            enemy.style.left = Math.random() * gameContainer.offsetWidth + 'px';
            enemy.style.top = '-20px';
            break;
        case 1: // right
            enemy.style.left = gameContainer.offsetWidth + 'px';
            enemy.style.top = Math.random() * gameContainer.offsetHeight + 'px';
            break;
        case 2: // bottom
            enemy.style.left = Math.random() * gameContainer.offsetWidth + 'px';
            enemy.style.top = gameContainer.offsetHeight + 'px';
            break;
        case 3: // left
            enemy.style.left = '-20px';
            enemy.style.top = Math.random() * gameContainer.offsetHeight + 'px';
            break;
    }
    gameContainer.appendChild(enemy);
    enemies.push({element: enemy, side: side});
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        const speed = 2 + difficulty;
        switch(enemy.side) {
            case 0: // top
                enemy.element.style.top = (parseFloat(enemy.element.style.top) + speed) + 'px';
                break;
            case 1: // right
                enemy.element.style.left = (parseFloat(enemy.element.style.left) - speed) + 'px';
                break;
            case 2: // bottom
                enemy.element.style.top = (parseFloat(enemy.element.style.top) - speed) + 'px';
                break;
            case 3: // left
                enemy.element.style.left = (parseFloat(enemy.element.style.left) + speed) + 'px';
                break;
        }
        
        if (isOutOfBounds(enemy.element)) {
            gameContainer.removeChild(enemy.element);
            enemies.splice(index, 1);
            score++;
            scoreElement.textContent = `Puntos: ${score}`;
            
            if (score % 10 === 0) {
                increaseDifficulty();
            }

            if (score % 500 === 0) {
                showMessage("WENA WEON 500");
            }
        }

        if (checkCollision(player, enemy.element)) {
            endGame();
        }
    });
}

function isOutOfBounds(element) {
    const rect = element.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    return (
        rect.bottom < containerRect.top ||
        rect.top > containerRect.bottom ||
        rect.right < containerRect.left ||
        rect.left > containerRect.right
    );
}

function checkCollision(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
        aRect.top + aRect.height < bRect.top ||
        aRect.top > bRect.top + bRect.height ||
        aRect.left + aRect.width < bRect.left ||
        aRect.left > bRect.left + bRect.width
    );
}

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 2000);
}

function endGame() {
    isGameRunning = false;
    clearInterval(gameLoop);
    clearInterval(spawnInterval);
    showMessage("Juego terminado");
    updateHighScores();
    restartButton.style.display = 'block';
}

function updateHighScores() {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    displayHighScores();
}

function displayHighScores() {
    statsBody.innerHTML = '';
    highScores.forEach((score, index) => {
        const row = statsBody.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = score;
    });
}

function increaseDifficulty() {
    difficulty += 0.5;
    spawnRate = Math.max(100, spawnRate - 50); // Reduce el tiempo entre la generación de enemigos, con un mínimo de 100ms
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnEnemy, spawnRate);
    showMessage("¡Dificultad aumentada!");
}

function resetGame() {
    score = 0;
    difficulty = getDifficultyValue();
    spawnRate = 1000;
    scoreElement.textContent = "Puntos: 0";
    enemies.forEach(enemy => gameContainer.removeChild(enemy.element));
    enemies = [];
    restartButton.style.display = 'none';
    startButton.style.display = 'block';
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    difficulty = getDifficultyValue();
    spawnRate = 1000;
    gameLoop = setInterval(moveEnemies, 20);
    spawnInterval = setInterval(spawnEnemy, spawnRate);
    startButton.style.display = 'none';
}

function getDifficultyValue() {
    switch(difficultySelect.value) {
        case 'easy': return 1;
        case 'medium': return 2;
        case 'hard': return 3;
        default: return 1;
    }
}

gameContainer.addEventListener('mousemove', updatePlayerPosition);
gameContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updatePlayerPosition(e.touches[0]);
});

difficultySelect.addEventListener('change', resetGame);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);

displayHighScores();