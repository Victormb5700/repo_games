const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ===== CONFIGURAÇÃO (mude aqui depois do playtest) =====
const gridSize = 20;
const tileSize = canvas.width / gridSize; // 30px
const VELOCIDADE = 120;        // ms por passo
const PONTOS_PEIXE = 10;
const PONTOS_PEROLA = 30;
const PEROLA_SEGUNDOS = 6;

// CORAIS (obstáculos que matam)
const obstacles = [
    { x: 5, y: 5 },  { x: 14, y: 5 },
    { x: 5, y: 14 }, { x: 14, y: 14 },
    { x: 9, y: 9 },  { x: 10, y: 10 }
];

let snake, direction, nextDirection;
let food, goldenFood, goldenTimer, goldenTimerMax;
let score, goldScore;
let gameInterval = null;
let jogando = false;


// INICIA / REINICIA
function restartGame() {
    clearInterval(gameInterval);
    jogando = false;

    snake = [
        { x: 4, y: 17 },
        { x: 3, y: 17 },
        { x: 2, y: 17 }
    ];

    direction = "right";
    nextDirection = "right";

    score = 0;
    goldScore = 0;

    food = null;
    goldenFood = null;
    goldenTimer = 0;

    spawnFood();
    updateHUD();
    document.getElementById("message").textContent = "Aperte uma direção para começar";
    draw();
}

function startGame() {
    jogando = true;
    document.getElementById("message").textContent = "";
    gameInterval = setInterval(gameLoop, VELOCIDADE);
}


// LOOP PRINCIPAL
function gameLoop() {
    direction = nextDirection;

    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === "up") head.y--;
    if (direction === "down") head.y++;
    if (direction === "left") head.x--;
    if (direction === "right") head.x++;

    // PAREDES
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        return gameOver();
    }

    const comeuPeixe = food && head.x === food.x && head.y === food.y;
    const comeuPerola = goldenFood && head.x === goldenFood.x && head.y === goldenFood.y;

    // PRÓPRIO CORPO (a ponta da cauda sai do lugar se não comer)
    const corpo = (comeuPeixe || comeuPerola) ? snake : snake.slice(0, -1);
    for (const part of corpo) {
        if (head.x === part.x && head.y === part.y) return gameOver();
    }

    // CORAIS
    for (const o of obstacles) {
        if (head.x === o.x && head.y === o.y) return gameOver();
    }

    snake.unshift(head);

    if (comeuPeixe) {
        score += PONTOS_PEIXE;
        spawnFood();
    }

    if (comeuPerola) {
        score += PONTOS_PEROLA;
        goldScore += PONTOS_PEROLA;
        goldenFood = null;
    }

    if (!comeuPeixe && !comeuPerola) {
        snake.pop();
    }

    // TIMER DA PÉROLA
    if (goldenFood) {
        goldenTimer--;
        if (goldenTimer <= 0) goldenFood = null;
    } else if (Math.random() < 0.015) {
        spawnGoldenFood();
    }

    updateHUD();
    draw();
}


// ===== DESENHO =====
function draw() {

    // ÁGUA
    const agua = ctx.createLinearGradient(0, 0, 0, canvas.height);
    agua.addColorStop(0, "#0a4a63");
    agua.addColorStop(1, "#031e30");
    ctx.fillStyle = agua;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // GRADE suave
    ctx.strokeStyle = "rgba(120, 220, 240, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, canvas.height);
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(canvas.width, i * tileSize);
        ctx.stroke();
    }

    // CORAIS
    for (const o of obstacles) {
        const cx = o.x * tileSize + tileSize / 2;
        const cy = o.y * tileSize + tileSize / 2;

        ctx.fillStyle = "#ff6f61";
        ctx.beginPath();
        ctx.arc(cx, cy + 4, tileSize * 0.3, 0, Math.PI * 2);
        ctx.arc(cx - 8, cy - 5, tileSize * 0.2, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy - 6, tileSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // PEIXINHO (comida normal)
    if (food) {
        const fx = food.x * tileSize + tileSize / 2;
        const fy = food.y * tileSize + tileSize / 2;

        ctx.fillStyle = "#ffc94d";
        ctx.beginPath();
        ctx.ellipse(fx - 2, fy, 9, 6, 0, 0, Math.PI * 2); // corpo
        ctx.moveTo(fx + 5, fy);
        ctx.lineTo(fx + 12, fy - 6);                     // rabo
        ctx.lineTo(fx + 12, fy + 6);
        ctx.fill();

        ctx.fillStyle = "#022233";
        ctx.beginPath();
        ctx.arc(fx - 6, fy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // PÉROLA (vale 30, some em 6s)
    if (goldenFood) {
        const px = goldenFood.x * tileSize + tileSize / 2;
        const py = goldenFood.y * tileSize + tileSize / 2;

        // anel mostrando o tempo que falta
        ctx.strokeStyle = "#ffe9f2";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, tileSize * 0.48, -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * (goldenTimer / goldenTimerMax));
        ctx.stroke();

        const brilho = ctx.createRadialGradient(px - 3, py - 3, 1, px, py, tileSize * 0.32);
        brilho.addColorStop(0, "#ffffff");
        brilho.addColorStop(1, "#f2b8d0");
        ctx.fillStyle = brilho;
        ctx.beginPath();
        ctx.arc(px, py, tileSize * 0.32, 0, Math.PI * 2);
        ctx.fill();
    }

    // ENGUIA
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#4ff0c2" : (index % 2 ? "#1fb89a" : "#179a85");
        ctx.beginPath();
        ctx.roundRect(part.x * tileSize + 2, part.y * tileSize + 2, tileSize - 4, tileSize - 4, 9);
        ctx.fill();
    });

    drawSnakeEyes();
}

