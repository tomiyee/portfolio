

const FPS = 30;
const FLOCK_RADIUS = 50;
let WIDTH = 700, HEIGHT = 500;

const BG_COLOR = rgb(0,0,0);
const BOID_COLOR = rgb(255, 255, 255);
const BOID_SPEED = 7;
const NUM_BOIDS = 200;
const BOID_RADIUS = 6;
let A_FACTOR = 0.5;
let C_FACTOR = 0.04;
let R_FACTOR = 1.4
let boids = [];
let canvas, ctx;
let fullscreen = false;

window.onload = start;

/**
 * start - Runs when the window finishes loading
 */
function start () {
  // Initialize the global canvas and context objects
  canvas = document.getElementById("canvas");
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
  ctx = canvas.getContext('2d');
  // Initialize the number of birds
  for (let i = 0; i < NUM_BOIDS; i++)
    boids.push(new Boid());

  window.addEventListener("keydown",keyDownHandler);
  // Begin the update interval
  setInterval (update, 1000/FPS);
}

/**
 * update - Runs every couple milliseconds
 */
function update () {
  // black background
  if (fullscreen) {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight-1;
  } else {
    WIDTH = $('.main-container').width() - 50;
    HEIGHT = 500;
  }
  canvas.height = HEIGHT;
  canvas.width = WIDTH;

  drawRectangle(0,0,WIDTH, HEIGHT, rgba(0,0,0,1))
  for (let boid of boids) {
    boid.update(boids);
    boid.draw();
  }
}

function toggleFullscreen () {
  fullscreen = !fullscreen;
  if (fullscreen) {
    canvas.style.position = "absolute";

    canvas.style.top = 0;
    canvas.style.left = 0;
    $('body').append(canvas);
  }
  else {
    canvas.style.position = "static";
    $('.canvas-container').append(canvas);
    WIDTH = $('.main-container').width() - 50;
    HEIGHT = 500;
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
  }
}


function keyDownHandler (e) {
  if (e.keyCode == 70)
    toggleFullscreen();
  if (e.keyCode == 82) {
    boids = [];
    for (let i = 0; i < NUM_BOIDS; i++)
      boids.push(new Boid());
  }
}

/**
 * @function drawRectangle - Draws a rectangle onto the global ctx variable
 *
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
   * @function localFlock - Selects and returns a list of all the boids that are
   * within FLOCK_RADIUS pixels from this boid's position on the screen. Does
   * not yield boids that are on the edge that would be considered in the flock
   * if the canvas was tiled.
   *
   * @param  {Boid[]} boids The list of all boids in the sim
   * @return {Boid[]}       The list of all boids in the sim close to this boid
   */
  localFlock (boids) {
    let local = [];
    for (let boid of boids)
      if (this.position.subtract(boid.position).length() < FLOCK_RADIUS && boid != this)
        local.push(boid);
    return local;
  }

  /**
   * @function align - This force represents the tendency that this bird will
   * go in the direction of the average velocity of nearby boids.
   *
   * @param  {Boid[]} local The list of Boids within the FLOCK_RADIUS of this boid
   * @return {Vector}       The force acting on this boid due to alignment
   */
  align (local) {
    let force = new Vector(0,0);
    for (let boid of local)
      force.add(boid.velocity, true);
    force.setMax(2);

    return force.scale(A_FACTOR);
  }

  /**
   * @function cohesion - This force represents the tendancy that this bird will
   * go towards the "center of mass" of its local flock. Cuz these birds be lonely.
   *
   * @param  {Boid[]} local The list of Boids within the FLOCK_RADIUS of this boid
   * @return {Vector}       The force acting on this boid due to cohesion
   */
  cohesion (local) {
    let avg = new Vector(0,0);
    for (let boid of local)
      avg.add(boid.position, true);
    avg.scale(1/local.length);

    let force = avg.subtract(this.position);
    force.setMax(2)
    return force.scale(C_FACTOR);
  }

  /**
   * @function repulsion - This force represents the tendancy that this bird will
   * go away from a nearby bird, to simulate their need to not crash into each
   * other, y'know, like real birds.
   *
   * @param  {Boid[]} local The list of Boids within the FLOCK_RADIUS of this boid
   * @return {Vector}       The force acting on this boid due to cohesion
   */
  repulsion (local) {
    let force = new Vector (0,0);
    for (let boid of local) {
      let displ = this.position.subtract(boid.position);
      force.x += 1 / displ.x;
      force.y += 1 / displ.y;
    }
    force.setMax(2);
    return force.scale(R_FACTOR);
  }

  /**
   * @function update - Given a list of all the boids in the simulation,
   * determines the boids close to this boid and determines the contributions
   * of the alignment, cohesion, and repulsion forces to the changing boid's
   * changing velocity.
   *
   * @param  {type} boids List of all boids in the simulation
   */
  update (boids) {
    let local = this.localFlock (boids);
    if (local.length > 0){
      let forceAlign = this.align(local);
      let forceCohesion = this.cohesion (local);
      let forceRepulsion = this.repulsion (local);
      // Clear previous acceleration value before applying new forces
      this.acceleration.scale(0);
      this.acceleration.add(forceAlign, true);
      this.acceleration.add(forceCohesion, true);
      this.acceleration.add(forceRepulsion, true);
      this.velocity.add(this.acceleration, true);
    }
    this.velocity.setLength(BOID_SPEED);
    this.velocity.length() < 3 && console.log(this.velocity.length())
    this.position.add(this.velocity, true);
    // Wrap Around the Screen Horizontally
    if (this.position.x > WIDTH)
      this.position.x -= WIDTH;
    else if (this.position.x < 0)
      this.position.x += WIDTH;
    // Wrap Around the Screen Vertically
    if (this.position.y > HEIGHT)
      this.position.y -= HEIGHT;
    else if (this.position.y < 0)
      this.position.y += HEIGHT;
  }

  /**
   * @function draw - Draws this boid onto the global canvas using the
   * drawRectangle function
   */
  draw () {
    drawRectangle(this.position.x-BOID_RADIUS, this.position.y-BOID_RADIUS, BOID_RADIUS, BOID_RADIUS, BOID_COLOR);
  }
}
