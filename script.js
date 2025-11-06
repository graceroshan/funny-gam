// Game Variables
let gameActive = false;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let birdY = 40;
let birdVelocity = 0;
let gravity = 0.3; // Reduced gravity for smoother movement
let jumpStrength = -7; // Reduced jump strength
let pipes = [];
let pipeSpeed = 3;
let pipeGap = 300;
let pipeFrequency = 2000;
let lastPipeTime = 0;
let gameFrame = 0;

// DOM Elements
const gameWrap = document.getElementById('game');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('overlay');
const title = document.getElementById('title');
const bird = document.getElementById('bird');
const ground = document.getElementById('ground');
const gameOverBox = document.getElementById('gameOverBox');
const currentScoreElement = document.getElementById('currentScore');
const bestScoreElement = document.getElementById('bestScore');
const restartBtn = document.getElementById('restartBtn');
const bgMusic = document.getElementById('bgMusic');
const gameOverSound = document.getElementById('gameOverSound');

// Initialize game
function initGame() {
  // Reset game state
  gameActive = false;
  score = 0;
  birdY = 40;
  birdVelocity = 0;
  pipes = [];
  gameFrame = 0;
  
  // Update UI
  scoreElement.textContent = score;
  bestScoreElement.textContent = bestScore;
  overlay.style.display = 'block';
  title.textContent = 'Press Enter to Start';
  gameOverBox.style.display = 'none';
  
  // Reset bird position and rotation
  updateBirdPosition();
  bird.style.transform = 'rotate(0deg)';
  
  // Remove existing pipes
  document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
}

// Update bird position
function updateBirdPosition() {
  bird.style.top = birdY + '%';
}

// Make bird jump
function jump() {
  if (!gameActive) return;
  birdVelocity = jumpStrength;
  bird.style.transform = 'rotate(-8deg)'; // Very small upward tilt
}

// Update bird physics - SMOOTHER VERSION
function updateBird() {
  if (!gameActive) return;
  
  birdVelocity += gravity;
  birdY += birdVelocity * 0.12; // Reduced movement speed for smoother motion
  
  // Very slow and minimal rotation - SMOOTH ROTATION
  let rotation = Math.min(birdVelocity * 0.5, 30); // Much slower rotation, max 30 degrees
  bird.style.transform = `rotate(${rotation}deg)`;
  
  // Check ground collision
  if (birdY >= 92) {
    gameOver();
    return;
  }
  
  // Check ceiling collision
  if (birdY <= 0) {
    birdY = 0;
    birdVelocity = 0;
  }
  
  updateBirdPosition();
}

// Create a new pipe
function createPipe() {
  const minPipeHeight = 10;
  const maxPipeHeight = 50;
  const pipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight)) + minPipeHeight;
  
  const pipeTop = document.createElement('div');
  const pipeBottom = document.createElement('div');
  
  pipeTop.className = 'pipe';
  pipeBottom.className = 'pipe';
  
  // Top pipe
  pipeTop.style.height = pipeHeight + '%';
  pipeTop.style.top = '0';
  pipeTop.style.left = '100%';
  
  // Bottom pipe - calculate with much larger gap
  const gapPercentage = (pipeGap / window.innerHeight) * 100;
  const bottomPipeHeight = 100 - pipeHeight - gapPercentage;
  pipeBottom.style.height = bottomPipeHeight + '%';
  pipeBottom.style.bottom = '80px';
  pipeBottom.style.left = '100%';
  
  gameWrap.appendChild(pipeTop);
  gameWrap.appendChild(pipeBottom);
  
  pipes.push({
    top: pipeTop,
    bottom: pipeBottom,
    x: window.innerWidth,
    height: pipeHeight,
    passed: false
  });
}

// Update pipes
function updatePipes() {
  if (!gameActive) return;
  
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= pipeSpeed;
    
    pipe.top.style.left = pipe.x + 'px';
    pipe.bottom.style.left = pipe.x + 'px';
    
    // Check if pipe is off screen
    if (pipe.x < -80) {
      pipe.top.remove();
      pipe.bottom.remove();
      pipes.splice(i, 1);
      continue;
    }
    
    // Check for score
    if (!pipe.passed && pipe.x < window.innerWidth * 0.3) {
      pipe.passed = true;
      score++;
      scoreElement.textContent = score;
    }
    
    // Check for collision
    if (checkCollision(pipe)) {
      gameOver();
      return;
    }
  }
}

// Check collision with pipe
function checkCollision(pipe) {
  // Bird dimensions and position
  const birdLeft = window.innerWidth * 0.3;
  const birdRight = birdLeft + 40;
  const birdTop = (birdY / 100) * window.innerHeight;
  const birdBottom = birdTop + 40;
  
  // Top pipe collision
  const pipeTopLeft = pipe.x;
  const pipeTopRight = pipe.x + 80;
  const pipeTopBottom = (pipe.height / 100) * window.innerHeight;
  
  // Bottom pipe collision
  const gapPercentage = (pipeGap / window.innerHeight) * 100;
  const pipeBottomTop = (pipe.height / 100) * window.innerHeight + (gapPercentage / 100) * window.innerHeight;
  
  // Check collision with top pipe
  const topPipeCollision = 
    birdRight > pipeTopLeft + 10 &&
    birdLeft < pipeTopRight - 10 &&
    birdBottom > 0 &&
    birdTop < pipeTopBottom;
  
  // Check collision with bottom pipe
  const bottomPipeCollision = 
    birdRight > pipeTopLeft + 10 &&
    birdLeft < pipeTopRight - 10 &&
    birdTop < window.innerHeight &&
    birdBottom > pipeBottomTop;
  
  return topPipeCollision || bottomPipeCollision;
}

// Game over
function gameOver() {
  gameActive = false;
  
  // Update best score
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
  }
  
  // Update game over screen
  currentScoreElement.textContent = score;
  bestScoreElement.textContent = bestScore;
  gameOverBox.style.display = 'block';
  
  // Play sounds
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
  
  if (gameOverSound) {
    gameOverSound.play().catch(e => console.log('Audio play failed:', e));
  }
}

// Start game
function startGame() {
  if (gameActive) return;
  
  gameActive = true;
  score = 0;
  birdY = 40;
  birdVelocity = 0;
  pipes = [];
  gameFrame = 0;
  
  scoreElement.textContent = score;
  overlay.style.display = 'none';
  gameOverBox.style.display = 'none';
  
  // Remove existing pipes
  document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
  
  // Play background music
  if (bgMusic) {
    bgMusic.play().catch(e => console.log('Audio play failed:', e));
  }
  
  // Start game loop
  gameLoop();
}

// Game loop
function gameLoop() {
  if (!gameActive) return;
  
  gameFrame++;
  
  updateBird();
  updatePipes();
  
  // Create new pipes with slower frequency
  if (gameFrame % Math.floor(pipeFrequency / 16) === 0) {
    createPipe();
  }
  
  requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && !gameActive) {
    if (gameOverBox.style.display === 'block') {
      // If game over screen is showing, restart
      startGame();
    } else {
      // Initial start
      startGame();
    }
  }
  
  if ((e.code === 'Space' || e.code === 'ArrowUp') && gameActive) {
    e.preventDefault();
    jump();
  }
});

restartBtn.addEventListener('click', startGame);

// Also allow click/tap to jump for mobile
gameWrap.addEventListener('click', () => {
  if (gameActive) {
    jump();
  } else if (overlay.style.display === 'block') {
    startGame();
  }
});

// Initialize game on load
window.addEventListener('load', initGame);
window.addEventListener('resize', updateBirdPosition);
