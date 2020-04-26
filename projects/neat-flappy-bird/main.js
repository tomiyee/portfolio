
// Flappy Bird Game Constants
const WIDTH = 600;
const HEIGHT = 450;
const BIRD_RADIUS = 10;
const BIRD_X = 50;
const GRAVITY = 800;
const JUMP_VELOCITY = -200;
const PIPE_GAP = 100;
const PIPE_WIDTH = 60;
const PIPE_SPEED = 200;
const SEC_BETW_PIPES = 1.5;
const LIVE_BIRD_COLOR = rgba(255, 255, 0, 0.5);
const DEAD_BIRD_COLOR = rgba(70,70,70, 0.1);
const FPS = 30;
const SIM_SPEED = 1;

// Canvas
let canvas, ctx;

// Flappy Bird NEAT Constants
const NUM_BIRDS = 100;
const NUM_INPUTS = 3;
const NUM_OUTPUTS = 1;
const USE_BIAS = true;

let evolutionBegun = false;
let ticks = 0;

const birds = [];
const pipes = [];

let innovBank;
let net;

window.onload = start;

/**
 * start - Initialize the canvas and the global variables
 */
function start () {
  innovBank = new InnovationBank();
  net = new NeatNetwork(innovBank);
  net.initialize(NUM_INPUTS + USE_BIAS, NUM_OUTPUTS);

  // Prepare the Game Canvas
  canvas = document.getElementById("flappy-bird-canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
  ctx = canvas.getContext('2d');

  window.addEventListener("keydown", keyDownHandler);

  ctx.fillStyle = 'lightblue';
  ctx.fillRect(0,0,WIDTH, HEIGHT);
  // initializeFlappyBird();
  // setInterval(update, 1000 / FPS);
}

function keyDownHandler (e) {
  //birds[0].jump()
}

function initializeFlappyBird() {
  evolutionBegun = true;
  for (let i = 0; i < NUM_BIRDS; i++)
    birds.push(new Bird ());
  pipes.push(new Pipe());
}

/**
 * update - Run every game tick.
 */
function update () {
  for (let it = 0; it < SIM_SPEED; it++) {
    // Update all of the pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update(birds);
      // Remve pipes that are out of bounds
      if (pipes[i].x < -PIPE_WIDTH)
        pipes.splice(i, 1)
    }
    // Finds the next pipe that the bird should react to and may collide with
    let nextPipe = null;
    for (let i = 0; i < pipes.length; i++) {
      if (pipes[i].x > BIRD_X - PIPE_WIDTH) {
        nextPipe = pipes[i];
        break;
      }
    }
    // Construct the object with normalized observations data
    let observations = [
      (HEIGHT - nextPipe.pipeHeight)/HEIGHT,
      (HEIGHT - nextPipe.pipeHeight - PIPE_GAP)/HEIGHT,
      0.5
    ];
    // Update all of the birds
    for (let i in birds) {
      observations[2] = birds[i].y/HEIGHT;
      birds[i].update(observations);
      if (nextPipe.collides(birds[i]))
        birds[i].die();
    }
    // Update tick counter
    ticks = (ticks + 1) % (SEC_BETW_PIPES*FPS);
    if (ticks == 0)
      pipes.push(new Pipe());
  }

  // Draws the background
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(0,0,WIDTH, HEIGHT);
  // Draws the pipes
  for (let i in pipes)
    pipes[i].draw();
  for (let i in birds)
    birds[i].draw();
}

class Bird {
  constructor () {
    this.brain = new NeatNetwork(innovBank);
      this.brain.initialize(NUM_INPUTS+USE_BIAS, NUM_OUTPUTS);
      this.brain.bias(true);

    this.y = HEIGHT / 2;
    this.vy = 0;
  }

  /**
   * update - Given observations from the game, it will return a value from 0-1.
   * This value will be interpretted as a probability as to whether the Bird will
   * attempt to jump this game tick.
   *
   * @param  {type} observations description
   * @return {type}              description
   */
  update (observations) {

    if (this.y >= HEIGHT - BIRD_RADIUS)
      return;

    let jumpProbability = this.brain.feedForward(observations)
    if (Math.random() < jumpProbability[4])
      this.jump();

    let dt = 2 / FPS

    this.vy += 1/2 * GRAVITY * dt;
    this.y += this.vy * dt;

    if (this.y >= HEIGHT - BIRD_RADIUS) {
      this.die();
      this.y = HEIGHT - BIRD_RADIUS;
    }

    if (this.y < BIRD_RADIUS)
      this.die();
  }

  die () {
    this.dead = true;
  }

  jump () {
    if (!this.dead)
      this.vy = JUMP_VELOCITY;
  }

  draw () {
    ctx.fillStyle = this.dead ? DEAD_BIRD_COLOR : LIVE_BIRD_COLOR;
    ctx.beginPath();
    ctx.arc(BIRD_X, this.y, 10, 0, 2*Math.PI);
    ctx.fill();
  }
}

class Pipe {
  constructor () {
    this.x = WIDTH;
    this.pipeHeight = rand(0, HEIGHT - PIPE_GAP);

  }

  update () {
    this.x -= PIPE_SPEED / FPS;

  }

  collides (bird) {
    let pipe = this;

    if (BIRD_X < pipe.x - BIRD_RADIUS)
      return false;
    if (BIRD_X > pipe.x + PIPE_WIDTH + BIRD_RADIUS)
      return false;

    if (bird.y > HEIGHT - (pipe.pipeHeight + BIRD_RADIUS))
      return true;
    if (bird.y < HEIGHT - (pipe.pipeHeight + PIPE_GAP - BIRD_RADIUS))
      return true;

    return false;
  }

  draw () {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, 0, PIPE_WIDTH, HEIGHT - PIPE_GAP - this.pipeHeight);
    ctx.fillRect(this.x, HEIGHT - this.pipeHeight, PIPE_WIDTH, this.pipeHeight);
  }
}


/**
 * sigmoid - The common activation function.
 *
 * @param  {Number} n The input to the sigmoid function
 * @return {Number}   A number between 0-1.
 */
function sigmoid (n) {
  return 1 / (1 + Math.exp(-n));
}
