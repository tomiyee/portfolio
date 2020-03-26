const FPS = 30;
const FLOCK_RADIUS = 50;
let WIDTH = 900, HEIGHT = 600;

const BG_COLOR = "#141414";
const BOID_COLOR = rgb(255/2, 255/2, 255/2);
const BOID_SPEED = 7;
const NUM_BOIDS = window.innerWidth * window.innerHeight / 10000*4;
const BOID_RADIUS = 6;
let A_FACTOR = 0.5;
let C_FACTOR = 0.04;
let R_FACTOR = 1.4
let boids = [];
let canvas, ctx;

window.onload = start;

function start () {

  canvas = document.createElement("canvas");

  canvas.style.position = 'absolute';
  canvas.style.top = 0;
  canvas.style.left = 0;
  HEIGHT = window.innerHeight;
  WIDTH  = window.innerWidth;
  canvas.height = HEIGHT;
  canvas.width = WIDTH;
  $(".navBar").prepend(canvas);
  ctx = canvas.getContext('2d');
  for (let i = 0; i < NUM_BOIDS; i++)
    boids.push(new Boid());
  setInterval (update, 1000/FPS);
}

/**
 * Calculates the next position of each boid based on the localized rules
 */
function update () {
  // black background
  HEIGHT = window.innerHeight;
  WIDTH  = window.innerWidth;
  drawRectangle(0,0,WIDTH, HEIGHT,BG_COLOR)
  for (let boid of boids) {
    boid.update(boids);
    boid.draw();
  }
}

/**
 * Draws a rectangle onto the global ctx variable
 * @param {Number} x - The x coordinate
 * @param {Number} y - The y coordinate
 * @param {Number} w - The width of the rectangle
 * @param {Number} h - The height of the rectangle
 * @param {String} c - The color of the rectangle
 */
function drawRectangle(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

class Boid {
  constructor (x, y) {
    if (x && y)
      this.position = new Vecctor (x, y);
    else
      this.position = new Vector (Math.random()*WIDTH, Math.random()*HEIGHT);
    this.velocity = new Vector(Math.random()*2-1, Math.random()*2-1)
    this.velocity.setLength(BOID_SPEED);
    this.acceleration = new Vector(0,0);
  }

  /**
   * localFlock - description
   *
   * @param  {Boid[]} boids A list of boids
   * @return {Boid[]}       A subset of boids which are within FLOCK_RADIUS of this
   */
  localFlock (boids) {
    let local = [];
    for (let boid of boids)
      if (this.position.subtract(boid.position).length() < FLOCK_RADIUS && boid != this)
        local.push(boid);
    return local;
  }

  align (local) {
    let force = new Vector(0,0);
    for (let boid of local) {
      force.add(boid.velocity, true);
    }
    force.setMax(2);
    return force.scale(A_FACTOR);
  }

  cohesion (local) {
    let avg = new Vector(0,0);
    for (let boid of local)
      avg.add(boid.position, true);
    avg.scale(1/local.length);

    let force = avg.subtract(this.position);
    force.setMax(2)
    return force.scale(C_FACTOR);
  }

  repulsion (local) {
    let force = new Vector (0,0);
    for (let boid of local) {
      let displ = this.position.subtract(boid.position);

      force.x += 1 / displ.x;
      force.y += 1 / displ.y;
    }
    force.setMax(2)
    return force.scale(R_FACTOR);
  }

  draw () {
    drawRectangle(this.position.x-BOID_RADIUS, this.position.y-BOID_RADIUS, BOID_RADIUS, BOID_RADIUS, BOID_COLOR);
  }

  update (boids) {
    let local = this.localFlock (boids);
    if (local.length > 0){
      let forceAlign = this.align(local);
      let forceCohesion = this.cohesion (local);
      let forceRepulsion = this.repulsion (local);
      this.acceleration.scale(0);
      this.acceleration.add(forceAlign, true);
      this.acceleration.add(forceCohesion, true);
      this.acceleration.add(forceRepulsion, true);
      this.velocity.add(this.acceleration, true);
    }
    this.velocity.setLength(BOID_SPEED);
    this.velocity.length() < 3 && console.log(this.velocity.length())
    this.position.add(this.velocity, true);

    if (this.position.x > WIDTH)
      this.position.x -= WIDTH;
    else if (this.position.x < 0)
      this.position.x += WIDTH;

    if (this.position.y > HEIGHT)
      this.position.y -= HEIGHT;
    else if (this.position.y < 0)
      this.position.y += HEIGHT;
  }
}
