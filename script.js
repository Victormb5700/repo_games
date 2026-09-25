const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// x, y - Posicionar o objeto
// w, h - Definir tamanho do personagem
// vx - Define velocidade horizontal

//personagem e onde estara/dimensoes:
const player = {x: 40, y: 160, w: 32, h: 32, vx: 120}

//Marca posição do quadro anterior:
let last = 0; 

//funcao que atualiza frames
function update(dt){
    player.x += player.vx * dt; 
    //Bater na parede esquerda ou direita = Inverter o sinal do vx
    if (player.x < 0 || player.x + player.w > canvas.width){ // || = ou
        player.vx *= -1; // * -1 = inverter sinal
    }
}

//Função desenha o personagem
function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#4ade80";

    ctx.beginPath();
    ctx.arc(
        player.x + player.w / 2,
        player.y + player.h / 2,
        player.w / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillText(
        "O DeltaTime - dt independe da taxa de quadros",
        12,
        20
    );
}

//funcao de loop, taxa de atualizacao, ts= taxa segundos
function loop(ts){
    if(!last) last = ts;
    
    const dt = Math.min(0.05, (ts - last)/1000); //1ms = 1seg. mathmin = contas
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop); // de fora executa o primeiro disparo do personagem