function drawSnakeEyes() {
    const head = snake[0];
    const x = head.x * tileSize;
    const y = head.y * tileSize;
    const a = tileSize * 0.28; // perto da borda
    const b = tileSize * 0.72; // longe da borda
    let olhos;

    if (direction === "right") olhos = [[b, a], [b, b]];
    if (direction === "left")  olhos = [[a, a], [a, b]];
    if (direction === "up")    olhos = [[a, a], [b, a]];
    if (direction === "down")  olhos = [[a, b], [b, b]];

    ctx.fillStyle = "#022233";
    for (const [ox, oy] of olhos) {
        ctx.beginPath();
        ctx.arc(x + ox, y + oy, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}


// ===== POSIÇÕES =====
// a comida nunca nasce na enguia, no coral ou na outra comida
function isOccupied(x, y) {
    for (const p of snake) if (p.x === x && p.y === y) return true;
    for (const o of obstacles) if (o.x === x && o.y === y) return true;
    if (food && food.x === x && food.y === y) return true;
    if (goldenFood && goldenFood.x === x && goldenFood.y === y) return true;
    return false;
}

function getRandomPosition() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (isOccupied(pos.x, pos.y));
    return pos;
}

function spawnFood() {
    food = null;
    food = getRandomPosition();
}

function spawnGoldenFood() {
    goldenFood = getRandomPosition();
    goldenTimerMax = Math.ceil(PEROLA_SEGUNDOS * 1000 / VELOCIDADE);
    goldenTimer = goldenTimerMax;
}


// ===== CONTROLES =====
function changeDirection(newDirection) {

    // BLOQUEIA 180°
    if (direction === "up" && newDirection === "down") return;
    if (direction === "down" && newDirection === "up") return;
    if (direction === "left" && newDirection === "right") return;
    if (direction === "right" && newDirection === "left") return;

    nextDirection = newDirection;

    if (!jogando) startGame();
}

document.addEventListener("keydown", function (event) {
    const key = event.key.toLowerCase();
    const mapa = {
        arrowup: "up", w: "up",
        arrowdown: "down", s: "down",
        arrowleft: "left", a: "left",
        arrowright: "right", d: "right"
    };

    if (mapa[key]) {
        event.preventDefault(); // setas não rolam a página
        changeDirection(mapa[key]);
    }
});


// ===== HUD / GAME OVER =====
function updateHUD() {
    document.getElementById("score").textContent = score;
    document.getElementById("goldScore").textContent = goldScore;
}

function gameOver() {
    clearInterval(gameInterval);
    jogando = "fim"; // impede recomeçar sem clicar em RECOMEÇAR

    document.getElementById("message").textContent = "GAME OVER — Pontuação: " + score;

    setTimeout(function () {
        if (score > 0) saveScore(score);
        updateLeaderboard();
    }, 100);
}


// ===== RECORDES (3 letras no localStorage) =====
function saveScore(value) {
    let name = prompt("GAME OVER!\nDigite suas iniciais (3 letras):");
    if (!name) return;

    name = name.toUpperCase().replace(/[^A-Z]/g, "").substring(0, 3);
    if (name.length !== 3) name = "AAA";

    let scores = JSON.parse(localStorage.getItem("enguiaScores")) || [];
    scores.push({ name: name, score: value });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);

    localStorage.setItem("enguiaScores", JSON.stringify(scores));
}

function updateLeaderboard() {
    const list = document.getElementById("scores");
    list.innerHTML = "";

    const scores = JSON.parse(localStorage.getItem("enguiaScores")) || [];

    scores.forEach(function (entry) {
        const li = document.createElement("li");
        li.textContent = entry.name + " — " + entry.score;
        list.appendChild(li);
    });
}


// INICIA
restartGame();
updateLeaderboard();
