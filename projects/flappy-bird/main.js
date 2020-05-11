

let canvas;
let g;

let FPS = 60;

window.onload = start;


function start () {
  canvas = document.getElementById('flappy-bird-canvas');
  g = new FlappyBirdGame(canvas);
  g.addBird();
  window.addEventListener('keydown', keyDownHandler)
  setInterval (loop, 1000/FPS)
}


function loop () {
  g.update(5/FPS)
  g.draw();
}

/**
 * keyDownHandler - Handles Key Down Events Very Simply
 *
 * @param  {type} e description
 * @return {type}   description
 */
function keyDownHandler (e) {
  if (e.keyCode == Keys.SPACEBAR)
    e.preventDefault();
  g.birds[0].jump();
}

class Pipe {
  constructor (game, canvas, ctx) {
    // loads the pipe settings
    this.game = game;
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = this.game.width;
    this.speed = 10;
    this.width = this.game.pipeWidth;
    this.buffer = 50;
    this.gap = game.pipeGap;
    this.height = Math.random() * (this.game.height - this.gap - 2 * this.buffer) + this.buffer;
  }

  /**
   * update - description
   *
   * @param  {type} timestep=1 description
   * @return {type}            description
   */
  update (timestep=1) {
    this.x -= this.speed * timestep;
    if (this.x < -this.width)
      this.game.pipes.splice(this.game.pipes.indexOf(this),1);
  }

  draw () {
    // Draw the pipes using the Sprite sheeet
    if (this.game.useSpritesheet) {
      let scaledHeight = 160/26 * this.width;
      this.ctx.drawImage(this.game._spritesheet, 56, 323, 26, 160, this.x, this.height-scaledHeight,this.width,scaledHeight);
      this.ctx.drawImage(this.game._spritesheet, 84, 323, 26, 160, this.x, this.height+this.gap,this.width,scaledHeight);
      return;
    }
    // Oherwise, Draw the pipes using solid colors
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(this.x, 0, this.width, this.height);
    this.ctx.fillRect(this.x, this.height + this.gap, this.width, this.game.height);
  }
}

/**
 * Class representing a single bird. Meant to be contained within the provided game
 */
class Bird {
  /**
   * constructor - description
   *
   * @param  {FlappyBirdGame}           game   The game this bird is contained in
   * @param  {HTMLElement}              canvas The canvas to render the bird on
   * @param  {CanvasRenderingContext2D} ctx    The context of the above canvas
   */
  constructor (game, canvas, ctx) {
    /** @private */
    this.game = game;
    /** @private */
    this.canvas = canvas;
    /** @private */
    this.ctx = ctx;

    // Bird Related Constants
    /** @private */
    this.radius = 10;
    /** @private */
    this.jumpSpeed = game.jumpSpeed;

    this.x = 50;
    this.y0 = this._y = this.game.height / 2;
    this.v0 = 0;
    this.t = 0;
    this.dead = false;
  }

  /** @type {number} y - Calculates the y value of the bird as dist from top */
  get y () {
    if (this._y >= this.game.height - this.radius)
      return this._y = this.game.height - this.radius;
    let termVelT = (-this.v0 + Math.sqrt(this.v0**2 - 2*this.game.gravity*(this.y0 - this._y-this.game.terminalVelocity))) / this.game.gravity;
    if (this.t < termVelT)
      this._y = 1/2 * this.game.gravity * this.t**2 + this.v0 * this.t + this.y0;
    else
      this._y += this.game.terminalVelocity;
    return this._y;
  }

  /**
   * jump - Puts the Flap in Flappy Bird. Gives the bird upward speed.
   */
  jump () {
    // Don't Respond to Jump Commands if This Bird is Dead
    if (this.dead)
      return;
    // Don't Respond to Jump Commands if Not Enough Time Elapsed
    if (this.t < this.jumpDelay)
      return;
    // Updates relevant variables for the calculation of y
    this.y0 = this.y;
    this.v0 = -this.jumpSpeed;
    this.t = 0;
  }

  /**
   * collides - Returns true if this bird collides with the given pipe
   *
   * @param  {Pipe} pipe The pipe in question
   * @return {boolean}      True if the two collide
   */
  collides (pipe) {
    if (this.x + this.radius < pipe.x)
      return false;
    if (this.x - this.radius > pipe.x + pipe.width)
      return false;
    if (this.y - this.radius < pipe.height)
      return true;
    if (this.y + this.radius > pipe.height + pipe.gap)
      return true;
    return false;
  }

  /**
   * update - Updates the bird
   *
   * @param  {type} timestep=1 How large of a time step to take
   * @return {type}            description
   */
  update (timestep=1) {
    this.t += timestep;
    if (this.y > this.game.height - this.radius)
      this.die()
    for (let i = 0; i < this.game.pipes.length; i++)
      if (this.collides(this.game.pipes[i]))
        this.die();
  }

