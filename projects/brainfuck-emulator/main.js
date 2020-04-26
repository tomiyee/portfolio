
// Variables for the interpretation step
let memory = [0];
let memoryPointer;
let codeLength;
let codePointer;
let openBracketPositions;

let intervalId = null;
let numStepsPerInterval = 50;
let stepDelay = 2;

window.onload = start;

/**
 * @function start - Initializes global variables, UI, and event handlers.
 */
function start () {
  loadCode();

  $(".context-tabs").width(800).tabs({
    collapsible:true,
  });
  // The input is disabled by default
  $('#console-input').attr('disabled', true);
  $( "#dialog" ).dialog({
    autoOpen: false,
    width:750,
    height:500,
    open: updateCells
  });

  const textarea = document.getElementById("editor");
  textarea.addEventListener("keydown", textareaKeyDownHandler);
  window.addEventListener ("keydown", keyDownHandler);
  // Handles whenever you enter something into the input
  $('#console-input').bind('keydown', consoleInputHandler);
}

/**
 * @function keyDownHandler - Handles commands that are not tied to a particular
 * HTML element. Saving and interupting code for example are not tied to any
 * element in particular.
 *
 * @param  {KeyboardEvent} e Keyboard Event Data
 */
function keyDownHandler (e) {
  if (e.ctrlKey && e.keyCode == Keys.S) {
    e.preventDefault();
    saveCode();
  }
  // Interrupt
  if (e.ctrlKey && e.keyCode == Keys.C) {
    e.preventDefault();
    stopInterpretation();
    disableConsoleInput();
    $(".output")[0].innerHTML += "<br/> Code Interrupted";
  }
}

/**
 * @function keyDownHandler - Handles commands that are tied to the code textarea,
 * such as running the code.
 *
 * @param  {KeyboardEvent} e Keyboard Event Data
 */
function textareaKeyDownHandler (e) {
  if (e.shiftKey &&  e.keyCode == Keys.ENTER && $("#editor").is(":focus")) {
    e.preventDefault();
    interpret($("#editor").val());
  }
}

/**
 * @function consoleInputHandler - Handles Key down events triggered in the
 * console input. Mainly handles whenever the user clicks enter.
 *
 * @param  {KeyboardEvent} e Keyboard Event Data
 */
function consoleInputHandler (e) {
  if (e.keyCode == Keys.ENTER){
    stopInterpretation();
    // Gets the value and empties the input
    let val = $('#console-input').val();
    disableConsoleInput();

    // If no input given, assume 0
    if (val.length == 0)
      val = 0;
    // Check for Binary, Hexadecimal, and Decimal
    else if (val.indexOf("0b") == 0 && !isNaN(parseInt(val.slice(2),2)))
      val = min(255,max(0,parseInt(val.slice(2),2)));
    else if (val.indexOf("0x") == 0 && !isNaN(parseInt(val)))
      val = min(255,max(0,parseInt(val)));
    else if (val.indexOf("0d") == 0 && !isNaN(parseInt(val.slice(2),10)))
      val = min(255,max(0,parseInt(val.slice(2),10)));
    // Take only the first character, if it is a number, use it
    else if (!isNaN(parseInt(val[0])))
      val = parseInt(val[0]);
    // If the first character is not a number, use its ASCII code
    else
      val = val.charCodeAt(0);
    if (memoryPointer >= 0)
      memory[memoryPointer] = val % 256;
    codePosition += 1;

    resumeInterpretation();
  }
}

const codeExamples = {
  "hello_world":
"Prints \"Hello World\"\n\
++++++++++[>+>+++>+++++++>++++++++++<<<<-]>>>++.>+.+++++++..+++.<<++.>+++++++++++++++.>.+++.------.--------.<<+.<.",

  "multiply":
"Give two numbers and the first cell will have \
the product \n \
,>,<[->[->+>+<<]>[-<+>]<<]>>>[-<<<+>>>]*",

  "fibonacci":
"Generates the nth Fib Number\n\
With first two numbers being 1\n\
Warning: Very slow as fib num gets big\n\
Output is in first memory cell\n\n\
,>>+<<-[->[->>+<<]>[->+>+<<]>[-<+>]>[-<<<+>>>]<<<<]>>[-<<+>>]<<.*"
};
function loadExample (ex) {
  if (ex in codeExamples)
    $("#editor").val(codeExamples[ex])
}


// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++)
      if (dropdowns[i].classList.contains('show'))
        dropdowns[i].classList.remove('show');
  }
}

function updateCells () {
  for (let i in memory) {
    let cell = $(".cell-" + i);
    if (cell.length == 0) {
      // create the cell
      cell = $(document.createElement('span'));
      cell.addClass("cell-" + i)
      $('.cell-container').append(cell);
    }
    if(i == memoryPointer)
      cell.addClass('selected');
    else
      cell.removeClass('selected');
    cell.text(memory[i]);
  }
}

