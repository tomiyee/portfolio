const Keys = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  CAPS: 20,
  CAPSLOCK: 20,
  ESC: 27,
  ESCAPE: 27,
  SPACE: 32,
  SPACEBAR: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  LETTER : (char) => {
    if (char.length != 1)
      console.error(`Cannot get keyCode for "${char}". Invalid size.`);
    if ("abcdefghijjklmnopqrstuvwxyz".indexOf(char) == -1)
      console.error(`Invalid character. "${char}" is not a letter in the English Alphabet.`);
    return "abcdefghijjklmnopqrstuvwxyz".indexOf(char) + 65;
  },
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  isArrowKeys: (keyCode) => {return [37, 38, 39, 40].indexOf(keyCode) != -1;}
}

const rgb = (r,g,b) => `rgb(${r},${g},${b})`;
const rgba = (r,g,b,a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * @function randInt - Returns a random number between the integers min and max,
 * both inclusive.
 *
 * @param  {Integer} min The minimum number on the range
 * @param  {Integer} max The maximum number on the range
 * @return {Integer}     A random integer on the range [min, max]
 */
function randInt (min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * @function rand - Returns a random number between min (inclusive) and max
 * (exclusive)
 *
 * @param  {Number} min The minimum number on the range
 * @param  {Number} max The maximum number on the range
 * @return {Number}     A random number on the range [min, max)
 */
function rand (min, max) {
    return Math.random() * (max-min) + min;
}

/**
 * @function randInt - Returns a random integer between min (inclusive) and max
 *
 * @param  {Integer} min The minimum number on the range
 * @param  {Integer} max The maximum number on the range
 * @return {Integer}     A random integer on the range [min, max)
 */
function randInt (min, max) {
  return Math.floor(Math.random() * (max-min) + min);
}

/**
 * @function avg - Returns the average value of the elements in the list. If
 * given only a list, it will return the average value of the list. Otherwise,
 * it will return the average value of all of it's parameters
 *
 * @return {Number} The average value in the list / all parameters
 */
function avg () {
  if (arguments.length == 0)
    throw new Error("The Average function requires at least one input.");

  let list;
  if (arguments.length == 1 && Array.isArray(arguments[0]))
    list = arguments[0];
  else
    list = arguments;

  const len = list.length;
  let avg = 0;
  for (let i = 0; i < len; i++)
    avg += list[i]/len;
  return avg;
}

/**
 * @function min - Returns the minimum value of the elements in the list
 *
 * @return {Number}  The minimum value of the elements in the list.
 */
function min () {
  let list;
  if (arguments.length == 1 && Array.isArray(arguments[0]))
    list = arguments[0];
  else
    list = arguments;

  const len = list.length;
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < len; i++)
    min = min < list[i] ? min : list[i];
  return min;
}

/**
 * @function max - Returns the maximum value of the elements inside of the list
 *
 * @return {Number}  The minimum value of the elements in the list
 */
function max () {
  let list;
  if (arguments.length == 1 && Array.isArray(arguments[0]))
    list = arguments[0];
  else
    list = arguments;

  const len = list.length;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < len; i++)
    max = max > list[i] ? max : list[i];
  return max;
}

/**
 * @function range - Returns an iterator.
 *
 * @param  {Integer} start    The number to start at, inclusive; The number to end at, starting at 0
 * @param  {Integer} end      The number to end at, exclusive; null
 * @param  {Integer} stepSize The increment size
 */
function* range (start, end, stepSize=1) {
  if (isNaN(end)) {
    end = start;
    start = 0;
  }
  // Check against inifinite loops
  if (stepSize > 0 && end < start)
    throw new Error("Range will result in an infinite loop");
  if (stepSize < 0 && end > start)
    throw new Error("Range will result in an infinite loop");
  if (stepSize == 0)
    throw new Error("Range will result in an infinite loop");
  // Conduct the appropriate loop
  if (stepSize > 0)
    for (let i = start; i < end; i += stepSize)
      yield i;
  if (stepSize < 0)
    for (let i = start; i > end; i += stepSize)
      yield i;
}

/**
 * @function round - Rounds the given number to the given number of decimal
 * places
 *
 * @param  {Number} number   The number we are rounding
 * @param  {Integer} decimals The number of decimal places we wish to round to.
 * @return {Number}          The rounded number
 */
function round (number, decimals) {
  if (isNaN(decimals))
    decimals = 0;
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * @function relativeCoords - Returns an obect with the x and y coordinates of
 * the mouse event to the given html element
 *
 * @param  {MouseEvent}   event   The Mouse Event data
 * @param  {HTML Element} element The element we want the coordinates relative to
 * @return {Object}       The x and y coordinates relative to the given element
 */
function relativeCoords (event, element) {
    var x = event.clientX - element.getBoundingClientRect().left;
    var y = event.clientY - element.getBoundingClientRect().top;
    return {x, y};
}

/**
 * @function drawLine - Draws a line on the provided canvas context
 *
 * @param  {CanvasRenderingContext2D} ctx The 2D Context of the HTML Canvas
 * @param  {Number} x1  The x value of the start coordinate
 * @param  {Number} y1  The y value of the start coordinate
 * @param  {Number} x2  The x value of the end coordinate
 * @param  {Number} y2  The y value of the end coordinate
 * @param  {String} [color] The stroke style for the line
 */
function drawLine(ctx, x1, y1, x2, y2, color=null) {
  let oldStrokeStyle = ctx.strokeStyle;
  if (color != null)
    ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  if (color != null)
    ctx.strokeStyle = oldStrokeStyle;
}

/**
 * @function drawCircle - Draws and fills in a circle on the provided canvas context
 *
 * @param  {CanvasRenderingContext2D} ctx The 2D Context of the HTML Canvas
 * @param  {Number} x       The x value of the center coordinate
 * @param  {Number} y       The y value of the center coordinate
 * @param  {Number} r       The radius of the circle
 * @param  {String} [color] The fill style for the circle
 */
function drawCircle(ctx, x, y, r, color=null) {
  let oldFillStyle = ctx.fillStyle;
  if (color != null)
    ctx.fillStyle = color;
  // Actually Draws the Circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
  if (color != null)
    ctx.fillStyle = oldFillStyle;
}
