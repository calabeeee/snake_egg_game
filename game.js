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
images.fullNest.src = 'fullnest.png'; // Final win image

const tileSize = 50;
let snake = [{ x: 150, y: 150 }];
let snakeDirection = { up: false, down: false, left: false, right: false };
let eggs = [];
let predator = { x: canvas.width - tileSize, y: canvas.height - tileSize };
let nest = { x: canvas.width / 2 - tileSize, y: canvas.height / 2 - tileSize };
let collectedEggs = 0;
let gameStarted = false;
let gameOver = false;
let moveInterval = 200;
let lastMoveTime = 0;
let predatorMoveInterval = 800;
let lastPredatorMoveTime = 0;

document.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    if (event.key === 'ArrowUp') snakeDirection = { up: true, down: false, left: false, right: false };
    if (event.key === 'ArrowDown') snakeDirection = { up: false, down: true, left: false, right: false };
    if (event.key === 'ArrowLeft') snakeDirection = { up: false, down: false, left: true, right: false };
    if (event.key === 'ArrowRight') snakeDirection = { up: false, down: false, left: false, right: true };
});

function showInstructions() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("Oh no! The mother snake's eggs have fallen apart!", canvas.width / 2, 100);
    ctx.fillText("Help her pick them up and glue them together!", canvas.width / 2, 140);
    ctx.fillText("Use the arrow keys to move.", canvas.width / 2, 200);
    ctx.fillText("Avoid the red predator snake!", canvas.width / 2, 240);
    ctx.fillText("Collect all eggs and bring them to the nest!", canvas.width / 2, 280);
    ctx.fillText("Press any key to start!", canvas.width / 2, 320);

    document.addEventListener('keydown', startGame, { once: true });
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    collectedEggs = 0;
    snake = [{ x: 150, y: 150 }];
    predator = { x: canvas.width - tileSize, y: canvas.height - tileSize };
    snakeDirection = { up: false, down: false, left: false, right: false };
    generateEggs();
    lastMoveTime = performance.now();
    gameLoop();
}

function generateEggs() {
    const buffer = 80; // Move eggs inward from the edges
    eggs = [
        { x: buffer, y: buffer },
        { x: canvas.width - buffer - tileSize, y: buffer },
        { x: canvas.width - buffer - tileSize, y: canvas.height - buffer - tileSize }
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
    ctx.drawImage(images.predator, predator.x, predator.y, tileSize * 1.5, tileSize * 1.5); // Predator is larger
}

function moveSnake() {
    let now = performance.now();
    if (now - lastMoveTime < moveInterval) return;
    lastMoveTime = now;

    let head = { ...snake[0] };

    if (snakeDirection.up) head.y -= tileSize;
    if (snakeDirection.down) head.y += tileSize;
    if (snakeDirection.left) head.x -= tileSize;
    if (snakeDirection.right) head.x += tileSize;

    snake.unshift(head);

    for (let i = 0; i < eggs.length; i++) {
        if (isColliding(head, eggs[i])) {
            collectedEggs++;
            eggs.splice(i, 1);
            break;
        }
    }

    if (collectedEggs === 3 && isColliding(head, nest)) {
        showWinAnimation();
        return;
    }

    snake.pop();

    if (isColliding(head, predator)) {
        alert('Game Over! The predator caught you!');
        resetGame();
    }
}

function movePredator() {
    let now = performance.now();
    if (now - lastPredatorMoveTime < predatorMoveInterval) return;
    lastPredatorMoveTime = now;

    if (eggs.length === 0) return;

    let target = eggs[0]; 

    if (predator.x < target.x) predator.x += tileSize;
    if (predator.x > target.x) predator.x -= tileSize;
    if (predator.y < target.y) predator.y += tileSize;
    if (predator.y > target.y) predator.y -= tileSize;
}

function showWinAnimation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.fullNest, nest.x, nest.y, tileSize * 2, tileSize * 2);
    setTimeout(resetGame, 1500);
}

function resetGame() {
    gameStarted = false;
    gameOver = false;
    showInstructions();
}

function gameLoop() {
    if (gameOver) return;
    drawGame();
    moveSnake();
    movePredator();
    requestAnimationFrame(gameLoop);
}

showInstructions();
