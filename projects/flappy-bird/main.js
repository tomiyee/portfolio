

let canvas;
let g;

let FPS = 60;

window.onload = start;


function start () {
  canvas = document.getElementById('flappy-bird-canvas');
  g = new FlappyBirdGame(canvas);
  g.addBird();

  canvas.addEventListener('click', jump);
  window.addEventListener('keydown', jump);

  setInterval (loop, 1000/FPS);
}

function jump (e) {
  if (!g.gameStarted) return g.startGame();
  if (e.keyCode == Keys.SPACEBAR)
    e.preventDefault();
  g.birds[0].jump();
}

function loop () {
  g.update(1/FPS)
  g.draw();
}
