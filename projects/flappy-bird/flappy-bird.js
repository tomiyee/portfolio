
/**
 * This callback type is run on FlappyBirdGame update() calls
 *
 * @callback updateCallback
 * @param {FlappyBirdGame} game
 */

/**
 * This callback type is run on FlappyBirdGame draw() calls
 *
 * @callback renderCallback
 * @param {FlappyBirdGame} game
 */

/**
 * Class Pipe
 */
class Pipe {

  /**
   * constructor - Create
   *
   * @param  {FlappyBirdGame}           game   The game this pipe is contained in
   * @param  {HTMLElement}              canvas The canvas to render the pipe on
   * @param  {CanvasRenderingContext2D} ctx    The context of the above canvas
   */
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
    if (this.x <= this.game._birdX && this.x+this.speed*timestep > this.game._birdX)
      for (let i in this.game.birds)
        this.game.birds[i].onScore();
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
   * constructor - Creates a bird in the game
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
    this.score = 0;
    this.dead = false;
  }

  /** @type {number} y - Calculates the y value of the bird as dist from top */
  get y () {
    // The bird reached the bottom or top
    if (this._y >= this.game.height - this.radius)
      return this._y = this.game.height - this.radius;
    if (this._y <= this.radius)
      return this._y = this.game.height - this.radius;

    // Calculate the y using the terminal valocity stuff
    let v = this.game.gravity * this.t + this.v0;
    // Do Special calculations if terminal velocity has been reached
    if (v >= this.game.terminalVelocity) {
      // The time we hit terminal velocity
      const t = (this.game.terminalVelocity - this.v0) / this.game.gravity;
      // The height where we reached terminal velocity
      const terminalHeight = 1/2 * this.game.gravity * t**2 + this.v0 * t + this.y0;
      // The distance traveled during terminal velocity
      const terminalDistance = this.game.terminalVelocity * (this.t - t);
      // Return the sum of these two heights
      this._y = terminalHeight + terminalDistance;
      return this._y;
    }

    // Calculate the y using the original acceleration parameters
    this._y = 1/2 * this.game.gravity * this.t**2 + this.v0 * this.t + this.y0;
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
   * @function onScore - If the bird is not dead, increment the score
   */
  onScore () {
    if (!this.dead)
      this.score += 1;
  }

  /**
   * @function getScore - Returns the number of pipes this bird has passed.
   *
   * @return {number}  This bird's score
   */
  getScore () {
    return this.score;
  }

  /**
   * @function update - Updates the bird
   *
   * @param  {type} timestep=1 How large of a time step to take
   * @return {type}            description
   */
  update (timestep=1) {
    this.t += timestep;
    if (this.y > this.game.height - this.radius)
      this.die();
    for (let i = 0; i < this.game.pipes.length; i++)
      if (this.collides(this.game.pipes[i]))
        this.die();
  }

  /**
   * @function draw - Draws the bird onto the saved context variables
   */
  draw () {
    const color = this.dead ? 'gray' : 'yellow';
    drawCircle(this.ctx, this.x, this.y, this.radius+1, 'black');
    drawCircle(this.ctx, this.x, this.y, this.radius, color);
  }

  /**
   * @function die - Handles on death events like updating
   */
  die () {
    this.dead = true;
  }
}

/**
 * Class representing a self contained game of Flappy Bird
 *
 * To animate the game, you can either use the game.start(fps) method, which
 * will create a new interval, or you can call game.update(timestep) and
 * game.draw() independently at your own speed.
 */
class FlappyBirdGame {

