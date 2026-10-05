const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game State Management
let gameState = "START"; // "START", "PLAYING", "GAMEOVER"
let score = 0;
let highScore = localStorage.getItem("flappy_highscore") || 0;
let frameCount = 0;

// Bird Engine
const bird = {
    x: 80,
    y: 250,
    width: 34,
    height: 24,
    gravity: 0.25,
    lift: -5.5,
    velocity: 0,
    rotation: 0,
    
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Calculate rotation tilt based on movement speed
        this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity / 10)));

        // Ground limit check
        if (this.y + this.height >= canvas.height - 50) {
            this.y = canvas.height - 50 - this.height;
            endGame();
        }

        // Ceiling limit check
        if (this.y <= 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },

    jump() {
        this.velocity = this.lift;
    },

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Draw Bird Body
        ctx.fillStyle = "#ffeb3b";
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw Eye
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(6, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(7, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw Beak
        ctx.fillStyle = "#ff9800";
        ctx.fillRect(6, 2, 12, 8);

        ctx.restore();
    },

    reset() {
        this.y = 250;
        this.velocity = 0;
        this.rotation = 0;
    }
};

// Pipes Engine
const pipes = [];
const pipeWidth = 60;
const pipeGap = 120;
const pipeSpeed = 2;

function createPipe() {
    const topHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 150)) + 40;
    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - topHeight - pipeGap - 50,
        passed: false
    });
}

function updatePipes() {
    if (frameCount % 120 === 0) {
        createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Check if bird passed the pipe to add score
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            document.getElementById("score-display").innerText = score;
        }

        // Check Collisions
        if (
            bird.x + bird.width > pipes[i].x &&
            bird.x < pipes[i].x + pipeWidth &&
            (bird.y < pipes[i].top || bird.y + bird.height > canvas.height - 50 - pipes[i].bottom)
        ) {
            endGame();
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function drawPipes() {
    ctx.fillStyle = "#4caf50";
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 3;

    pipes.forEach(pipe => {
        // Top Pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);

        // Bottom Pipe
        const bottomY = canvas.height - 50 - pipe.bottom;
        ctx.fillRect(pipe.x, bottomY, pipeWidth, pipe.bottom);
        ctx.strokeRect(pipe.x, bottomY, pipeWidth, pipe.bottom);
    });
}

// Background & Environment
function drawEnvironment() {
    // Draw Ground
    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    ctx.fillStyle = "#73bf2e";
    ctx.fillRect(0, canvas.height - 50, canvas.width, 12);
}

// Main Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawEnvironment();

    if (gameState === "PLAYING") {
        bird.update();
        updatePipes();
        frameCount++;
    }

    drawPipes();
    bird.draw();

    requestAnimationFrame(gameLoop);
}

// Control Functions
function startGame() {
    gameState = "PLAYING";
    score = 0;
    frameCount = 0;
    pipes.length = 0;
    bird.reset();

    document.getElementById("score-display").innerText = "0";
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("game-over-screen").classList.add("hidden");
}

function endGame() {
    gameState = "GAMEOVER";
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("flappy_highscore", highScore);
    }

    document.getElementById("final-score").innerText = score;
    document.getElementById("best-score").innerText = highScore;
    document.getElementById("game-over-screen").classList.remove("hidden");
}

// Event Listeners
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (gameState === "PLAYING") bird.jump();
    }
});

canvas.addEventListener("click", () => {
    if (gameState === "PLAYING") bird.jump();
});

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("restart-btn").addEventListener("click", startGame);

// Start the loop
gameLoop();