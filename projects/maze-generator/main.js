
const WALL_COLOR = "gray";
const WALL_WIDTH = 3;
const BG_COLOR = 'lightgray';
const GRIDLINE_COLOR = 'darkgray';
const FPS = 15;
let WIDTH = 500;
let HEIGHT = 500;
let ROWS = 20;
let COLS = 20;
let CELL_WIDTH = WIDTH / COLS;
let CELL_HEIGHT = HEIGHT / ROWS;

let canvas, ctx;
let mouseCurrX, mouseCurrY;
let mouseCurrR, mouseCurrC;
let mouseStartR, mouseStartC;

let currentlyDragging = false;

let lineComponents = [];

window.onload = start;

function start () {
  // Initialize the Global Vaariables for the Canvas
  canvas = document.getElementById("maze-canvas");
    canvas.imageSmoothingEnabled = false;
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
  ctx = canvas.getContext('2d');

  canvas.addEventListener("mousemove", mouseMoveHandler);
  canvas.addEventListener("mousedown", mouseDownHandler);
  canvas.addEventListener("mouseup", mouseUpHandler);

  setInterval (update, 1000/FPS);
}

function update () {
  // Draws the background color onto the canvas
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // Draws the guiding grid lines onto the canvas
  ctx.lineWidth = 1;
  drawGridLines ();
  ctx.lineWidth = 3;
  // Draws the drawn lines
  for (let i in lineComponents){
    let x1 = lineComponents[i][1]*CELL_WIDTH;
    let y1 = lineComponents[i][0]*CELL_HEIGHT;
    let x2 = lineComponents[i][3]*CELL_WIDTH;
    let y2 = lineComponents[i][2]*CELL_HEIGHT;
    drawLine(ctx, x1, y1, x2, y2, WALL_COLOR);
  }
  // Draws the mouse stuff
  if (currentlyDragging) {
    drawCircle(ctx, mouseStartC*CELL_WIDTH, mouseStartR*(CELL_HEIGHT), 3, WALL_COLOR);
    drawLine(ctx, mouseStartC*CELL_WIDTH, mouseStartR*(CELL_HEIGHT), mouseCurrC*CELL_WIDTH, mouseCurrR*(CELL_HEIGHT), WALL_COLOR);
  }
  drawCircle(ctx,mouseCurrC*CELL_WIDTH, mouseCurrR*(CELL_HEIGHT), 3, WALL_COLOR)
}

/**
 * drawGridLines - Draws the guiding grid lines onto the canvas
 */
function drawGridLines () {
  ctx.strokeStyle = GRIDLINE_COLOR;
  for (let r = 0; r < ROWS; r++)
    drawLine(ctx, 0, CELL_HEIGHT*r, WIDTH, CELL_HEIGHT*r);
  for (let c = 0; c < COLS; c++)
    drawLine(ctx, CELL_WIDTH*c, 0, CELL_WIDTH*c, HEIGHT);
}


function setHeight (h) {
  HEIGHT = h;
  canvas.height = h;
  CELL_HEIGHT = HEIGHT / ROWS;
}


function setWidth (w) {
  WIDTH = w;
  canvas.width = w;
  CELL_WIDTH = WIDTH / COLS;
}

function setRows (r) {
  ROWS = r;
  CELL_HEIGHT = HEIGHT / ROWS;
}

/**
 * @function setCols - Sets the global number of columns to c, and updates the
 * cells width as appropriate.
 *
 * @param  {Number} c The new number of columns
 */
function setCols (c) {
  COLS = c;
  CELL_WIDTH = WIDTH / COLS;
}


function mouseMoveHandler (e) {
  let {x, y} = relativeCoords(e, canvas);
  mouseCurrX = x;
  mouseCurrY = y;
  mouseCurrC = Math.round(mouseCurrX / CELL_WIDTH);
  mouseCurrR = Math.round(mouseCurrY / CELL_HEIGHT);
}

function mouseDownHandler (e) {
  currentlyDragging = true;
  mouseStartR = mouseCurrR;
  mouseStartC = mouseCurrC;
}

function mouseUpHandler (e) {
  currentlyDragging = false;
  // Don't draw points
  if (mouseStartR == mouseCurrR)
    if (mouseStartC == mouseCurrC)
      return;

  addDrawnLines (
    mouseStartR,
    mouseStartC,
    mouseCurrR,
    mouseCurrC);
}

function sameComp (comp1, comp2) {
  let same = true;
  for (let i = 0; i < 4; i++) {
    if (comp1[i] != comp2[i]){
      same = false;
      break;
    }
  }
  if (same)
    return true;
  let indicesComp = [[0,1,2,3], [2, 3, 0, 1]];
  same = true;
  for (let i = 0; i < 4; i ++) {
    if (comp1[indicesComp[0][i]] != comp2[indicesComp[1][i]]){
      same = false;
      break;
    }
  }
  return same;
}

function addDrawnLines (r1, c1, r2, c2) {
  // Break the line into components
  if (r1 == r2) {
    for (let i of range(Math.abs(c2-c1))) {
      let comp = [r1, c1 + Math.sign(c2-c1) * i, r1, c1 + Math.sign(c2-c1) * (i+1)];
      let addComponent = true;
      for (let j in lineComponents) {
        if (!sameComp(lineComponents[j], comp))
          continue;
        addComponent = false;
        lineComponents.splice(j, 1);
        break;
      }
      if (addComponent)
        lineComponents.push(comp)
    }
  }
  else if (c1 == c2) {
    for (let i of range(Math.abs(r2-r1))) {
      let comp = [r1 + Math.sign(r2-r1) * i, c1, r1 + Math.sign(r2-r1) * (i+1), c1];
      let addComponent = true;
      for (let j in lineComponents) {
        if (!sameComp(lineComponents[j], comp))
          continue;
        addComponent = false;
        lineComponents.splice(j, 1);
        break;
      }
      if (addComponent)
        lineComponents.push(comp)
    }
  }
  else {
    let comp = [r1, c1, r2, c2];
    let addComponent = true;
    for (let j in lineComponents) {
      if (!sameComp(lineComponents[j], comp))
        continue;
      addComponent = false;
      lineComponents.splice(j, 1);
      break;
    }
    if (addComponent)
      lineComponents.push(comp);
  }
}