  /**
   * draw - Draws the bird onto the saved context variables
   */
  draw () {
    const color = this.dead ? 'gray' : 'yellow';
    drawCircle(this.ctx, this.x, this.y, this.radius+1, 'black');
    drawCircle(this.ctx, this.x, this.y, this.radius, color);
  }

  /**
   * die - Handles on death events like updating
   */
  die () {
    this.dead = true;
  }
}

/**
 * Class representing a self contained game of Flappy Bird
 */
class FlappyBirdGame {

  /**
   * Creates a game of Flappy Bird
   *
   * @param  {type} canvas=null description
   */
  constructor (canvas=null) {
    // Loads the Game Constants
    this._width = 600;
    this._height = 450;
    this.autoReset = false;
    this.useSpritesheet = true;
    this.spritesheetSrc = 'images/flappy-bird-spritesheets.png';
    // List of birds and pipes
    this.birds = [];
    this.pipes = [];
    this.t = 0;
    // Bird Constants
    this.gravity = this.g = 20;
    this.jumpSpeed = 50;
    this.terminalVelocity = 15;
    this._birdX = 50;
    //  Pipe Constants
    this._pipeSpeed = 20;
    this.pipeDelay = 10; // Measured in Time Steps
    this.pipeWidth = 60;
    this.pipeGap = 100;

    // Prepares a canvas for this flappy bird game instance
    this.canvas = canvas ? canvas : document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.addPipe();

    // Spritesheet
    this._spritesheet = document.createElement('img');
    this._spritesheet.src = this.spritesheetSrc;
  }

  /** @type {number} pipeSpeed */
  set pipeSpeed (pipeSpeed) {
    for (let i in this.pipes)
      this.pipes[i].speed = pipeSpeed;
    this.pipeSpeed = pipeSpeed;
  }
  get pipeSpeed () {
    return this._pipeSpeed;
  }

  /** @type {number} width */
  set width (w) {
    this.canvas.width = w;
    this._width = w;
  }
  get width () {
    return this._width;
  }

  /** @type {number} height */
  set height (h) {
    this.canvas.height = h;
    this._height = h;
  }
  get height () {
    return this._height;
  }

  /**
   * @function addBird - Adds the given number of birds
   *
   * @param  {type} n=1 description
   * @return {type}     description
   */
  addBird (n=1) {
    for (let i = 0; i < n; i++) {
      let bird = new Bird (this, this.canvas, this.ctx);
      this.birds.push(bird);
    }
    return this.birds.length;
  }

  /**
   * addPipe - Adds a pipe to the game
   */
  addPipe () {
    let p = new Pipe(this, this.canvas, this.ctx);
    p.speed = this.pipeSpeed;
    p.width = this.pipeWidth;
    this.pipes.push(p);
  }

  /**
   * getBird - description
   *
   * @param  {type} i description
   * @return {type}   description
   */
  getBird (i) {
    return this.birds[i];
  }

  /**
   * update -
   *
   * @param  {type} timestep=1 The size of the time step for the update fn
   * @param  {type} draw=true
   */
  update (timestep=1, draw=true) {
    // Spawn a new pipe if enough timesteps have elapsed
    if (((this.t+timestep) % this.pipeDelay) < (this.t % this.pipeDelay))
      this.addPipe();
    // Increment the computer's timestep
    this.t += timestep;
    // Update the Pipes and Birds positions
    for (let i = this.pipes.length-1; i >= 0; i--)
      this.pipes[i].update(timestep);
    for (let i in this.birds)
      this.birds[i].update(timestep);


    // If this game is set to not autoReset, then skip the following step
    if (!this.autoReset)
      return;
    // If no birds are alive, then reset the game
    for (let i in this.birds)
      if (!this.birds[i].dead)
        return;
    if (this.autoReset) this.reset();
  }

  /**
   * draw - Updates the contents of the canvas
   */
  draw () {
    // Use the spritesheet
    if (this.useSpritesheet) {
      // The dimensions of the background is 256 x 144
      const bgTileWidth = 144 / 256 * this.height;
      const offset = this.t % bgTileWidth;
      for (let i = 0; i < Math.ceil(this.width / bgTileWidth); i++)
        this.ctx.drawImage(this._spritesheet, 0,0, 144, 256, i*bgTileWidth-offset-i,0,bgTileWidth,this.height);
    }
    // Draw the background as solid light blue
    else {
      this.ctx.fillStyle = 'lightblue';
      this.ctx.fillRect(0,0,this.width, this.height);
    }
    // Draw the pipes and the birds
    this.ctx.imageSmoothingEnabled = false;
    for (let i in this.pipes)
      this.pipes[i].draw();
    for (let i in this.birds)
      this.birds[i].draw();
    this.ctx.imageSmoothingEnabled = true;
  }

  /**
   * reset - Reset the game, keeping the same number of birds.
   */
  reset () {
    // Reset the birds
    let numBirds = this.birds.length;
    this.birds = [];
    this.addBird(numBirds);
    // Reset the pipes
    this.pipes = [];
    this.addPipe();
    // Reset the time to 0
    this.t = 0;
  }
}
