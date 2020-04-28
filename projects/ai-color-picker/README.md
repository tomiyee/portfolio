# The AI Color Picker

In short, this project is a live demonstration of training a Neural Network.


This project was one of the first ideas that I had when I found out about the
tensorflow-js library.


<h3>Note</h3>
<p>
  The model begins completely random, and does <b>not</b>
  automatically reload its weights whenever you refresh the page.
  This means that the AI will be dumb again. Retrain it in the <i>
  See the Data</i> tab.
</p>
<h3>What the Neural Network Should Do</h3>
<p>
  We want to create an AI that, when given a random background
  color, will advise the user if the ideal text color is black
  or white. However, like any machine learning model, this neural
  network needs loads of data. That's where you come in!
</p>
<p>
  In the second tab above, you will be giving <strong>your</strong>
  opinion on what color of text is easier to read on a given
  background color. The AI will also be tagging along at the bottom,
  giving its own best guess, and learning from the examples you
  give it.
</p>
<h3>About the Neural Network</h3>

![A Neural Network](images/nn.png) 

<p>
  In this simple example, a small neural network is first created
  with random weights. It's given the color and attempts to categorize
  it into one of two groups, a group of colors for white text and
  one for black text. Below the buttons, you'll find the model's
  guess and its confidence in its classification as you are choosing
  the colors. You'll notice that the confidence of the model
  starts at about 50%, which is reasonable since it is essentially
  guessing.
</p>
<p>
  Every ten (10) colors you feed it (called data samples), the model
  will start to read and train itself on your input. Afterward,
  its attempts at guessing will become more confident and accurate.
  Like any machine learning model, the more data you feed it, the
  more accurate and confident it becomes, so keep on giving it
  samples until you think its "good enough!"
</p>
