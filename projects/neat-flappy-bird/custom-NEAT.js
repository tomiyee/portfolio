class InnovationBank {
  constructor () {
    this.numNodes = 0;
    this.innovNum = 0;
    this.connections = [];
  }

  addConnection (inputNode, outputNode) {
    // Error Check 1 - Existing Connection
    if (this.hasConnection(inputNode, outputNode) != -1) {
      console.error("Attempted to add a Connection that already exists");
      return -1;
    }
    // Error Check 2 - Invalid Input Node
    if (inputNode + 1 > this.numNodes || inputNode < 0 || inputNode != round(inputNode)) {
      console.error("Attempted to add a Connection with invalid inputNode:", inputNode);
      return -1;
    }
    // Error Check 3 - Invalid Output Node
    if (outputNode + 1 > this.numNodes || outputNode < 0 || outputNode != round(outputNode)) {
      console.error("Attempted to add a Connection with invalid outputNode:", outputNode);
      return -1;
    }

    // 1. Create the new connection
    let conn = new Connection (this.innovNum, inputNode, outputNode);
    this.connections.push(conn);

    // 2. Increments the global innovation number
    this.innovNum += 1;

    // 3. Return the innovation number of the new connection
    return conn.innovNum;
  }

  addNode () {
    this.numNodes += 1;
  }

  /**
   * @function hasConnection - Checks if the InnovationBank already has a connection
   * between the two given nodes. If there is such a connection, it returns
   * that connection's respective innovation number. Otherwise, it returns
   * -1.
   *
   * @param  {type} inputNode  The input node
   * @param  {type} outputNode description
   * @return {type}            description
   */
  hasConnection (inputNode, outputNode) {
    for (let i = 0; i < this.connections.length; i++) {
      let c = this.connections[i];
      if (c.inputNode != inputNode)
        continue;
      if (c.outputNode != outputNode)
        continue;
      return c.getInnovationNumber();
    }
    return -1;
  }

  getNumNodes () {
    return this.numNodes;
  }
}

/**
 * @class Connection - description
 *
 * @param  {type} innov      The connection's global innovation number
 * @param  {type} inputNode  The connection's input node
 * @param  {type} outputNode The connection's output node
 * @param  {type} weight     The connection's weight
 */
class Connection {

  constructor (innov=-1, inputNode, outputNode, weight=0) {
    this.innov = innov;
    this.enabled = true;
    this.inputNode = inputNode;
    this.outputNode = outputNode;
    this.weight = weight;
  }

  /**
   * @function disable - Disables this gene
   *
   * @return {type}  description
   */
  disable () {
    this.enabled = false;
  }

  get innovNum () {
    return this.innov;
  }

  set innovNum (innovNum) {
    this.innov = innovNum;
  }

  getInnovationNumber () {
    return this.innov
  }

  /**
   * @function clone - Returns a copy of this Connection.
   *
   * @return {Connection}  A copy of this connection object
   */
  clone () {
    let copy = new Connection(this.innov, this.inputNode, this.outputNode, this.weight);
      copy.enabled = this.enabled;
    return copy;
  }
}

/**
 * @class Node - A node object that will go inside of the Neural Netowork
 */
class Node {
  constructor () {
    this.sum = 0;
  }

  /**
   * @function add - Adds the given value to the running sum of connections for
   * the node.
   *
   * @param  {Number} n The number to add
   * @return {Node}     Chaining
   */
  add (n) {
    this.sum += n;
    return this;
  }

  /**
   * @function value - Applies the activation function to the saved sum of input
   * values.
   *
   * @return {Number}  The activation function applied to the sum;
   */
  value () {
    return sigmoid (this.sum);
  }
}

class NeatNetwork {

  constructor (innovationBank) {
    if (!(innovationBank instanceof InnovationBank))
      throw new Error("NeatNetwork using NEAT must be provided an Innovation Bank instance.");
    this.nodes = [];
    this.connections = [];
    this.innovBank = innovationBank;
    this.useBias = true;
  }

  initialize (inputNodes, outputNodes) {
    // Initialize a neural network were all of the inputs are connected to the out
    this.addNodes(inputNodes + outputNodes);
    for (let i = 0; i < inputNodes; i++)
      for (let o = 0; o < outputNodes; o++)
        this.addConnection(i, inputNodes + o, rand(-2, 2));
  }

  bias (useBias) {
    this.useBias = useBias;
  }

