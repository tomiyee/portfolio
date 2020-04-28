// Shorthands
const Sequential = tf.sequential;
const Dense = tf.layers.dense;
// Constants
const SHOW_TRAINING = false;
const DATA_TAG = "ai-color-picker:data";
const SAMPLES_BETWEEN_TRAINING = 10;
// Variabls
let data = [];
let currCol = [];
let model;
let whiteSamples = 0;
let blackSamples = 0;

window.onload = start;

/**
 * @function start - Initializes the entire project, doing the following in order:
 * 1. Loads saved data if data exists.
 * 2. Sorts the existing data in order of increasing distance to black
 * 3. Initializes the brand new model
 * 4. Initializes JQuery UI elements and event handler binding.
 */
function start () {

  // Loads data if there is data saved
  if (localStorage.hasOwnProperty(DATA_TAG) &&
      localStorage[DATA_TAG].length > 0)
    data = JSON.parse(localStorage[DATA_TAG]);
  else
    localStorage.setItem(DATA_TAG, JSON.stringify([]))

  // Sorts the data in order of dark to light
  sortData();
  for (let i in data)
    addColor(data[i][0], data[i][1][0] == 0 ? 'white' : 'black')

  // Initialize everything involved in with Machine Learning
  initModel ();
  currCol = randomColor();
  updateModelGuess();

  // All the JQuery stuff
  $(".jquery-tabs").tabs();
  $( "#dialog-confirm" ).dialog().dialog('close');
  $('.training-progress-bar-space').hide();
  $('.training-progress-bar').progressbar({value:0});
  $('.color-option').css('background-color', rgb(...getRGB(currCol)) );
  $('.left-option').bind('click', () => clickHandler('white'));
  $('.right-option').bind('click', () => clickHandler('black'));
  $('.clear-data-button').bind('click', openDeleteDataPopup);
  $('.train-button').bind('click', () => tf.tidy(()=>{
    const t = convertToTensor(data);
    trainModel(t.input, t.labels);
  }));

  $(".sortable").sortable({connectWith:'.sortable'});
  $(".sortable").disableSelection();
  $('.classified-white').sortable({'receive': (e, ui) => {
    whiteSamples += 1;
    blackSamples -= 1;
    $('.white-text-num').text(whiteSamples);
    $('.black-text-num').text(blackSamples);
    const color = JSON.parse(ui.item.attr('color'));
    for (let i in data){
      if (data[i][0][0] == color[0] && data[i][0][1] == color[1] && data[i][0][2] == color[2]){
        data[i][1][0] = 0;
        localStorage[DATA_TAG] = JSON.stringify(data);
        return;
      }
    }
    console.error ("Couldn't find the color in the list of data!");
  }});
  $('.classified-black').sortable({'receive': (e, ui) => {
    whiteSamples -= 1;
    blackSamples += 1;
    $('.white-text-num').text(whiteSamples);
    $('.black-text-num').text(blackSamples);
    const color = JSON.parse(ui.item.attr('color'));
    for (let i in data){
      if (data[i][0][0] == color[0] && data[i][0][1] == color[1] && data[i][0][2] == color[2]){
        data[i][1][0] = 1;
        localStorage[DATA_TAG] = JSON.stringify(data);
        return;
      }
    }
    console.error ("Couldn't find the color in the list of data!");
  }});
}

/**
 * @function clickHandler -
 * 1. Saves the choice of color to the data list locally
 * 2. Displays a new random background color
 * 3. Trains the model on the new data every SAMPLES_BETWEEN_TRAINING samples
 * 4. Displays the model's prediction for the new color
 *
 * @param  {String} opt - Either "white" or "black"
 */
async function clickHandler (opt) {
  // 1. Saves the selection to the data.
  const label = opt == "white" ? [0] : [1];
  data.push([currCol, label]);
  localStorage[DATA_TAG] = JSON.stringify(data);
  addColor(currCol, opt)

  // 2. Display a new random background color
  currCol = randomColor();
  $('.color-option').css('background-color', rgb(...getRGB(currCol)));

  // 3. Train the model on new data
  if (data.length % SAMPLES_BETWEEN_TRAINING == 0){
    let t = convertToTensor(data);
    await trainModel(t.input, t.labels);
    $('.decision-space').show();
  }

  // 4. Predict using the model and show its guess.
  updateModelGuess();
}

/**
 * @function initModel - Using Tensorflow, creates a newly initialized model,
 * called once at the start of the project. Assigns the new model to the global
 * model variable
 */
function initModel () {
  // We will construct a very simple Neural Network with the layers
  // (3 nodes) -> (6 nodes) -> (1 node)
  // The output will be 0 if the given rgb values suit white text

  model = Sequential();
  // The hidden layer (6 nodes)
  model.add(Dense({inputShape:[3], units:6, useBias:true, activation:'relu'}));
  // The output layer (1 node)
  model.add(Dense({units:1, useBias:true, activation: 'sigmoid'}));
  // Compile the model
  model.compile({
    optimizer: 'adam',
    loss: 'binaryCrossentropy',
    metrics:['accuracy']
  });
}

/**
 * trainModel - Trains the global model with the provided inputs and labels.
 * 1. Hides Decision space, shows the progressbar
 * 2. Define the callbacks
 * 3. Begin the training
 * 4. Shows Decision space, hides the progressbar
 *
 * @param  {tf.tensor2d} [inputs] - A list of sample inputs
 * @param  {tf.tensor2d} [labels] - A list of sample labels
 * @param  {Number} [e=20]     (Def. 50) Number of Epochs to train
 */
