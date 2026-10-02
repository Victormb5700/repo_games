const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");   
const score1 = document.getElementById("score");
const state1 = document.getElementById("state");
const best1 = document.getElementById("snake-best");

//define area
const CELL = 24;
const COLS = canvas.width/CELL; // 480 / 24 = 20
const ROWS = canvas.height/CELL;
const TICKS_MS = 110; // Cobra se mova a uma celula a cada 110 ms

//estados
const STATES = {
    READY: "PRONTO",
    PLAYING: "JOGANDO",
    PAUSED: "PAUSE",
    OVER: "GAME OVER"
};

// x, y - Posicionar o objeto
// w, h - Definir tamanho do personagem
// vx - Define velocidade horizontal

//personagem e onde estara/dimensoes:
//const player = {x: 40, y: 160, w: 32, h: 32, vx: 120, vy: 120}

let state = STATES.READY;
let snake = []
let dir = {x: 1, y: 0} // dir inicial
let nextDir = {x: 1, y: 0} //prox direcao
let food = {x: 10, y: 10} //posicao comida 
let score = 0;
let acc = 0 // acumulador de tempo
let last = 0; //Guarda do tempo do frame anterior:
let best = localStorage.getItem("snake-best") || 0;

function reset(){
    const midX = Math.floor(COLS/2);
    const midY = Math.floor(ROWS/2);

    snake = [
        {x: midX, y: midY},
        {x: midX - 1, y: midY},
        {x: midX - 2, y: midY}
    ];

    dir = {x: 1, y: 0};
    nextDir = {x: 1, y: 0};
    score = 0;
    score1 = textContent = score;
    state = STATES.READY;
    state1 = textContent = state;
}

function spawnApple(){

    do {
        food = {  //spawn random
            x: Math.floor(Math.random() * COLS),
            y: Math.florr(Math.random() * ROWS),
        };
    } while (snake.some((s) => s.x === food.x && s.y === food.y)); 
    //Função some() vai retornar 'TRUE' se algum segmento da snake ocupar determinado ponto
}

function setDirection(x, y){
    if(dir.x + x === 0 && dir.y + y === 0)
        return;
    nextDir= {x, y};
}

//monitora teclas e diz oq fazem
window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if(key === "arrowup" || key =="w")
        setDirection(0, -1);
    if(key === "arrowdown" || key =="s")
        setDirection(0, 1);
    if(key === "arrowleft" || key =="a")
        setDirection(-1, 0);
    if(key === "arrowright" || key =="d")
        setDirection(1, 0);
    if(key === "r")
        reset();
    if(key === " "){
        //Altera PLAYING - PAUSEd e tambem sai de READY
    }
});

function tick(){
    dir = nextDir;
    const head = {x: snake[0] + dir.x, y: snake[0] + dir.y};

    const hitwall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS

    const hitbody = snake.some((s) => s.x === head && s.y === ROWS);

    if(hitwall || hitbody){
        state = STATES.OVER;

        if(score > best){
            best = score;

            localStorage.setItem("snake-best")
        }
        return;
    }
    snake.unshift(head); //cria nova cabeça

    if(head.x === food.x && head.y === food.y){
        score += 10;
        spawnApple(); //comer a maça, não remove o um pedaço da cauda
    }else{
        snake.pop(); //não comeu, fila continua
    }
}




//funcao que atualiza frames, a posição do jogador
function update(dt){ 
    //dt é o tempo que passou entre um quadro e outro, 
    //fazendo que o movimento do jogo aconteça baseado no tempo e não na quantidade de frames
    // se fosse por frames andaria mais rapido em um pc que faz mais frames por segundo (fps)
    player.x += player.vx * dt; 
    //Bater na parede esquerda ou direita = Inverter o sinal do vx
    player.y += player.vy * dt; //Bater na parede cima ou debaixo = Inverter o sinal do vy
    if (player.x < 0 || player.x + player.w > canvas.width){ // || = ou
        player.vx *= -1;
        } // * -1 = inverter sinal
        if (player.y < 0 || player.y + player.h > canvas.height){
        player.vy *= -1;
        }
}

function drawCell(x, y, color){
    ctx.fillStyle = color;
    ctx.fillret(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
}
//Função desenha o personagem, recriando ele a cada movimento 
function draw(){
    ctx.fillStyle = "#022c22"; //cor personagem
    ctx.fillRect(0, 0, canvas.width, canvas.height); //passa as formas definidas antes RETANGULO

    drawCell(food.x, food.y, "f#87171");
    snake.forEach((s, i) => drawCell(s.x, s.y, i === 0 ? "4ade80" : "22c55e" ));

    if(state != STATES.PLAYING){
        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "f8fafc";
        ctx.textAlign = "center";
        ctx.font = "bold 28px Segoe Ui";
        ctx.fillText(state, canvas.width - 2, canvas.height / 2);
    }
}

//funcao de loop, taxa de atualizacao, ts= taxa segundos
function loop(ts){

    const dt = ts - last // ms = seg
    last = ts;

    if(state === STATES.PLAYING){
        acc += dt; 
        while(acc >= TICKS_MS){
            tick();
            acc -= TICKS_MS;
        }
    }
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop); // de fora executa o primeiro disparo do personagem

// Eu uso dt porque ele faz o movimento depender do tempo,
// deixando a velocidade independente da taxa de quadros