const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");

const audio = new Audio("./audio.mp3");

const size = 30;
const speed = 130;

let snake;
let direction;
let loopId;
let food;
let isGameOver = false;

/* ================== UTIL ================== */

function incrementScore() {
    score.innerText = String(+score.innerText + 10).padStart(2, "0");
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPosition() {
    const pos = randomNumber(0, canvas.width - size);
    return Math.round(pos / size) * size;
}

function randomColor() {
    return `rgb(${randomNumber(0,255)}, ${randomNumber(0,255)}, ${randomNumber(0,255)})`;
}

/* ================== FOOD ================== */

function createFood() {
    let x, y;
    do {
        x = randomPosition();
        y = randomPosition();
    } while (snake.some(s => s.x === x && s.y === y));

    food = { x, y, color: randomColor() };
}

/* ================== DRAW ================== */

function drawGrid() {
    ctx.strokeStyle = "#222";
    for (let i = size; i < canvas.width; i += size) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function drawFood() {
    ctx.fillStyle = food.color;
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 6;
    ctx.fillRect(food.x, food.y, size, size);
    ctx.shadowBlur = 0;
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === snake.length - 1 ? "#fff" : "#ccc";
        ctx.fillRect(segment.x, segment.y, size, size);
    });
}

/* ================== GAME ================== */

function moveSnake() {
    if (!direction) return;

    const head = { ...snake[snake.length - 1] };

    if (direction === "right") head.x += size;
    if (direction === "left") head.x -= size;
    if (direction === "up") head.y -= size;
    if (direction === "down") head.y += size;

    // 👉 decide se vai comer ANTES
    const ateFood = head.x === food.x && head.y === food.y;

    snake.push(head);

    if (ateFood) {
        audio.currentTime = 0;
        audio.play();
        incrementScore();
        createFood();
    } else {
        snake.shift();
    }
}

function checkCollision() {
    const head = snake[snake.length - 1];

    const hitWall =
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height;

    const hitSelf = snake
        .slice(0, -1)
        .some(segment => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) gameOver();
}

function gameOver() {
    isGameOver = true;
    direction = null;
    menu.style.display = "flex";
    finalScore.innerText = score.innerText;
    canvas.style.filter = "blur(3px)";
}

/* ================== LOOP ================== */

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    moveSnake();
    checkCollision();
    drawFood();
    drawSnake();

    if (!isGameOver) {
        loopId = setTimeout(gameLoop, speed);
    }
}

/* ================== INIT ================== */

function startGame() {
    score.innerText = "00";
    snake = [{ x: 270, y: 240 }];
    direction = null;
    isGameOver = false;
    canvas.style.filter = "none";
    menu.style.display = "none";

    createFood();
    gameLoop();
}

startGame();

/* ================== CONTROLS ================== */

document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" && direction !== "left") direction = "right";
    if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
    if (e.key === "ArrowUp" && direction !== "down") direction = "up";
    if (e.key === "ArrowDown" && direction !== "up") direction = "down";
});

buttonPlay.addEventListener("click", startGame);