async function trainModel (inputs, labels, epochs=100) {

  // Hides the decision space, and shows the progress bar
  $('.decision-space').hide();
  $('.data-container').hide();
  $('.training-progress-bar-space').show();
  $('.train-button').attr('disabled', true);

  if (typeof inputs == 'undefined' && typeof labels == 'undefined') {
    t = convertToTensor (data);
    inputs = t.input;
    labels = t.labels;
  }
  // Training Hyperparameters
  const batchSize = 20;

  // Every time we begin training, we will update the progressbar accordingly
  let callbacks = {
    onEpochBegin: (epoch, logs) => {
      $('.training-progress-bar').progressbar('value',100*epoch/epochs);
    }
  }
  // If SHOW_TRAINING is true, we will also add the onEpochEnd callback from tfvis
  if (SHOW_TRAINING) {
    callbacks = {
      ... callbacks,
      ... tfvis.show.fitCallbacks(
        { name: 'Training Performance' },
          ['acc'],
        { height: 200, callbacks: ['onEpochEnd']})
    }
  }

  // Begins the actual training of the model
  await model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle:true,
    callbacks
  });

  // Hides the progressbar and shows the decision space
  $('.training-progress-bar-space ').hide();
  $('.decision-space').show();
  $('.data-container').show();
  $('.train-button').attr('disabled', false);
}

/**
 * @function convertToTensor - Given a list of samples, where every sample is a
 * list. The first element in the sample is the list of features, the second is
 * a list with the label. An example of a sample is [ [255,255,255], [1] ]. It
 * shuffles the data, and returns a dict with the separated lists of inputs and
 * labels.
 *
 * @param  {Number[][][]} data - A List of Samples
 * @return {Object}      A dictionary with tf.tensor2d properties "input" and "labels"
 */
function convertToTensor (data) {
  // Wrapping the following calculations in tf.tidy
  return tf.tidy(() => {
    // Step 1. Shuffle the Data
    tf.util.shuffle(data);

    // Step 2. Convert the Data to a Tensor
    const input = [];
    const labels = [];
    for (let i in data) {
      input.push(data[i][0]);
      labels.push(data[i][1]);
    }
    // Step 3. Return the tensors as an object
    return {
      input:tf.tensor2d(input),
      labels:tf.tensor2d(labels)
    };
  });
}

/**
 * @function predict - Returns the model's prediction on the global var currCol
 *
 * @return {Number}  Float, the model's confidence that the ideal text color is black.
 */
function predict () {
  return tf.tidy (() => {
    return model.predict( tf.tensor2d([currCol]) ).dataSync()[0];
  });
}

/**
 * @function updateModelGuess - Predicts using the model, shows which text color
 * the model believes goes best, and displays confidence.
 */
function updateModelGuess() {
  let guess = predict ();
  if (guess < 0.5)
    $('.chose-white').append($(".model-pred"));
  else
    $('.chose-black').append($(".model-pred"));
  $('.model-confidence').text(round((guess>0.5?guess:1-guess)*100,1));
}

/**
 * @function sortData - Sorts the dataset in order of increasing distance from
 * [0,0,0] in rgb values
 */
function sortData () {
  data = data.sort((sample1, sample2) => {
    return dist (getRGB(sample1[0]), [0,0,0]) - dist (getRGB(sample2[0]), [0,0,0]);
  });
}

/**
 * @function openDeleteDataPopup - Opens the dialog to make sure that the user
 * wishes to delete all of their training data.
 */
function openDeleteDataPopup () {
  $( "#dialog-confirm" ).dialog({
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    buttons: {
      "Delete all items": function() {
        clearData();
        $( this ).dialog( "close" );
      },
      Cancel: function() {
        $( this ).dialog( "close" );
      }
    }
  });
}

/**
 * @function clearData - Deletes all of the samples the user has previously chosen.
 */
function clearData () {
  localStorage.setItem(DATA_TAG, JSON.stringify([]))
  $('.classified-colors').empty();
  $('.white-text-num').text(0);
  $('.black-text-num').text(0);
}

/**
 * @function randomColor - Returns a random list of rgb values on the range
 * [0, 1)
 *
 * @return {Integer[]} List of rgb values
 */
function randomColor () {
  return [Math.random(), Math.random(), Math.random()];
}

/**
 * @function addColor - This handles adding a color to the data visualization
 * table in the other tab.
 *
 * @param  {Number[]} color        An array with 3 numbers on the range [0, 255]
 * @param  {String} classification "white" or "black"
 */
function addColor (color, classification) {
  let colorBlock = $(document.createElement('li'))
    colorBlock.css('background-color',rgb(...getRGB(color)));
    colorBlock.appendTo($('.classified-' + classification));
    colorBlock.attr('color', JSON.stringify(color));
  if (classification == "white")
    $('.white-text-num').text(whiteSamples += 1);
  else
    $('.black-text-num').text(blackSamples += 1);
}

/**
 * @function getRGB - Multiplies the list of 3 numbers on the range [0,1) by 255 to get the rgb representation of the color
 *
 * @param  {Number[]} l A list of numbers
 * @return {Number[]}   l where the first three elements are multiplied by 255
 */
function getRGB (l) {
  return [l[0]*255, l[1]*255, l[2]*255];
}

/**
 * @function dist - Finds the euclidean distance between two points of equal dimension
 *
 * @param  {Number[]} pt1 An array of numbers to represent the point.
 * @param  {Number[]} pt2 An array of numbers to represent the point.
 * @return {Number} The euclidean distance between the two points
 */
function dist (pt1, pt2) {
  if (pt1.length != pt2.length)
    throw new Exception ("Cannot find distance between pts of unequal dimension.");
  let s = 0;
  for (let i in pt1)
    s += (pt1[i]-pt2[i])**2;
  return Math.sqrt(s);
}