  /**
   * Creates a game of Flappy Bird
   *
   * @param  {type} canvas=null description
   */
  constructor (canvas=null) {
    // Loads the Game Constants
    this._width = 600;            // px
    this._height = 450;           // px
    this.autoReset = false;
    this.useSpritesheet = true;
    this.spritesheetSrc = 'images/flappy-bird-spritesheets.png';
    // Initialize Game Variables
    this.t = 0;
    this.gameStarted = false;
    this.intervalId = null;
    this.updateListeners = {};
    this.renderListeners = {};
    // List of birds and pipes
    this.birds = [];
    this.pipes = [];
    // Bird Constants
    this.gravity = this.g = 700;  // px / sec^2
    this.jumpSpeed = 250;         // px / sec
    this.terminalVelocity = 300;  // px / sec
    this._birdX = 50;             // px
    //  Pipe Constants
    this._pipeSpeed = 100;        // px / sec
    this.pipeDelay = 2;           // sec
    this._pipeWidth = 60;         // px
    this.pipeGap = 100;           // px

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
    this._pipeSpeed = pipeSpeed;
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

  /** @type {number} pipeWidth */
  set pipeWidth (pipeWidth) {
    for (let i in this.pipes)
      this.pipes[i].width = pipeWidth;
    this._pipeWidth = pipeWidth;
  }
  get pipeWidth () {
    return this._pipeWidth;
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
   * @function addPipe - Adds a pipe to enter from the right side of the canvas
   */
  addPipe () {
    let p = new Pipe(this, this.canvas, this.ctx);
    p.speed = this.pipeSpeed;
    p.width = this.pipeWidth;
    this.pipes.push(p);
  }

  /**
   * @function getBird - description
   *
   * @param  {type} i description
   * @return {type}   description
   */
  getBird (i) {
    return this.birds[i];
  }

  /**
   * @function getBirdScore - Returns the score of the bird at index i
   *
   * @param  {number} i=0 The index of the bird
   * @return {number}     The score of the bird at index i
   */
  getBirdScore (i=0) {
    if (i < this.birds.length)
      throw new Error (`No bird at index ${i}`);
    return this.birds[i].getScore();
  }

  /**
   * update -
   *
   * @param  {type} timestep=1 The size of the time step for the update fn
   * @param  {type} draw=true
   */
  update (timestep=1, draw=true) {
    if (!this.gameStarted)
      return;
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

    // Calls the event listeners
    for (let i in this.updateListeners)
      this.updateListeners[i](this);

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
      for (let i = 0; i < Math.ceil(this.width / bgTileWidth)+1; i++)
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

    for (let i in this.renderListeners)
      this.renderListeners[i](this);
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
  restart () {this.reset();}

  /**
   * startGame - Begins key inputs and stuff
   *
   * @return {type}  description
   */
  startGame () {
    this.gameStarted = true;
  }

  /**
   * start - Starts the game loop
   *
   * @param  {type} fps=60 Number of frames per second to render the game at
   */
  start (fps=60) {
    if (this.intervalId != null)
      return console.warn('Game loop already in progress.');
    this.intervalId = setInterval (() => {
      this.update(1/fps);
      this.draw();
    });
  }

  /**
   * @function pause - Pauses the game loop
   */
  pause () {
    if (this.intervalId == null)
      return console.warn("No game loop to pause.");
    clearInterval (this.intervalId);
  }
  stop () {this.pause ();}

  /**
   * @function addUpdateListener - Adds the event listener which will get called
   * on every update, and returns the id associated with the fn
   *
   * @param  {updateCallback} fn The event handler which takes 1 parameter: a game instance
   * @return {number} The id of the function
   */
  addUpdateListener (fn) {
    let i = 0;
    while (i in this.updateListeners)
      i++;
    this.updateListeners[i] = fn;
    return i;
  }

  /**
   * @function removeUpdateListener - Removes the event listener with the
   * provided id from the list of update listeners
   *
   * @param  {number} fnIndex The id of the callback function to remove
   */
  removeUpdateListener (fnIndex) {
    if (!(fnIndex in this.updateListeners))
      return console.warn(`No update listener with the id ${fnIndex}.`);
    delete this.updateListeners[fnIndex];
  }

  /**
   * @function addRenderListener - Adds the event listener which will get called
   * on every render, and returns the id associated with the fn
   *
   * @param  {renderCallback} fn The event handler which takes 1 parameter: a game instance
   * @return {number} The id of the function
   */
  addRenderListener (fn) {
    let i = 0;
    while (i in this.renderListeners)
      i++;
    this.renderListeners[i] = fn;
    return i;
  }

  /**
   * @function removeRenderListener - Removes the event listener with the
   * provided id from the list of render listeners
   *
   * @param  {number} fnIndex the id of the callback function to remove
   */
  removeRenderListener (fnIndex) {
    if (!(fnIndex in this.renderListeners))
      return console.warn(`No render listener with the id ${fnIndex}.`);
    delete this.renderListeners[fnIndex];
  }
}
