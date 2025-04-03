const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const images = {
    snake: new Image(),
    egg: new Image(),
    nest: new Image(),
    predator: new Image(),
    jungle: new Image(),
    fullNest: new Image()
};

images.snake.src = 'snake.png';
images.egg.src = 'egg.png';
images.nest.src = 'nest.png';
images.predator.src = 'predator.png';
images.jungle.src = 'jungle.png';
images.fullNest.src = 'fullnest.png';

const tileSize = 50;
let snake = [{ x: 150, y: 150 }];
let snakeDirection = { x: 0, y: 0 };
let eggs = [];
let predator = { x: 550, y: 550 };
let nest = { x: 275, y: 275 };
let collectedEggs = 0;
let gameStarted = false;
let gameOver = false;
let moveDelay = 200;
let lastMoveTime = 0;
let predatorDelay = 700;
let lastPredatorMoveTime = 0;

// Place eggs in 3 corners
function generateEggs() {
    eggs = [
        { x: 50, y: 50 },
        { x: 500, y: 50 },
        { x: 50, y: 500 }
    ];
}

function isColliding(obj1, obj2) {
    return obj1.x === obj2.x && obj1.y === obj2.y;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.jungle, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.nest, nest.x, nest.y, tileSize * 2, tileSize * 2);
    snake.forEach(segment => ctx.drawImage(images.snake, segment.x, segment.y, tileSize, tileSize));
    eggs.forEach(egg => ctx.drawImage(images.egg, egg.x, egg.y, tileSize, tileSize));
    ctx.drawImage(images.predator, predator.x, predator.y, tileSize * 1.5, tileSize * 1.5);
}

function moveSnake() {
    if (gameOver) return;

    let now = performance.now();
    if (now - lastMoveTime < moveDelay) return;
    lastMoveTime = now;

    let head = { x: snake[0].x + snakeDirection.x, y: snake[0].y + snakeDirection.y };
    snake.unshift(head);

    // Check if the snake collects an egg
    for (let i = 0; i < eggs.length; i++) {
        if (isColliding(head, eggs[i])) {
            collectedEggs++;
            eggs.splice(i, 1);
            break;
        }
    }

    // Check if the snake wins
    if (collectedEggs === 3 && isColliding(head, nest)) {
        showWinAnimation();
        return;
    }

    snake.pop();

    // Check if the predator catches the snake
    if (isColliding(head, predator)) {
        alert('Game Over! The predator caught you!');
        resetGame();
    }
}

function movePredator() {
    if (gameOver) return;

    let now = performance.now();
    if (now - lastPredatorMoveTime < predatorDelay) return;
    lastPredatorMoveTime = now;

    if (eggs.length === 0) return;

    let target = eggs[0];

    if (predator.x < target.x) predator.x += tileSize;
    else if (predator.x > target.x) predator.x -= tileSize;

    if (predator.y < target.y) predator.y += tileSize;
    else if (predator.y > target.y) predator.y -= tileSize;
}

function showWinAnimation() {
    gameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.fullNest, nest.x, nest.y, tileSize * 2, tileSize * 2);
    setTimeout(resetGame, 2000);
}

function resetGame() {
    gameStarted = false;
    gameOver = false;
    collectedEggs = 0;
    snake = [{ x: 150, y: 150 }];
    snakeDirection = { x: 0, y: 0 };
    predator = { x: 550, y: 550 };
    generateEggs();
    showInstructions();
}

function gameLoop() {
    if (!gameOver) {
        drawGame();
        moveSnake();
        movePredator();
        requestAnimationFrame(gameLoop);
    }
}

function showInstructions() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("Oh no! The mother snake's eggs have fallen apart!", canvas.width / 2, 100);
    ctx.fillText("Help her pick them up and glue them together!", canvas.width / 2, 140);
    ctx.fillText("Use the arrow keys to move.", canvas.width / 2, 200);
    ctx.fillText("Avoid the red predator!", canvas.width / 2, 240);
    ctx.fillText("Press any key to start!", canvas.width / 2, 280);

    document.addEventListener('keydown', startGame, { once: true });
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    generateEggs();
    gameLoop();
}

document.addEventListener('keydown', (event) => {
    if (!gameStarted || gameOver) return;
    if (event.key === 'ArrowUp') snakeDirection = { x: 0, y: -tileSize };
    if (event.key === 'ArrowDown') snakeDirection = { x: 0, y: tileSize };
    if (event.key === 'ArrowLeft') snakeDirection = { x: -tileSize, y: 0 };
    if (event.key === 'ArrowRight') snakeDirection = { x: tileSize, y: 0 };
});

showInstructions();