/**
 * @function disableConsoleInput - Empties and disables the console input
 */
function disableConsoleInput() {
  $('#console-input')
    .attr('disabled', true)
    .val("");
}

/**
 * @function requestInput - Enables and sets the focus to the input. Pauses the
 * interpretation until the user enters their input.
 */
function requestInput () {
  $('#console-input')
    .attr('disabled', false)
    .focus();
  stopInterpretation();
}

/**
 * @function codeInterval - The function that is called every interval call, and
 * handles the work done at each step
 */
function codeInterval () {
    const char = code[codePosition];
    switch (char) {
      // Add to the memory
      case '+':
        // if the pointer is pointing to a valid memory cell
        if (memoryPointer >= 0) {
          memory[memoryPointer] += 1;
          if (memory[memoryPointer] == 256)
            memory[memoryPointer] = 0;
        }
        codePosition += 1;

        break;

      // Subtract from memory
      case '-':
        if (memoryPointer >= 0) {
          memory[memoryPointer] -= 1;
          if (memory[memoryPointer] == -1)
            memory[memoryPointer] = 255;
        }
        codePosition += 1;
        break;

      // Print from memory
      case '.':
        $(".output").text($(".output").text() + String.fromCharCode(memory[memoryPointer]))
        codePosition += 1;
        break;

      // Move left in memory
      case '<':
        memoryPointer -= 1;
        codePosition += 1;
        break;

      // Moves right in memory
      case '>':
        memoryPointer += 1;
        if (memoryPointer == memory.length)
          memory.push(0);
        codePosition += 1;
        break;

      // Beginning of the Loop
      case '[':
        openBracketPositions.push(codePosition);
        // If at the beginning of the loop, the memory
        // cell is 0, we skip to the end of this loop.
        // We want to skip any nested loops, so we
        // use the opensPassed variable to track if
        // we enter a nested loop.
        if (memory[memoryPointer] == 0){
          opensPassed = 0;
          c = '';
          while (c != ']' && opensPassed == 0) {
            codePosition += 1;
            c = code[codePosition];
            if (c == "[")
              opensPassed += 1;
            if (c == "]")
              opensPassed -= 1;
          }
          break;
        }
        codePosition += 1;
        break;

      case ']':
        lastBrackPosition = openBracketPositions.pop();
        if (memory[memoryPointer] == 0) {
          codePosition += 1;
          break;
        }
        codePosition = lastBrackPosition;
        break;

      // Take Input
      case ',':
        stopInterpretation();
        requestInput();
        return;
        let val = prompt ("Input:");
        break;

      // Memory Dump
      case '*':
        memory[memoryPointer] = "" + memory[memoryPointer]
        console.log(memory);
        memory[memoryPointer] = parseInt(memory[memoryPointer])
        codePosition += 1;
        break;

      // Ignores invalid characters
      default:
        codePosition += 1;
        break;
    }

    if($("#dialog").dialog('isOpen'))
      updateCells();

    // Reached end of code
    if (codePosition >= codeLength) {
      clearInterval(intervalId);
      intervalId = null;
      return;
    }
}

/**
 * @function interpret - Given the brainfuck code we wish to run, it will begin
 * simulating the code on an interval of n steps every 2 ms, where n is the
 * value of numStepsPerInterval. We use an interval to allow for interrupts.
 *
 * @param  {String} code Brainfuck code to interpret
 */
function interpret (c) {
  saveCode()
  // Properties of the code
  codeLength = c.length;
  codePosition = 0;
  // Keeps track of where loops should return
  openBracketPositions = [];
  // memory related variables
  memory = [0];
  memoryPointer = 0;
  $(".output").text("")
  code = c;
  // Stops existing interval if there is one still going
  stopInterpretation();
  // Begins the next interval
  intervalId = setInterval(() => {
    for (let i = 0; i < numStepsPerInterval; i ++)
      codeInterval();
  }, stepDelay);
}

/**
 * @function stopInterpretation - Stops the ongoing interval simulating the
 * brainfuck code. Does NOT clear all the variables tracking the memory or
 * position in the code so that the interpretation can be resumed.
 */
function stopInterpretation () {
  clearInterval (intervalId);
  intervalId = null;
}

/**
 * @function resumeInterpretation - Starts the interval for simulating the
 * brainfuck code again. Assumes that the variables tracking memory and code
 * position are still intact.
 */
function resumeInterpretation () {
  intervalId = setInterval (codeInterval, stepDelay);
}

/**
 * @function saveCode - Saves the current content of the code development
 * window to HTML Local Storage, to be loaded next time this webpage is visited.
 */
function saveCode () {
  window.localStorage.setItem("code", $("#editor").val());
}

/**
 * @function loadCode - Loads the last saved code from HTML Local Storage.
 */
function loadCode () {
  $("#editor").text(window.localStorage.getItem("code"));
}
