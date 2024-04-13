'use strict';
/**
 * Turing machine visualization component.
 *
 * • Adds running and reset on top of the base Turing machine.
 * • Displays an animated state diagram and tape diagram.
 * Does not include UI elements for controlling the machine.
 *
 * @module
 */

var TuringMachine = require('./TuringMachine').TuringMachine,
  TapeViz = require('./tape/TapeViz'),
  StateGraph = require('./state-diagram/StateGraph'),
  StateViz = require('./state-diagram/StateViz'),
  watchInit = require('./watch').watchInit,
  d3 = require('d3');

/**
 * Create an animated transition function.
 * @param  {StateGraph} graph
 * @param  {LayoutEdge -> any} animationCallback
 * @return {(string, string) -> Instruction} Created transition function.
 */
function animatedTransition(graph, animationCallback) {
  return function (state, symbol) {
    var tuple = graph.getInstructionAndEdge(state, symbol);
    if (tuple == null) {
      return null;
    }

    animationCallback(tuple.edge);
    return tuple.instruction;
  };
}

/**
 * Default edge animation callback.
 * @param  {{domNode: Node}} edge
 * @return {D3Transition} The animation. Use this for transition chaining.
 */
function pulseEdge(edge) {
  var edgepath = d3.select(edge.domNode);
  return edgepath
    .classed('active-edge', true)
    .transition()
    .style('stroke-width', '3px')
    .transition()
    .style('stroke-width', '1px')
    .transition()
    .duration(0)
    .each('start', /* @this edge */ function () {
      d3.select(this).classed('active-edge', false);
    })
    .style('stroke', null)
    .style('stroke-width', null);
}

function addTape(div, spec) {
  //build the controls div using d3 code
  var container = div.append('div')
    .attr('id', 'tape-edit-controls')
    .attr('style', 'display: none')
    .classed('edit-controls', true);

  var inputDiv = container.append('div')
    .append('label')
    .attr('for', 'tape-edit-input')
    .attr('style', 'font-weight: bold')
    .text('Input:');

  inputDiv.append('input')
    .attr('id', 'tape-edit-input')
    .attr('type', 'text')
    .attr('style', 'width: 100px; text-align: center');

  var blankDiv = container.append('div')
    .append('label')
    .attr('for', 'tape-edit-blank')
    .attr('style', 'font-weight: bold')
    .text('Blank:');

  blankDiv.append('input')
    .attr('id', 'tape-edit-blank')
    .attr('type', 'text')
    .attr('maxlength', '1')
    .attr('style', 'width: 30px; text-align: center');

  container.append('button')
    .attr('id', 'tape-edit-set')
    .classed('btn btn-primary', true)
    .text('Set');

  return new TapeViz(div.append('svg').attr('class', 'tm-tape'), 9,
    spec.blank, spec.input ? String(spec.input).split('') : []);
}

/**
 * Construct a new state and tape visualization inside a &lt;div&gt;.
 * @constructor
 * @param {HTMLDivElement} div        div to take over and use.
 * @param                  spec       machine specification
 * @param {PositionTable} [posTable]  position table for the state nodes
 */
function TMViz(div, spec, posTable) {
  div = d3.select(div);
  var graph = new StateGraph(spec.table);
  this.stateviz = new StateViz(
    div,
    graph.getVertexMap(),
    graph.getEdges()
  );
  if (posTable != undefined) {
    this.positionTable = posTable;
  }

  this.edgeAnimation = pulseEdge;
  this.stepInterval = 100;

  var self = this;

  // We hook into the animation callback to know when to start the next step (when running).
  function animateAndContinue(edge) {
    var transition = self.edgeAnimation(edge);
    if (self.isRunning) {
      transition.transition().duration(self.stepInterval).each('end', function () {
        // stop if machine was paused during the animation
        if (self.isRunning) {
          self.step();
        }
      });
    }
  }

  this.machine = new TuringMachine(
    animatedTransition(graph, animateAndContinue),
    spec.startState,
    addTape(div, spec)
  );
  // intercept and animate when the state is set
  watchInit(this.machine, 'state', function (prop, oldstate, newstate) {
    d3.select(graph.getVertex(oldstate).domNode).classed('current-state', false);
    d3.select(graph.getVertex(newstate).domNode).classed('current-state', true);
    return newstate;
  });

  // Sidenote: each "Step" click evaluates the transition function once.
  // Therefore, detecting halting always requires its own step (for consistency).
  this.isHalted = false;

  var isRunning = false;
  /**
   * Set isRunning to true to run the machine, and false to stop it.
   */
  Object.defineProperty(this, 'isRunning', {
    configurable: true,
    get: function () {
      return isRunning;
    },
    set: function (value) {
      if (isRunning !== value) {
        isRunning = value;
        if (isRunning) {
          this.step();
        }
      }
    }
  });

  this.resetRunLog();

  this.__parentDiv = div;
  this.__spec = spec;
  this.__graph = graph;
  this.__step = 1;
}

TMViz.prototype.resetRunLog = function () {
    var runLogTable = d3.select("#runLogTable");
    runLogTable.selectAll("tbody").remove();
    var newRow = runLogTable.append("tbody").append("tr");
    newRow.append("td").text("Step");
    newRow.append("td").text("Transition");
    newRow.append("td").text("Tape");
    newRow.append("td").text("New State");

    var secondRow = runLogTable.append("tbody").append("tr");
    secondRow.append("td").text("");
    secondRow.append("td").text("");
    secondRow.append("td").text(this.machine.tape.toString());
    secondRow.append("td").text(this.machine.state);
}

/**
 * Step the machine immediately and interrupt any animations.
 */
TMViz.prototype.step = function () {
  var prevState = this.machine.state;
  var prevSymbol = this.machine.tape.read();
  var a = this.machine.extendedStep();

  if (a === null) {
    this.isRunning = false;
    this.isHalted = true;
    return;
  }

  var vertex = this.__graph.getVertex(prevState);
  var transitions = vertex.transitions;
  var transition = transitions[prevSymbol];
  var edge = transition.edge;
  var label = edge.labelsForSymbol[prevSymbol];
  // if (label !== undefined) {
  //   console.log(label);
  // }
  var runLogTable = d3.select("#runLogTable");
  var newRow = runLogTable.append("tbody").append("tr");
  newRow.append("td").text(this.__step);
  newRow.append("td").text(label);
  newRow.append("td").text(this.machine.tape.toString());
  newRow.append("td").text(this.machine.state);
  this.__step++;
};

/**
 * Reset the Turing machine to its starting configuration.
 */

TMViz.prototype.reset = function () {
  this.isRunning = false;
  this.isHalted = false;
  this.machine.state = this.__spec.startState;
  this.machine.tape.domNode.remove();
  this.machine.tape = addTape(this.__parentDiv, this.__spec);
  this.resetRunLog();
  this.__step = 1;
};

Object.defineProperty(TMViz.prototype, 'positionTable', {
  get: function () {
    return this.stateviz.positionTable;
  },
  set: function (posTable) {
    this.stateviz.positionTable = posTable;
  }
});

module.exports = TMViz;
