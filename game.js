const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const images = {
    snake: new Image(),
    egg: new Image(),
    nest: new Image(),
    predator: new Image(),
    jungle: new Image()
};

images.snake.src = 'snake.png'; // Path to the snake image
images.egg.src = 'egg.png'; // Path to the egg image
images.nest.src = 'nest.png'; // Path to the nest image
images.predator.src = 'predator.png'; // Path to the predator image
images.jungle.src = 'jungle.png'; // Path to the jungle background image

const tileSize = 50;
let snake = [{ x: 100, y: 100 }];
let snakeDirection = null; // No auto movement
let eggs = [];
let predator = { x: 400, y: 300 };
let nest = { x: canvas.width / 2 - tileSize, y: canvas.height / 2 - tileSize };
let collectedEggs = 0;
let gameStarted = false;
let gameOver = false;
let moveInterval = 250;
let lastMoveTime = 0;
let predatorMoveInterval = 500;
let lastPredatorMoveTime = 0;

document.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    const key = event.key;
    if (key === 'ArrowUp' && snakeDirection !== 'DOWN') snakeDirection = 'UP';
    if (key === 'ArrowDown' && snakeDirection !== 'UP') snakeDirection = 'DOWN';
    if (key === 'ArrowLeft' && snakeDirection !== 'RIGHT') snakeDirection = 'LEFT';
    if (key === 'ArrowRight' && snakeDirection !== 'LEFT') snakeDirection = 'RIGHT';
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
    snake = [{ x: 100, y: 100 }];
    predator = { x: 400, y: 300 };
    snakeDirection = null;
    generateEggs();
    lastMoveTime = performance.now();
    gameLoop();
}

function generateEggs() {
    eggs = [];
    while (eggs.length < 4) {
        let newEgg = {
            x: Math.floor(Math.random() * (canvas.width / tileSize)) * tileSize,
            y: Math.floor(Math.random() * (canvas.height / tileSize)) * tileSize
        };
        if (!isColliding(newEgg, nest) && !isColliding(newEgg, predator)) {
            eggs.push(newEgg);
        }
    }
}

function isColliding(obj1, obj2) {
    return obj1.x === obj2.x && obj1.y === obj2.y;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.jungle, 0, 0, canvas.width, canvas.height); // Background
    ctx.drawImage(images.nest, nest.x, nest.y, tileSize * 2, tileSize * 2); // Nest
    snake.forEach(segment => ctx.drawImage(images.snake, segment.x, segment.y, tileSize, tileSize)); // Snake
    eggs.forEach(egg => ctx.drawImage(images.egg, egg.x, egg.y, tileSize, tileSize)); // Eggs
    ctx.drawImage(images.predator, predator.x, predator.y, tileSize, tileSize); // Predator
}

function moveSnake() {
    let now = performance.now();
    if (now - lastMoveTime < moveInterval) return;
    lastMoveTime = now;

    if (!snakeDirection) return;

    let head = { ...snake[0] };

    if (snakeDirection === 'UP') head.y -= tileSize;
    if (snakeDirection === 'DOWN') head.y += tileSize;
    if (snakeDirection === 'LEFT') head.x -= tileSize;
    if (snakeDirection === 'RIGHT') head.x += tileSize;

    snake.unshift(head);

    for (let i = 0; i < eggs.length; i++) {
        if (isColliding(head, eggs[i])) {
            collectedEggs++;
            eggs.splice(i, 1);
            break;
        }
    }

    if (collectedEggs === 4 && isColliding(head, nest)) {
        setTimeout(showWinMessage, 500);
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

    let nearestEgg = eggs.reduce((closest, egg) => {
        let dist = Math.abs(predator.x - egg.x) + Math.abs(predator.y - egg.y);
        let closestDist = Math.abs(predator.x - closest.x) + Math.abs(predator.y - closest.y);
        return dist < closestDist ? egg : closest;
    });

    if (predator.x < nearestEgg.x) predator.x += tileSize;
    if (predator.x > nearestEgg.x) predator.x -= tileSize;
    if (predator.y < nearestEgg.y) predator.y += tileSize;
    if (predator.y > nearestEgg.y) predator.y -= tileSize;
}

function showWinMessage() {
    alert("You win! The eggs are safely in the nest!");
    resetGame();
}

function resetGame() {
    gameStarted = false;
    showInstructions();
}

function gameLoop() {
    drawGame();
    moveSnake();
    movePredator();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

showInstructions();
