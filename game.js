const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const images = {
    snake: new Image(),
    egg: new Image(),
    nestEmpty: new Image(),
    nestFull: new Image(),
    predator: new Image(),
    jungle: new Image()
};

images.snake.src = 'snake.png';
images.egg.src = 'egg.png';
images.nestEmpty.src = 'nest.png';
images.nestFull.src = 'nest_full.png';
images.predator.src = 'predator.png';
images.jungle.src = 'jungle.png';

const tileSize = 20;
let snake = [{ x: 100, y: 100 }];
let predator = { x: 400, y: 300 };
let snakeDirection = 'RIGHT';
let eggs = [];
let nest = { x: canvas.width / 2 - tileSize, y: canvas.height / 2 - tileSize };
let score = 0;
let gameStarted = false;
let nestFull = false;

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
    ctx.fillText("Press any key to start!", canvas.width / 2, 300);

    document.addEventListener('keydown', startGame, { once: true });
}

function startGame() {
    gameStarted = true;
    nestFull = false;
    snake = [{ x: 100, y: 100 }];
    predator = { x: 400, y: 300 };
    score = 0;
    generateEggs();
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
    ctx.drawImage(images.jungle, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(nestFull ? images.nestFull : images.nestEmpty, nest.x, nest.y, tileSize * 2, tileSize * 2);
    snake.forEach(segment => ctx.drawImage(images.snake, segment.x, segment.y, tileSize, tileSize));
    eggs.forEach(egg => ctx.drawImage(images.egg, egg.x, egg.y, tileSize, tileSize));
    ctx.drawImage(images.predator, predator.x, predator.y, tileSize, tileSize);
}

function moveSnake() {
    let head = { ...snake[0] };

    if (snakeDirection === 'UP') head.y -= tileSize;
    if (snakeDirection === 'DOWN') head.y += tileSize;
    if (snakeDirection === 'LEFT') head.x -= tileSize;
    if (snakeDirection === 'RIGHT') head.x += tileSize;

    snake.unshift(head);

    for (let i = 0; i < eggs.length; i++) {
        if (isColliding(head, eggs[i])) {
            score++;
            eggs.splice(i, 1);
            break;
        }
    }

    if (eggs.length === 0 && !nestFull) {
        setTimeout(() => {
            nestFull = true;
            showWinMessage();
        }, 500);
    } else {
        snake.pop();
    }

    if (isColliding(head, predator)) {
        alert('Game Over! The predator caught you!');
        resetGame();
    }
}

function movePredator() {
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

    for (let i = 0; i < eggs.length; i++) {
        if (isColliding(predator, eggs[i])) {
            eggs.splice(i, 1);
            break;
        }
    }
}

function showWinMessage() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText("You saved all the eggs!", canvas.width / 2, 180);
    ctx.fillText("The mother snake is happy!", canvas.width / 2, 220);
    ctx.fillText("Press any key to restart.", canvas.width / 2, 260);

    document.addEventListener('keydown', resetGame, { once: true });
}

function resetGame() {
    gameStarted = false;
    nestFull = false;
    showInstructions();
}

function gameLoop() {
    drawGame();
    moveSnake();
    movePredator();

    if (!nestFull) {
        requestAnimationFrame(gameLoop);
    }
}

showInstructions();