  /**
   * @function feedForward - Runs the feed-forward neural network.
   *
   * @param  {Number[]} inputs An array of numbers with the same dim as the input
   * @return {Object.<Integer, Number>} Mapping of output node indices to its result
   */
  feedForward (inputs) {
    // Plan of Attack
    // 0a. Reset the values in the nodes
    // 0b. Assigns the input values
    // 1. Build Dependency Dictionary
    // 2. Find Nodes With No Dependencies
    // 3. Feed Forward Nodes with no dependencies.
    // 4. Remove the Nodes with no dependencies from Dependency Dictionairy
    // 5. Return to 2 if output node not reached

    // 0a. Reset the values in the nodes
    for (let i in this.nodes)
      this.nodes[i].sum = 0;
    // 0b. Assigns the input values
    let inputNodes = this.getInputNodes();
    let inputsIndex = 0;
    if (USE_BIAS)
      inputs = [1, ...inputs]
    for (let i of inputNodes) {
      this.nodes[i].add(inputs[inputsIndex]);
      inputsIndex++;
    }

    // 1. Build Dependency Dictionary
    let dep = {};
    // Initialize the values of the dictionary
    for (let nodeNum of range(this.nodes.length))
      dep[nodeNum] = new Set();
    for (let i in this.connections) {
      let conn = this.connections[i];
      if (conn.enabled)
        dep[conn.outputNode].add(conn.inputNode);
    }

    let unvisited = new Set(range(this.nodes.length));
    while (unvisited.size > 0) {
      // 2. Find Nodes With No Dependencies
      let noDeps = new Set();
      for (let i of unvisited)
        if (dep[i].size == 0)
          noDeps.add(i);
      // 3. Feed Forward Nodes with no dependencies.
      for (let i in this.connections) {
        let conn = this.connections[i];
        // Skip if connection doesn't involve a node in noDeps
        if (!noDeps.has(conn.inputNode))
          continue;
        // Skip if connection is disabled
        if (!conn.enabled)
          continue;
        let inputNode = this.nodes[conn.inputNode];
        let outputNode = this.nodes[conn.outputNode];
        // Feed forward
        outputNode.add(inputNode.value() * conn.weight);
        dep[conn.outputNode].delete(conn.inputNode);
      }
      // 4. Remove the Nodes with no dependencies from Dependency Dictionairy
      for (let i of noDeps)
        unvisited.delete(i);
      // Break if we cannot feed forward any further
      if (noDeps.size == 0)
        break;
      // 5. Return to 2 if output node not reached
    }

    // Format the output properly
    let outputNodes = this.getOutputNodes();
    let result = {};
    for (let n of outputNodes)
      result[n] = this.nodes[n].value();
    return result;
  }

  /**
   * @function getInputNodes - Searches the neural network for the input nodes, aka
   * the nodes with no dependencies
   *
   * @return {Set<Integer>}  A set of the node indices for the found Input Nodes
   */
  getInputNodes () {
    let inputNodes = new Set(range(this.nodes.length));
    for (let i in this.connections)
      inputNodes.delete(this.connections[i].outputNode);
    return inputNodes;
  }

  /**
   * @function getInputNodes - Searches the neural network for the output nodes,
   * aka the nodes with no outgoing connections
   *
   * @return {Set<Integer>}  A set of the node indices for the found Output Nodes
   */
  getOutputNodes () {
    let outputNodes = new Set(range(this.nodes.length));
    for (let i in this.connections)
      outputNodes.delete(this.connections[i].inputNode);
    return outputNodes;
  }

  /**
   * @function addNode - Adds 1 node to the Neural Network.
   *
   * @return {NeuralNetwork}       Chaining
   */
  addNode () {
    this.nodes.push(new Node());
    if (this.nodes.length > this.innovBank.getNumNodes())
      this.innovBank.addNode();
    return this;
  }

  /**
   * @function addNodes - Adds n nodes to the Neural Network.
   *
   * @param  {Integer} n      The number of nodes to add.
   * @return {NeuralNetwork}  Chaining
   */
  addNodes (n) {
    for (let i of range(n))
      this.addNode();
    return this;
  }

  /**
   * @function addConnection - Adds a connection object with the given properties
   *
   * @param  {Integer} inputNode      The index of the input node
   * @param  {Integer} outputNode     The index of the output node
   * @param  {Number}  weight         The weight of the connection
   * @param  {Boolean} [active=true]  Whether or not to enable the connection
   * @return {Boolean}                True if successfully added, false otherwise
   */
  addConnection (inputNode, outputNode, weight, active=true) {
    // 1. Check if this Network already has the connection
    for (let i = 0; i < this.connections.length; i++) {
      let c = this.connections[i];
      if (c.inputNode == inputNode && c.outputNode == outputNode)
        return false;
    }
    // 2. Add to the InnovationBank if the connection has not existed before
    let innovNum = this.innovBank.hasConnection(inputNode, outputNode);

    if (innovNum == -1)
      innovNum = this.innovBank.addConnection(inputNode, outputNode);

    // 3. Initialize this object's instance of the above connection
    let c = new Connection (innovNum, inputNode, outputNode, weight, active);
    this.connections.push(c);

    return true;
  }

  mutateNewConnection () {

  }

  mutateNewNode () {

  }

  mutateNewWeight () {

  }

  mutateTweakWeight () {

  }

  printConnections () {
    // 1. Shallow Copy
    let copy = [];
    for (let i = 0; i < this.connections.length; i++)
      copy.push(this.connections[i]);
    // 2. Sort the Shallow copy
    copy.sort((c1, c2) => {
      if (c1.inputNode < c2.inputNode)
        return -1;
      if (c1.outputNode < c2.outputNode)
        return -1;
      return +1;
    })
    // 3.
    for (let i = 0; i < this.connections.length; i++){
      let c = this.connections[i];
      console.log(`<${c.inputNode}> -> <${c.outputNode}> - ${round(c.weight,2)}`);
    }
  }

  /**
   * clone - Returns a copy of this
   *
   * @return {type}  description
   */
  clone () {
    let copy = new NeuralNetwork();
    copy.addNodes(this.nodes.length);
    for (let i in copy.connections) {
      let conn = copy.connections[i];
      copy.addConnection(
        conn.innov,
        conn.inputNode,
        conn.outputNode,
        conn.weight,
        conn.enabled
      );
    }
    return copy;
  }
}


//
// class Population {
//
//
//   constructor ({populationSize=100, numInputs=3, numOutputs=3}) {
//     this.nodes = numInputs + numOutputs + bias;
//     // Dictionary mapping innovNum to connection
//     this.innovNum = 0;
//     this.connectionBank = {};
//     for (let input_i = 0; input_i < numInputs + bias; input_i ++)
//       for (let output_i = 0; output_i < num_outputs; output_i ++)
//         this.connectionBank[this.innovNum] = {in: input_i, out: output_i};
//     // Yeah
//     this.population = [];
//
//     for (let)
//   }
// }
