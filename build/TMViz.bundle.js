var TMViz =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonp_name_"];
/******/ 	window["webpackJsonp_name_"] = function webpackJsonpCallback(chunkIds, moreModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, callbacks = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId])
/******/ 				callbacks.push.apply(callbacks, installedChunks[chunkId]);
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules);
/******/ 		while(callbacks.length)
/******/ 			callbacks.shift().call(null, __webpack_require__);
/******/ 		if(moreModules[0]) {
/******/ 			installedModules[0] = 0;
/******/ 			return __webpack_require__(0);
/******/ 		}
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// "0" means "already loaded"
/******/ 	// Array means "loading", array contains callbacks
/******/ 	var installedChunks = {
/******/ 		0:0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId, callback) {
/******/ 		// "0" is the signal for "already loaded"
/******/ 		if(installedChunks[chunkId] === 0)
/******/ 			return callback.call(null, __webpack_require__);
/******/
/******/ 		// an array means "currently loading".
/******/ 		if(installedChunks[chunkId] !== undefined) {
/******/ 			installedChunks[chunkId].push(callback);
/******/ 		} else {
/******/ 			// start chunk loading
/******/ 			installedChunks[chunkId] = [callback];
/******/ 			var head = document.getElementsByTagName('head')[0];
/******/ 			var script = document.createElement('script');
/******/ 			script.type = 'text/javascript';
/******/ 			script.charset = 'utf-8';
/******/ 			script.async = true;
/******/
/******/ 			script.src = __webpack_require__.p + "" + chunkId + "." + ({"1":"main"}[chunkId]||chunkId) + ".bundle.js";
/******/ 			head.appendChild(script);
/******/ 		}
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*******************!*\
  !*** multi TMViz ***!
  \*******************/
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(/*! ./src/TMViz.js */1);


/***/ }),
/* 1 */
/*!**********************!*\
  !*** ./src/TMViz.js ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

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
	
	var TuringMachine = __webpack_require__(/*! ./TuringMachine */ 2).TuringMachine,
	    TapeViz = __webpack_require__(/*! ./tape/TapeViz */ 3),
	    StateGraph = __webpack_require__(/*! ./state-diagram/StateGraph */ 11),
	    StateViz = __webpack_require__(/*! ./state-diagram/StateViz */ 13),
	    watchInit = __webpack_require__(/*! ./watch */ 16).watchInit,
	    d3 = __webpack_require__(/*! d3 */ 6);
	
	/**
	 * Create an animated transition function.
	 * @param  {StateGraph} graph
	 * @param  {LayoutEdge -> any} animationCallback
	 * @return {(string, string) -> Instruction} Created transition function.
	 */
	function animatedTransition(graph, animationCallback) {
	  return function (state, symbol) {
	    var tuple = graph.getInstructionAndEdge(state, symbol);
	    if (tuple == null) { return null; }
	
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
	
	  container.append('input')
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
	  if (posTable != undefined) { this.positionTable = posTable; }
	
	  this.edgeAnimation = pulseEdge;
	  this.stepInterval = 100;
	
	  var self = this;
	  // We hook into the animation callback to know when to start the next step (when running).
	  function animateAndContinue(edge) {
	    var transition = self.edgeAnimation(edge);
	    if (self.isRunning) {
	      transition.transition().duration(self.stepInterval).each('end', function () {
	        // stop if machine was paused during the animation
	        if (self.isRunning) { self.step(); }
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
	    get: function () { return isRunning; },
	    set: function (value) {
	      if (isRunning !== value) {
	        isRunning = value;
	        if (isRunning) { this.step(); }
	      }
	    }
	  });
	
	  this.__parentDiv = div;
	  this.__spec = spec;
	}
	
	/**
	 * Step the machine immediately and interrupt any animations.
	 */
	TMViz.prototype.step = function () {
	  if (!this.machine.step()) {
	    this.isRunning = false;
	    this.isHalted = true;
	  }
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
	};
	
	Object.defineProperty(TMViz.prototype, 'positionTable', {
	  get: function ()  { return this.stateviz.positionTable; },
	  set: function (posTable) { this.stateviz.positionTable = posTable; }
	});
	
	module.exports = TMViz;


/***/ }),
/* 2 */
/*!******************************!*\
  !*** ./src/TuringMachine.js ***!
  \******************************/
/***/ (function(module, exports) {

	'use strict';
	/**
	 * Construct a Turing machine.
	 * @param {(state, symbol) -> ?{state: state, symbol: symbol, move: direction}}
	 *   transition
	 *   A transition function that, given *only* the current state and symbol,
	 *   returns an object with the following properties: symbol, move, and state.
	 *   Returning null/undefined halts the machine (no transition defined).
	 * @param {state} startState  The state to start in.
	 * @param         tape        The tape to use.
	 */
	function TuringMachine(transition, startState, tape) {
	  this.transition = transition;
	  this.state = startState;
	  this.tape = tape;
	}
	
	TuringMachine.prototype.toString = function () {
	  return String(this.state) + '\n' + String(this.tape);
	};
	
	/**
	 * Step to the next configuration according to the transition function.
	 * @return {boolean} true if successful (the transition is defined),
	 *   false otherwise (machine halted)
	 */
	TuringMachine.prototype.step = function () {
	  var instruct = this.nextInstruction;
	  if (instruct == null) { return false; }
	
	  this.tape.write(instruct.symbol);
	  move(this.tape, instruct.move);
	  this.state = instruct.state;
	
	  return true;
	};
	
	Object.defineProperties(TuringMachine.prototype, {
	  nextInstruction: {
	    get: function () { return this.transition(this.state, this.tape.read()); },
	    enumerable: true
	  },
	  isHalted: {
	    get: function () { return this.nextInstruction == null; },
	    enumerable: true
	  }
	});
	
	// Allows for both notational conventions of moving the head or moving the tape
	function move(tape, direction) {
	  switch (direction) {
	    case MoveHead.right: tape.headRight(); break;
	    case MoveHead.left:  tape.headLeft();  break;
	    default: throw new TypeError('not a valid tape movement: ' + String(direction));
	  }
	}
	var MoveHead = Object.freeze({
	  left:  {toString: function () { return 'L'; } },
	  right: {toString: function () { return 'R'; } }
	});
	var MoveTape = Object.freeze({left: MoveHead.right, right: MoveHead.left});
	
	exports.MoveHead = MoveHead;
	exports.MoveTape = MoveTape;
	exports.TuringMachine = TuringMachine;


/***/ }),
/* 3 */
/*!*****************************!*\
  !*** ./src/tape/TapeViz.js ***!
  \*****************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var Tape = __webpack_require__(/*! ./Tape.js */ 4),
	    d3   = __webpack_require__(/*! d3 */ 6);
	__webpack_require__(/*! ./tape.css */ 7);
	var jsyaml = __webpack_require__(/*! js-yaml */ 8);
	var ace = __webpack_require__(/*! ace-builds/src-min-noconflict */ 9);
	const util = __webpack_require__(/*! ../util */ 10);
	
	var nodeEditControls = window.document.getElementById('node-edit-controls');
	var transitionEditControls = window.document.getElementById('transition-edit-controls');
	var nodeLabel = window.document.getElementById('nodeLabel');
	var startState = window.document.getElementById('startState');
	var read = window.document.getElementById('read');
	var write = window.document.getElementById('write');
	var moveL = window.document.getElementById('moveL');
	var moveR = window.document.getElementById('moveR');
	var deleteNode = window.document.getElementById('deleteNode');
	var deleteLink = window.document.getElementById('deleteLink');
	var source = ace.edit(document.getElementById('editor-container'));
	var cellWidth = 50;
	var cellHeight = 50;
	
	function initTapeCells(selection) {
	  selection.attr('class', 'tape-cell');
	  selection.append('rect')
	      // the box outline is purely visual, so remove its data binding
	      .datum(null)
	      .attr({'width': cellWidth,
	        'height': cellHeight});
	  selection.append('text')
	      .text(function (d) { return d; })
	      .attr({'x': cellWidth/2, 'y': cellHeight/2 + 8});
	  return selection;
	}
	
	function positionCells(selection, offset) {
	  offset = (offset == null) ? 0 : offset;
	  selection.attr('transform', function (d, i) {
	    return 'translate(' + (-cellWidth+10 + cellWidth*(i+offset)) + ')';
	  });
	  return selection;
	}
	
	function repositionWrapper(wrapper) {
	  wrapper.attr('transform', 'translate(0 10)')
	    .transition()
	      .duration(0)
	    .select('.exiting')
	      .remove();
	}
	
	// Tape visualization centered around the tape head.
	function TapeViz(svg, lookaround, blank, input) {
	  Tape.call(this, blank, input);
	
	  Object.defineProperty(this, 'lookaround', {
	    value: lookaround,
	    writable: false,
	    enumerable: true
	  });
	  Object.defineProperty(this, 'domNode', {
	    value: svg,
	    writable: false,
	    enumerable: true
	  });
	
	  // width is before + head + after, trimming 2 off to show cut-off tape ends
	  var width  = cellWidth * (lookaround+1+lookaround-2) + 2*10;
	  var height = cellHeight + 2*10;
	  svg.attr({
	    'width': '95%',
	    'viewBox': [0, 0, width, height].join(' ')
	  });
	
	  this.wrapper = svg.append('g')
	      .attr('class', 'wrapper')
	      .call(repositionWrapper);
	
	  svg.append('rect')
	      .attr({'id': 'tape-head',
	        'width': (1+1/5) * cellWidth,
	        'height': (1+1/5) * cellHeight,
	        'x': -cellWidth+10/2 + cellWidth*lookaround,
	        'y': 10/2
	      });
	
	  this.wrapper.selectAll('.tape-cell')
	      .data(this.readRange(-lookaround, lookaround))
	    .enter()
	    .append('g')
	      .call(initTapeCells)
	      .call(positionCells)
	  ;
	
	  //when the tape is clicked, show the edit controls
	  svg.on('dblclick', function () {
	    console.log("tape doubleclicked");
	    //disable all the form fields - messy...
	    nodeLabel.disabled = true;
	    nodeLabel.value = '';
	    startState.disabled = true;
	    startState.checked = false;
	    deleteNode.disabled = true;
	    read.disabled = true;
	    read.value = '';
	    write.disabled = true;
	    write.value = '';
	    moveL.disabled = true;
	    moveR.disabled = true;
	    deleteLink.disabled = true;
	    transitionEditControls.setAttribute("style", "display: none");
	    nodeEditControls.setAttribute("style", "display: flex");
	    //grab the machine
	    var machine = jsyaml.safeLoad(source.getValue());
	    var controlsDiv = window.document.getElementById('tape-edit-controls');
	    controlsDiv.setAttribute("style", "display: flex");
	    var controlsInput = window.document.getElementById('tape-edit-input');
	    controlsInput.value = machine['input'];
	    var controlsBlank = window.document.getElementById('tape-edit-blank');
	    controlsBlank.value = machine['blank'];
	    var controlsSet = window.document.getElementById('tape-edit-set');
	    controlsSet.addEventListener('click', function () {
	      //change input
	      machine['input'] = controlsInput.value;
	      //change every read symbol that matches the blank symbol
	      for (var node in machine.table) {
	        for (var readSymbols in machine.table[node]){
	          var newRead = [];
	          var splitRead = readSymbols.split(",");
	          for (var symbol of splitRead) {
	            if (symbol === machine['blank']) symbol = controlsBlank.value;
	            newRead.push(symbol);
	          }
	          if (!(readSymbols === newRead.join())){
	             machine.table[node][newRead] = machine.table[node][readSymbols];
	             delete machine.table[node][readSymbols];
	          }
	          if (machine.table[node][newRead].hasOwnProperty("write")) {
	            if (machine.table[node][newRead]['write'] === machine['blank'])
	              machine.table[node][newRead]['write'] = controlsBlank.value
	          }
	        }
	      }
	      //finally change blank symbol
	      machine['blank'] = controlsBlank.value;
	      //we're finished here
	      source.setValue(jsyaml.safeDump(machine));
	      util.setCookie('TMReload', 'tape changed');
	    })
	  });
	}
	
	TapeViz.prototype = Object.create(Tape.prototype);
	TapeViz.prototype.constructor = TapeViz;
	
	// IDEA: chain headLeft/Right to wait for write()?
	TapeViz.prototype.write = function (symbol) {
	  // don't animate if symbol stays the same
	  if (Tape.prototype.read.call(this) === symbol) {
	    return;
	  }
	  Tape.prototype.write.call(this, symbol);
	
	  // remove leftover .exiting in case animation was interrupted
	  this.wrapper.selectAll('.exiting').remove();
	
	  d3.select(this.wrapper[0][0].childNodes[this.lookaround])
	      .datum(symbol)
	    .select('text')
	      .attr('fill-opacity', '1')
	      .attr('stroke-opacity', '1')
	    .transition()
	      .attr('fill-opacity', '0.4')
	      .attr('stroke-opacity', '0.1')
	    .transition()
	      .text(function (d) { return d; })
	      .attr('fill-opacity', '1')
	      .attr('stroke-opacity', '1')
	    .transition()
	      .duration(0)
	      .attr('fill-opacity', null)
	      .attr('stroke-opacity', null)
	    ;
	};
	
	function moveHead(wrapper, enter, exit, wOffset, cOffset) {
	  // add to one end
	  enter.call(initTapeCells);
	  // remove from the other end
	  exit.classed('exiting', true);
	  // translate cells forward, and the wrapper backwards
	  wrapper.selectAll('.tape-cell')
	      .call(positionCells, cOffset);
	  wrapper
	      .attr('transform', 'translate(' + (wOffset*cellWidth).toString() + ' 10)')
	    // animate wrapper returning to neutral position
	    .transition()
	      .call(repositionWrapper);
	}
	
	TapeViz.prototype.headRight = function () {
	  Tape.prototype.headRight.call(this);
	  // remove leftover .exiting in case animation was interrupted.
	  // Important: call-by-value evaluates the selection argument(s) of 'moveHead' before
	  // before entering the function, so exiting nodes have to be removed beforehand.
	  this.wrapper.selectAll('.exiting').remove();
	  moveHead(this.wrapper,
	    // add to right end
	    this.wrapper.append('g')
	        .datum(this.readOffset(this.lookaround)),
	    // remove from left end
	    this.wrapper.select('.tape-cell'),
	    1, -1);
	};
	
	TapeViz.prototype.headLeft = function () {
	  Tape.prototype.headLeft.call(this);
	  this.wrapper.selectAll('.exiting').remove();
	  moveHead(this.wrapper,
	    this.wrapper.insert('g', ':first-child')
	        .datum(this.readOffset(-this.lookaround)),
	    this.wrapper.select('.wrapper > .tape-cell:last-of-type'),
	    -1, 0);
	};
	
	module.exports = TapeViz;


/***/ }),
/* 4 */
/*!**************************!*\
  !*** ./src/tape/Tape.js ***!
  \**************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(/*! lodash/fp */ 5);
	
	// Bidirectional infinite tape
	function Tape(blank, input) {
	  Object.defineProperty(this, 'blank', {
	    value: blank,
	    writable: false,
	    enumerable: true
	  });
	  // zipper data structure
	  // INVARIANTS: tape.before can be empty, tape.after must be nonempty.
	  // before: cells before the head (in order; left to right).
	  // after:  cells after and including the head (in reverse; right to left).
	  this.tape = {
	    before: [],
	    after: (input == null || input.length == 0) ? [blank] : input.slice().reverse(),
	    toString: function () {
	      return this.before.join('') + '🔎' + this.after.slice().reverse().join('');
	    }
	  };
	}
	
	// Read the value at the tape head.
	Tape.prototype.read = function () {
	  return _.last(this.tape.after);
	};
	Tape.prototype.write = function (symbol) {
	  this.tape.after[this.tape.after.length - 1] = symbol;
	};
	
	Tape.prototype.headRight = function () {
	  var before = this.tape.before,
	      after = this.tape.after;
	  before.push(after.pop());
	  if (_.isEmpty(after)) {
	    after.push(this.blank);
	  }
	};
	Tape.prototype.headLeft = function () {
	  var before = this.tape.before,
	      after = this.tape.after;
	  if (_.isEmpty(before)) {
	    before.push(this.blank);
	  }
	  after.push(before.pop());
	};
	
	Tape.prototype.toString = function () {
	  return this.tape.toString();
	};
	
	// for tape visualization. not part of TM definition.
	// Read the value at an offset from the tape head.
	// 0 is the tape head. + is to the right, - to the left.
	Tape.prototype.readOffset = function (i) {
	  var tape = this.tape;
	  if (i >= 0) {
	    // right side: offset [0..length-1] ↦ array index [length-1..0]
	    return (i <= tape.after.length - 1) ? tape.after[tape.after.length - 1 - i] : this.blank;
	  } else {
	    // left side: offset [-1..-length] ↦ array index [length-1..0]
	    return (i >= -tape.before.length) ? tape.before[tape.before.length + i] : this.blank;
	  }
	};
	
	// for tape visualization.
	// Read the values from an offset range (inclusive of start and end).
	Tape.prototype.readRange = function (start, end) {
	  return _.range(start, end+1).map(function (i) {
	    return this.readOffset(i);
	  }, this);
	};
	
	module.exports = Tape;


/***/ }),
/* 5 */
/*!********************!*\
  !*** external "_" ***!
  \********************/
/***/ (function(module, exports) {

	module.exports = _;

/***/ }),
/* 6 */
/*!*********************!*\
  !*** external "d3" ***!
  \*********************/
/***/ (function(module, exports) {

	module.exports = d3;

/***/ }),
/* 7 */
/*!***************************!*\
  !*** ./src/tape/tape.css ***!
  \***************************/
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "tape/tape.css";

/***/ }),
/* 8 */
/*!*************************!*\
  !*** external "jsyaml" ***!
  \*************************/
/***/ (function(module, exports) {

	module.exports = jsyaml;

/***/ }),
/* 9 */
/*!**********************!*\
  !*** external "ace" ***!
  \**********************/
/***/ (function(module, exports) {

	module.exports = ace;

/***/ }),
/* 10 */
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/***/ (function(module, exports) {

	'use strict';
	// misc. utilities
	
	//////////////////////////////////
	// Utilities for null/undefined //
	//////////////////////////////////
	
	// Assert non-null.
	// Return the value if it is not null or undefined; otherwise, throw an error.
	function nonNull(value) {
	  if (value == null) {
	    throw new Error('expected a non-null defined value, but got: ' + String(value));
	  }
	  return value;
	}
	
	// Null coalescing: iff the first argument is null or undefined, return the second.
	function coalesce(a, b) {
	  return (a != null) ? a : b;
	}
	
	// Apply a function to a value if non-null, otherwise return the value.
	// (Monadic bind for maybe (option) type.)
	// ((a -> b), ?a) -> ?b
	function applyMaybe(f, x) {
	  return (x != null) ? f(x) : x;
	}
	
	// Returns the first function result that is not null or undefined.
	// Otherwise, returns undefined.
	// ((a -> ?b), [a]) -> ?b
	function getFirst(f, xs) {
	  for (var i = 0; i < xs.length; ++i) {
	    var val = f(xs[i]);
	    if (val != null) {
	      return val;
	    }
	  }
	}
	
	/////////
	// DOM //
	/////////
	
	/* global document */
	
	/**
	 * Concat an array of DOM Nodes into a DocumentFragment.
	 * @param  {[Node]} array
	 * @return {DocumentFragment}
	 */
	function toDocFragment(array) {
	  var result = document.createDocumentFragment();
	  array.forEach(result.appendChild.bind(result));
	  return result;
	}
	
	///////////////////////
	// IE/Edge detection //
	///////////////////////
	
	// http://stackoverflow.com/a/9851769
	var isBrowserIEorEdge = /*@cc_on!@*/false
	  || Boolean(document.documentMode) || Boolean(window.StyleMedia); // eslint-disable-line
	
	//////////////////////////
	// Cookie Reload Helper //
	//////////////////////////
	//TODO turn this into using local storage instead, since that function is already in-built
	// https://www.w3schools.com/js/js_cookies.asp
	function getCookie(cname) {
	  var name = cname + "=";
	  var decodedCookie = decodeURIComponent(document.cookie);
	  var ca = decodedCookie.split(';');
	  for(let i = 0; i <ca.length; i++) {
	    var c = ca[i];
	    while (c.charAt(0) === ' ') {
	      c = c.substring(1);
	    }
	    if (c.indexOf(name) === 0) {
	      return c.substring(name.length, c.length);
	    }
	  }
	  return "";
	}
	
	function setCookie(cname, cvalue) {
	  const d = new Date();
	  d.setTime(d.getTime() + (24*60*60*1000));
	  var expires = "expires="+ d.toUTCString();
	  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}
	
	exports.nonNull = nonNull;
	exports.coalesce = coalesce;
	exports.applyMaybe = applyMaybe;
	exports.getFirst = getFirst;
	
	exports.toDocFragment = toDocFragment;
	
	exports.isBrowserIEorEdge = isBrowserIEorEdge;
	
	exports.getCookie = getCookie;
	exports.setCookie = setCookie;


/***/ }),
/* 11 */
/*!*****************************************!*\
  !*** ./src/state-diagram/StateGraph.js ***!
  \*****************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(/*! lodash */ 12);
	
	
	/* Interface
	  type TransitionTable = {
	    [state: string]: ?{
	      [symbol: string]: Instruction
	    }
	  };
	  type Instruction = { state?: string, symbol?: string };
	
	  type DiagramGraph = {
	    [state: string]: {
	      label: string,
	      transitions: ?{
	        [symbol: string]: {
	          instruction: Instruction,
	          edge: LayoutEdge
	        }
	      }
	    }
	  };
	  type LayoutEdge = { source: Object, target: Object, labels: [string] }
	 */
	
	/**
	 * Use a transition table to derive the graph (vertices & edges) for a D3 diagram.
	 * Edges with the same source and target are combined.
	 * NB. In addition to single symbols, comma-separated symbols are supported.
	 * e.g. symbol string '0,1,,,I' -> symbols [0,1,',','I'].
	 */
	// TransitionTable -> DiagramGraph
	function deriveGraph(table) {
	  // We need two passes, since edges may point at vertices yet to be created.
	  // 1. Create all the vertices.
	  var graph = _.mapValues(table, function (transitions, state) {
	    return {
	      label: state,
	      transitions: transitions
	    };
	  });
	  // 2. Create the edges, which can now point at any vertex object.
	  var allEdges = [];
	  _.forEach(graph, function (vertex, state) {
	
	    vertex.transitions = vertex.transitions && (function () {
	      var stateTransitions = {};
	
	      // Combine edges with the same source and target
	      var cache = {};
	      function edgeTo(target, label) {
	        var edge = cache[target] ||
	          _.tap(cache[target] = {
	            source: vertex,
	            target: graph[target],
	            labels: []
	          }, allEdges.push.bind(allEdges));
	        edge.labels.push(label);
	        return edge;
	      }
	      // Create symbol -> instruction object map
	      _.forEach(vertex.transitions, function (instruct, symbolKey) {
	        // Handle comma-separated symbols.
	        // Recreate array by splitting on ','. Treat 2 consecutive ',' as , ','.
	        var symbols = symbolKey.split(',').reduce(function (acc, x) {
	          if (x === '' && acc[acc.length-1] === '') {
	            acc[acc.length-1] = ',';
	          } else {
	            acc.push(x);
	          }
	          return acc;
	        }, []);
	        var target = instruct.state != null ? instruct.state : state;
	        var edge = edgeTo(target, labelFor(symbols, instruct));
	
	        symbols.forEach(function (symbol) {
	          stateTransitions[symbol] = {
	            // Normalize for execution, but display the less-cluttered original.
	            instruction: normalize(state, symbol, instruct),
	            edge: edge
	          };
	        });
	      });
	
	      return stateTransitions;
	    }());
	
	  });
	
	  return {graph: graph, edges: allEdges};
	}
	
	// Normalize an instruction to include an explicit state and symbol.
	// e.g. {symbol: '1'} normalizes to {state: 'q0', symbol: '1'} when in state q0.
	function normalize(state, symbol, instruction) {
	  return _.defaults({}, instruction, {state: state, symbol: symbol});
	}
	
	function labelFor(symbols, action) {
	  var rightSide = ((action.symbol == null) ? '' : (visibleSpace(String(action.symbol)) + ','))
	    + String(action.move);
	  return symbols.map(visibleSpace).join(',') + '→' + rightSide;
	}
	
	// replace ' ' with '␣'.
	function visibleSpace(c) {
	  return (c === ' ') ? '␣' : c;
	}
	
	
	/**
	 * Aids rendering and animating a transition table in D3.
	 *
	 * • Generates the vertices and edges ("nodes" and "links") for a D3 diagram.
	 * • Provides mapping of each state to its vertex and each transition to its edge.
	 * @param {TransitionTable} table
	 */
	function StateGraph(table) {
	  var derived = deriveGraph(table);
	  Object.defineProperties(this, {
	    __graph: { value: derived.graph },
	    __edges: { value: derived.edges }
	  });
	}
	
	/**
	 * D3 layout "nodes".
	 */
	// StateGraph.prototype.getVertices = function () {
	//   return _.values(this.__graph);
	// };
	
	/**
	 * Returns the mapping from states to vertices (D3 layout "nodes").
	 * @return { {[state: string]: Object} }
	 */
	StateGraph.prototype.getVertexMap = function () {
	  return this.__graph;
	};
	
	/**
	 * D3 layout "links".
	 */
	StateGraph.prototype.getEdges = function () {
	  return this.__edges;
	};
	
	/**
	 * Look up a state's corresponding D3 "node".
	 */
	StateGraph.prototype.getVertex = function (state) {
	  return this.__graph[state];
	};
	
	StateGraph.prototype.getInstructionAndEdge = function (state, symbol) {
	  var vertex = this.__graph[state];
	  if (vertex === undefined) {
	    throw new Error('not a valid state: ' + String(state));
	  }
	
	  return vertex.transitions && vertex.transitions[symbol];
	};
	
	
	module.exports = StateGraph;


/***/ }),
/* 12 */
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ (function(module, exports) {

	module.exports = lodash;

/***/ }),
/* 13 */
/*!***************************************!*\
  !*** ./src/state-diagram/StateViz.js ***!
  \***************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	//TODO (stretchiest goal) preserve the lower comments in code if possible (might be possible)
	
	var isBrowserIEorEdge = __webpack_require__(/*! ../util */ 10).isBrowserIEorEdge;
	var d3 = __webpack_require__(/*! d3 */ 6);
	var jsyaml = __webpack_require__(/*! js-yaml */ 8);
	var ace = __webpack_require__(/*! ace-builds/src-min-noconflict */ 9);
	var _ = __webpack_require__(/*! lodash/fp */ 5);
	var assign = __webpack_require__(/*! lodash */ 12).assign; // need mutable assign()
	
	//diagram direct edit form fields
	var nodeEditControls = window.document.getElementById('node-edit-controls');
	var transitionEditControls = window.document.getElementById('transition-edit-controls');
	var nodeLabel = window.document.getElementById('nodeLabel');
	var startState = window.document.getElementById('startState');
	var read = window.document.getElementById('read');
	var write = window.document.getElementById('write');
	var moveL = window.document.getElementById('moveL');
	var moveR = window.document.getElementById('moveR');
	var deleteNode = window.document.getElementById('deleteNode');
	var deleteLink = window.document.getElementById('deleteLink');
	var source = ace.edit(document.getElementById('editor-container'));
	
	// *** Arrays as vectors ***
	
	// Add vectors.
	// Note: dimensions are not checked. Missing dimensions become NaN.
	function addV(array1, array2) {
	  return array1.map(function (x, i) { return x + array2[i]; });
	}
	
	function negateV(array) {
	  return array.map(function (x) { return -x; });
	}
	
	function subtractV(array1, array2) {
	  return addV(array1, negateV(array2));
	}
	
	// Scale the vector by a scalar.
	function multiplyV(array, scalar) {
	  return array.map(function (x) { return scalar*x; });
	}
	
	// Vector norm, squared
	function normSqV(array) {
	  function sq(x) { return x*x; }
	  function add(x, y) { return x + y; }
	  return array.map(sq).reduce(add, 0);
	}
	
	// Vector norm
	function normV(array) { return Math.sqrt(normSqV(array)); }
	
	// Return a copy of the vector rescaled as a unit vector (norm = 1).
	function unitV(array) {
	  var n = normV(array);
	  return array.map(function (x) { return x / n; });
	}
	
	// *** 2D Vectors ***
	function angleV(array) {
	  var x = array[0], y = array[1];
	  return Math.atan2(y, x);
	}
	
	function vectorFromLengthAngle(length, angle) {
	  return [Math.cos(angle) * length, Math.sin(angle) * length];
	}
	
	// *** Utilities ***
	
	//mouse event variables need to be global for the editing to work
	var selectedNode = null;
	var selectedLink = null;
	var mousedownLink = null;
	var mousedownNode = null;
	var mouseupNode = null;
	var mouseoverNode = false;
	var mouseoverLink = false;
	var mouseOverSameNode = false;
	var mouseOver = 0;
	var lastKeyDown = -1;
	
	function resetMouseVars() {
	  mousedownNode = null;
	  mouseupNode = null;
	  mousedownLink = null;
	  mouseOverSameNode = false;
	}
	
	//Disable the edit controllers, reset EVERYTHING to foolproof this
	
	function disableNodeEditing() {
	  nodeLabel.disabled = true;
	  nodeLabel.value = '';
	  startState.disabled = true;
	  startState.checked = false;
	  deleteNode.disabled = true;
	  //remove the selected-node class from node
	  if(selectedNode) d3.select(selectedNode.domNode).classed('selected-node', false);
	  selectedNode = null;
	}
	
	function disableLinkEditing() {
	  read.disabled = true;
	  read.value = '';
	  write.disabled = true;
	  write.value = '';
	  moveL.disabled = true;
	  moveR.disabled = true;
	  deleteLink.disabled = true;
	  if(selectedLink) d3.select(selectedLink.domNode).classed('selected-edge', false);
	  selectedLink = null;
	}
	function disableEditing(){
	  disableNodeEditing();
	  disableLinkEditing();
	  transitionEditControls.setAttribute("style", "display: none");
	  nodeEditControls.setAttribute("style", "display: flex");
	}
	
	//throw the error div on screen if the user does something that will invalidate the machine configuration
	function throwMachineError(errorInfo) {
	  var alerts = d3.select(window.document.getElementById("editor-alerts-container"));
	
	  alerts.selectAll('.alert').remove();
	
	  alerts.append('div')
	    .attr('class', 'alert alert-danger')
	    .attr('role', 'alert')
	    .append('span').text(errorInfo);
	}
	
	// Count the directed edges that start at a given node and end at another.
	// Important: each node must have a unique .index property.
	// Example usage:
	// var counts = new EdgeCounter(edges);
	// var edgesFrom2To5 = counts.numEdgesFromTo(2,5);
	// var edgesFrom5to2 = counts.numEdgesFromTo(5,2);
	function EdgeCounter(edges) {
	  edges.forEach(function (e) {
	    var key = e.source.index +','+ e.target.index;
	    this[key] = (this[key] || 0) + 1;
	  }, this);
	}
	
	EdgeCounter.prototype.numEdgesFromTo = function (src, target) {
	  return this[String(src)+','+String(target)] || 0;
	};
	
	var EdgeShape = Object.freeze({
	  loop: {},     // self-loop: a->a
	  arc: {},      // curved arc: a->b when b->a exists
	  straight: {}  // straight edge: a->b when b->a does not exist
	});
	
	EdgeCounter.prototype.shapeForEdge = function (e) {
	  if (e.target.index === e.source.index) {
	    return EdgeShape.loop;
	  } else if (this.numEdgesFromTo(e.target.index, e.source.index)) {
	    // has returning edge => arc
	    return EdgeShape.arc;
	  } else {
	    return EdgeShape.straight;
	  }
	};
	
	// create a function that will compute an edge's SVG 'd' attribute.
	function edgePathFor(nodeRadius, shape, d) {
	  // case: self-loop
	  var loopEndOffset, loopArc;
	  if (shape === EdgeShape.loop) {
	    // start at the top (90°), end slightly above the right (15°)
	    loopEndOffset = vectorFromLengthAngle(nodeRadius, -15 * Math.PI/180);
	    loopArc = ' a 19,27 45 1,1 ' + loopEndOffset[0] + ',' + (loopEndOffset[1]+nodeRadius);
	    return function () {
	      var x1 = d.source.x,
	          y1 = d.source.y;
	      return 'M ' + x1 + ',' + (y1-nodeRadius) + loopArc;
	    };
	  }
	  // case: between nodes
	  if (shape === EdgeShape.arc) {
	    // sub-case: arc
	    return function () {
	      // note: p1 & p2 have to be delayed, to access x/y at the time of the call
	      var p1 = [d.source.x, d.source.y];
	      var p2 = [d.target.x, d.target.y];
	      var offset = subtractV(p2, p1);
	      var radius = 6/5*normV(offset);
	      // Note: SVG's y-axis is flipped, so vector angles are negative
	      // relative to standard coordinates (as used in Math.atan2).
	      // Proof: angle(r <cos ϴ, -sin ϴ>) = angle(r <cos -ϴ, sin -ϴ>) = -ϴ.
	      var angle = angleV(offset);
	      var sep = -Math.PI/2/2; // 90° separation, half on each side
	      var source = addV(p1, vectorFromLengthAngle(nodeRadius, angle+sep));
	      var target = addV(p2, vectorFromLengthAngle(nodeRadius, angle+Math.PI-sep));
	      // IDEA: consider http://www.w3.org/TR/SVG/paths.html#PathDataCubicBezierCommands
	      return (p1[0] <= p2[0])
	        ? 'M '+source[0]+' '+source[1]+' A '+radius+' '+radius+' 0 0,1 '+target[0]+' '+target[1]
	        : 'M '+target[0]+' '+target[1]+' A '+radius+' '+radius+' 0 0,0 '+source[0]+' '+source[1];
	    };
	  } else if (shape === EdgeShape.straight) {
	    return function () {
	      // sub-case: straight line
	      var p1 = [d.source.x, d.source.y];
	      var p2 = [d.target.x, d.target.y];
	      var offset = subtractV(p2, p1);
	      // avoid spurious errors when bounding causes node centers to coincide
	      if (offset[0] === 0 && offset[1] === 0) { return null; }
	
	      var target = subtractV(p2, multiplyV(unitV(offset), nodeRadius));
	      return 'M '+p1[0]+' '+p1[1]+' L '+ target[0] +' '+ target[1];
	    };
	  }
	}
	
	function rectCenter(svgrect) {
	  return {x: svgrect.x + svgrect.width/2,
	    y: svgrect.y + svgrect.height/2};
	}
	
	function identity(x) { return x; }
	function noop() {}
	
	function limitRange(min, max, value) {
	  return Math.max(min, Math.min(value, max));
	}
	
	// IE padding hack so that SVG resizes properly.
	// This works across browsers but we only need it for IE.
	var appendSVGTo = !isBrowserIEorEdge
	  ? function (div) { return div.append('svg'); }
	  : function (div, hwRatio) {
	    return div
	      .append('div')
	        .style({
	          width: '100%',
	          height: '0',
	          'padding-bottom': (100 * hwRatio) + '%',
	          position: 'relative'
	        })
	      .append('svg')
	        .style({
	          position: 'absolute',
	          top: '0',
	          left: '0'
	        });
	  };
	
	// *** D3 diagram ***
	__webpack_require__(/*! ./StateViz.css */ 14);
	const util = __webpack_require__(/*! ../util */ 10);
	const parser = __webpack_require__(/*! ../parser */ 15);
	
	// type LayoutNode = {label: string};
	// type StateMap = {[state: string]: LayoutNode};
	
	/**
	 * Create a state diagram inside an SVG.
	 * Each vertex/edge (node/link) object is also annotated with @.domNode@
	 * corresponding to its SVG element.
	 *
	 * Note: currently, element IDs (e.g. for textPath) will collide if multiple
	 * diagrams are on the same document (HTML page).
	 * @param  {D3Selection}      container     Container to add the SVG to.
	 * @param  {[LayoutNode] | StateMap} nodes  Parameter to D3's force.nodes.
	 *   Important: passing a StateMap is recommended when using setPositionTable.
	 *   Passing an array will key the state nodes by array index.
	 * @param  {[LayoutEdge]}     linkArray     Parameter to D3's force.links.
	 */
	function StateViz(container, nodes, linkArray) {
	  /* References:
	    [Sticky Force Layout](http://bl.ocks.org/mbostock/3750558) demonstrates
	    drag to position and double-click to release.
	
	    [Graph with labeled edges](http://bl.ocks.org/jhb/5955887) demonstrates
	    arrow edges with auto-rotated labels.
	
	    [Directed Graph Editor](https://gist.github.com/rkirsling/5001347) demonstrates
	    a node graph sandbox with dragging for both moving nodes and adding edges.
	  */
	
	  /* eslint-disable no-invalid-this */ // eslint is not familiar with D3
	  var w = 800;
	  var h = 500;
	  var linkDistance = 140;
	  var nodeRadius = 20;
	
	  var colors = d3.scale.category10();
	
	  var svg = appendSVGTo(container, h/w);
	  svg.attr({
	    'viewBox': [0, 0, w, h].join(' '),
	    'version': '1.1',
	    ':xmlns': 'http://www.w3.org/2000/svg',
	    ':xmlns:xlink': 'http://www.w3.org/1999/xlink'
	  });
	
	  svg.on('contextmenu', function () { d3.event.preventDefault(); });
	
	  // Force Layout
	
	  // drag event handlers
	  function dragstart(d) {
	    d.fixed = true; //stays where you put it
	    svg.transition()
	      .style('box-shadow', 'inset 0 0 2px gold'); //yellow around canvas
	  }
	  function dragend() {
	    svg.transition()
	      .style('box-shadow', null); //yellow around canvas
	  }
	
	  var dragLine = svg.append('path')
	    .attr('class', 'link dragline hidden')
	    .attr('d', 'M0,0L0,0');
	
	  //this function used to release the node if it was double-clicked on
	  /*function releasenode(d) {
	    d.fixed = false;
	    force.resume(); //happens on double click rn
	  }*/
	
	  // set up force layout
	  var nodeArray = nodes instanceof Array ? nodes : _.values(nodes);
	  this.__stateMap = nodes;
	
	  var force = d3.layout.force()
	      .nodes(nodeArray)
	      .links(linkArray)
	      .size([w,h])
	      .linkDistance([linkDistance])
	      .charge([-500])
	      .theta(0.1)
	      .gravity(0.05)
	      .start();
	
	  var drag = force.drag()
	      .on('dragstart', dragstart)
	      .on('dragend', dragend);
	
	  // Edges
	  var edgeCounter = new EdgeCounter(linkArray);
	
	  var edgeselection = svg.selectAll('.edgepath')
	    .data(linkArray)
	    .enter();
	
	  var edgegroups = edgeselection.append('g');
	
	  var labelAbove = function (d, i) { return String(-1.1*(i+1)) + 'em'; };
	  var labelBelow = function (d, i) { return String(0.6+ 1.1*(i+1)) + 'em'; };
	
	  edgegroups.each(function (edgeD, edgeIndex) {
	    var group = d3.select(this);
	    var edgepath = group
	      .append('path')
	        .attr({'class': 'edgepath transition',
	          'id': 'edgepath'+edgeIndex })
	        .each(function (d) { d.domNode = this; })
	        .on('mousedown', (d) => {
	          if (d3.event.ctrlKey) return;
	
	          // select link
	          mousedownLink = d;
	          //remove the edgepath.selected-edge class to the node if one already selected
	          if(selectedLink) d3.select(selectedLink.domNode).classed('selected-edge', false);
	          selectedLink = mousedownLink;
	          //remove the selected-node class from node
	          if(selectedNode) d3.select(selectedNode.domNode).classed('selected-node', false);
	          selectedNode = null;
	
	          //add the edgepath.selected-edge class to the node
	          d3.select(selectedLink.domNode).classed('selected-edge', true);
	
	          //re-enable the editing
	          read.disabled = false;
	          write.disabled = false;
	          moveL.disabled = false;
	          moveR.disabled = false;
	          deleteLink.disabled = false;
	
	          var boxContents = selectedLink.labels[0].split("→");
	          read.value = boxContents[0];
	          if(boxContents[1].includes(",")){
	            var splitTransition = boxContents[1].split(",");
	            write.value = splitTransition[0];
	            moveL.disabled = (splitTransition[1] === "L");
	            moveL.classList.toggle('btn-secondary', !(splitTransition[1] === "L"));
	            moveL.classList.toggle('btn-success', (splitTransition[1] === "L"));
	            moveR.disabled = !(splitTransition[1] === "L");
	            moveR.classList.toggle('btn-success', !(splitTransition[1] === "L"));
	            moveR.classList.toggle('btn-secondary', (splitTransition[1] === "L"));
	          } else {
	            write.value = "";
	            moveL.disabled = (boxContents[1] === "L");
	            moveL.classList.toggle('btn-secondary', !(boxContents[1] === "L"))
	            moveL.classList.toggle('btn-success', (boxContents[1] === "L"))
	            moveR.disabled = !(boxContents[1] === "L");
	            moveR.classList.toggle('btn-success', !(boxContents[1] === "L"))
	            moveR.classList.toggle('btn-secondary', (boxContents[1] === "L"))
	          }
	
	          disableNodeEditing();
	          nodeEditControls.setAttribute("style", "display: none");
	          transitionEditControls.setAttribute("style", "display: flex");
	
	          console.log(selectedLink);
	
	          force.resume();
	        })
	        .on('mouseover', function () {mouseoverLink = true;})
	        .on('mouseout', function () {mouseoverLink = false;})
	
	    var labels = group.selectAll('.edgelabel')
	      .data(edgeD.labels).enter()
	      .append('text')
	        .attr('class', 'edgelabel');
	    labels.append('textPath')
	        .attr('xlink:href', function () { return '#edgepath'+edgeIndex; })
	        .attr('startOffset', '50%')
	        .text(identity);
	    /* To reduce JS computation, label positioning varies by edge shape:
	        * Straight edges can use a fixed 'dy' value.
	        * Loops cannot use 'dy' since it increases letter spacing
	          as labels get farther from the path. Instead, since a loop's shape
	          is fixed, it allows a fixed translate 'transform'.
	        * Arcs are bent and their shape is not fixed, so neither 'dy'
	          nor 'transform' can be constant.
	          Fortunately the curvature is slight enough that a fixed 'dy'
	          looks good enough without resorting to dynamic translations.
	    */
	    var shape = edgeCounter.shapeForEdge(edgeD);
	    edgeD.getPath = edgePathFor(nodeRadius, shape, edgeD);
	    switch (shape) {
	      case EdgeShape.straight:
	        labels.attr('dy', labelAbove);
	        edgeD.refreshLabels = function () {
	          // flip edge labels that are upside-down
	          labels.attr('transform', function () {
	            if (edgeD.target.x < edgeD.source.x) {
	              var c = rectCenter(this.getBBox());
	              return 'rotate(180 '+c.x+' '+c.y+')';
	            } else {
	              return null;
	            }
	          });
	        };
	        break;
	      case EdgeShape.arc:
	        var isFlipped;
	        edgeD.refreshLabels = function () {
	          var shouldFlip = edgeD.target.x < edgeD.source.x;
	          if (shouldFlip !== isFlipped) {
	            edgepath.classed('reversed-arc', shouldFlip);
	            labels.attr('dy', shouldFlip ? labelBelow : labelAbove);
	            isFlipped = shouldFlip;
	          }
	        };
	        break;
	      case EdgeShape.loop:
	        labels.attr('transform', function (d, i) {
	          return 'translate(' + String(8*(i+1)) + ' ' + String(-8*(i+1)) + ')';
	        });
	        edgeD.refreshLabels = noop;
	        break;
	    }
	    //whole section above is just about the shape of the node arrows, probably don't touch
	  });
	  var edgepaths = edgegroups.selectAll('.edgepath');
	
	  // Nodes
	  // note: nodes are added after edges so as to paint over excess edge lines
	  var nodeSelection = svg.selectAll('.node')
	    .data(nodeArray)
	    .enter();
	
	  var nodecircles = nodeSelection
	    .append('circle')
	      .attr('class', 'node')
	      .attr('r', nodeRadius)
	      .style('fill', function (d,i) { return colors(i); })
	      // .style('fill', function (d,i) {
	      //   if (d === selectedNode) {
	      //     return d3.rgb(colors(i).brighter().toString());
	      //   } else return colors(i);
	      //  })
	      .each(function (d) { d.domNode = this; })
	      .call(drag)
	      .on('mousedown', function (d) {
	        mousedownNode = d;
	        if (!d3.event.ctrlKey) {
	
	          // select node
	          if (mousedownNode === selectedNode) {
	            return;
	          } else {
	            //remove the selected-node class from node if one already selected
	            if(selectedNode) d3.select(selectedNode.domNode).classed('selected-node', false);
	            selectedNode = mousedownNode;
	
	            // add selected-node class to the node
	            d3.select(selectedNode.domNode).classed('selected-node', true);
	            //re-enable the editing
	            nodeLabel.disabled = false;
	            deleteNode.disabled = false;
	
	            var checkStartState = function () {
	              var machine = jsyaml.safeLoad(source.getValue());
	              if (machine['start state'] === selectedNode.label) {
	                startState.disabled = true;
	                return true;
	              } else {
	                startState.disabled = false;
	                return false;
	              }
	            }
	
	            var isStartState = checkStartState();
	
	            nodeLabel.value = selectedNode.label;
	            startState.checked = isStartState;
	          }
	          //remove the edgepath.selected-edge class from the node
	          if(selectedLink) d3.select(selectedLink.domNode).classed('selected-edge', false);
	          selectedLink = null;
	          disableLinkEditing();
	          transitionEditControls.setAttribute("style", "display: none");
	          nodeEditControls.setAttribute("style", "display: flex");
	
	          console.log(selectedNode);
	
	        } else {
	          //start dragline
	          dragLine
	            .classed('hidden', false)
	            .attr('d', 'M' + mousedownNode.x + ',' + mousedownNode.y + 'L' + mousedownNode.x + ',' + mousedownNode.y);
	        }
	        force.resume();
	      })
	      .on('mouseover', function (d) {
	        mouseoverNode = true;
	
	        if (!mousedownNode) return;
	
	        if(d === mousedownNode){
	          mouseOverSameNode = true;
	        }
	      })
	      .on('mouseout', function () {
	        mouseoverNode = false;
	
	        if (!mousedownNode) return;
	
	        if (mouseOverSameNode) mouseOverSameNode = false;
	      })
	      .on('mouseup', function (d) {
	        if (!mousedownNode) return;
	
	        // needed by FF
	        dragLine
	          .classed('hidden', true)
	          .style('marker-end', '');
	
	        mouseupNode = d;
	
	        if (lastKeyDown === 17) {
	          // add link to graph (update if exists)
	          var machine = jsyaml.safeLoad(source.getValue());
	          machine.table[mousedownNode.label]['*'] = {L: mouseupNode.label};
	          source.setValue(jsyaml.safeDump(machine));
	          util.setCookie('TMReload', 'new link');
	          disableEditing();
	        }
	
	        force.resume();
	      });
	
	  var nodelabels = nodeSelection
	   .append('text')
	     .attr('class', 'nodelabel')
	     .attr('dy', '0.25em') /* dy doesn't work in CSS */
	     .text(function (d) { return d.label; });
	
	  // Arrowheads
	  var svgdefs = svg.append('defs');
	  svgdefs.selectAll('marker')
	      .data(['arrowhead', 'active-arrowhead', 'reversed-arrowhead', 'reversed-active-arrowhead'])
	    .enter().append('marker')
	      .attr({'id': function (d) { return d; },
	        'viewBox':'0 -5 10 10',
	        'refX': function (d) {
	          return (d.lastIndexOf('reversed-', 0) === 0) ? 0 : 10;
	        },
	        'orient':'auto',
	        'markerWidth':3,
	        'markerHeight':3
	      })
	    .append('path')
	      .attr('d', 'M 0 -5 L 10 0 L 0 5 Z')
	      .attr('transform', function (d) {
	        return (d.lastIndexOf('reversed-', 0) === 0) ? 'rotate(180 5 0)' : null;
	      });
	
	  //not sure why i cant move this into the css but we ball
	  var svgCSS =
	    '.edgepath {' +
	    '  marker-end: url(#arrowhead);' +
	    '}' +
	    '.edgepath.active-edge {' +
	    '  marker-end: url(#active-arrowhead);' +
	    '}' +
	    '.edgepath.reversed-arc {' +
	    '  marker-start: url(#reversed-arrowhead);' +
	    '  marker-end: none;' +
	    '}' +
	    '.edgepath.active-edge.reversed-arc {' +
	    '  marker-start: url(#reversed-active-arrowhead);' +
	    '  marker-end: none;' +
	    '}';
	  svg.append('style').each(function () {
	    if (this.styleSheet) {
	      this.styleSheet.cssText = svgCSS;
	    } else {
	      this.textContent = svgCSS;
	    }
	  })
	
	  // Force Layout Update
	  force.on('tick', function () {
	    // Keep coordinates in bounds. http://bl.ocks.org/mbostock/1129492
	    // NB. Bounding can cause node centers to coincide, especially at corners.
	    nodecircles.attr({cx: function (d) { return d.x = limitRange(nodeRadius, w - nodeRadius, d.x); },
	      cy: function (d) { return d.y = limitRange(nodeRadius, h - nodeRadius, d.y); }
	    });
	
	    nodelabels.attr('x', function (d) { return d.x; })
	              .attr('y', function (d) { return d.y; });
	
	    edgepaths.attr('d', function (d) { return d.getPath(); });
	
	    edgegroups.each(function (d) { d.refreshLabels(); });
	
	    // Conserve CPU when layout is fully fixed
	    if (nodeArray.every(function (d) { return d.fixed; })) {
	      force.stop();
	    }
	  });
	  this.force = force;
	
	  //in this section begin the functions that enable the visual editing functionality
	  //these are going to be pretty hacky so that they work, both because this is written in quite an
	  //old version of javascript without classes and that I have very little experience working in this language
	  //This entire codebase probably needs a rewrite, but I don't have the time, energy or motivation to do this
	
	  if (lastKeyDown === 17) {
	    nodecircles.on('.drag', null)
	      .classed('node', false);
	  }
	
	  //add a node
	  svg.on('dblclick', function () {
	
	    if (d3.event.ctrlKey || mouseoverNode || mouseoverLink) return;
	    //var source = controller.editor;
	    var machine = jsyaml.safeLoad(source.getValue());
	    //node name increments
	    var newNodeIndex = (_.keys(machine.table).length + 1);
	    var newNodeName;
	    //check if counted node already exists and then add 1 (for all possible nodes)
	    //yes this doesnt fill holes but its the simplest way to deal with this that I can think of
	    for (var node in machine.table) {
	      newNodeName = "State" + newNodeIndex.toString();
	      if (machine.table.hasOwnProperty(newNodeName))
	        newNodeIndex++;
	    }
	    machine.table[newNodeName] = {};
	    source.setValue(jsyaml.safeDump(machine));
	    disableEditing();
	    nodeLabel.value = '';
	    util.setCookie('TMReload', 'node');
	  });
	
	  //deselect node
	  svg.on('mousedown', function () {
	    if (mousedownNode || mousedownLink) return;
	    //reset the containers and disable them?
	    if (selectedNode || selectedLink) {
	      disableEditing();
	      resetMouseVars();
	      util.setCookie('TMReload', 'reload');
	    }
	  });
	
	  //drag a node or link a transition
	  svg.on('mousemove', function () {
	    if (!mousedownNode) return;
	
	    // update drag line
	    if(mouseOverSameNode) {
	      dragLine.attr('d', function () {
	        var loopEndOffset, loopArc;
	        // start at the top (90°), end slightly above the right (15°)
	        loopEndOffset = vectorFromLengthAngle(nodeRadius, -15 * Math.PI/180);
	        loopArc = ' a 19,27 45 1,1 ' + loopEndOffset[0] + ',' + (loopEndOffset[1]+nodeRadius);
	        var x1 = mousedownNode.x,
	            y1 = mousedownNode.y;
	        return 'M ' + x1 + ',' + (y1-nodeRadius) + loopArc;
	        })
	    } else dragLine.attr('d', 'M' + mousedownNode.x + ',' + mousedownNode.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
	  });
	
	  //finish a drag/transition
	  svg.on('mouseup', function () {
	    if (mousedownNode) {
	      // hide drag line
	      dragLine
	        .classed('hidden', true)
	        .style('marker-end', '');
	    }
	
	    // clear mouse event vars
	    resetMouseVars();
	  });
	
	  svg.on('mouseenter', function () {
	    mouseOver = 1;
	    })
	    .on('mouseleave', function () {
	       mouseOver = 0;
	    });
	
	  d3.select(window)
	    .on('keydown', function () {
	
	      if (lastKeyDown !== -1) return;
	      lastKeyDown = d3.event.keyCode;
	
	      // ctrl
	      if (d3.event.keyCode === 17) {
	        nodecircles.on('.drag', null)
	          .classed('node', false);
	        return;
	      }
	
	      if (!selectedNode && !selectedLink) return;
	      if (!mouseOver) return;
	      switch (d3.event.keyCode) {
	        //delete
	        case 46: // delete
	          if (selectedNode) {
	            //delete the selected node
	            //get machine code
	            if(!startState.checked) {
	              var machine = jsyaml.safeLoad(source.getValue());
	              //delete every transition with the same name as the node being deleted
	              delete machine.table[selectedNode['label']];
	              for (var node in machine.table) {
	                for (var read in machine.table[node]) {
	                  for (var i in machine.table[node][read]) {
	                    if(i === "L" | i === "R") {
	                      if (machine.table[node][read][i] === selectedNode['label'])
	                        delete machine.table[node][read];
	                    }
	                  }
	                }
	              }
	              source.setValue(jsyaml.safeDump(machine));
	              disableEditing();
	              util.setCookie('TMReload', 'deleted a node');
	            } else {
	              //don't let the user delete the start state
	              throwMachineError("Change the start state before trying to delete this node");
	            }
	          } else if (selectedLink) {
	            //delete the selected transition
	            //grab the machine
	            var machine = jsyaml.safeLoad(source.getValue());
	            delete machine['table'][selectedLink.source['label']][read.value];
	            //we're finished here
	            source.setValue(jsyaml.safeDump(machine));
	            disableEditing();
	            util.setCookie('TMReload', 'delete link');
	          }
	          //reload the simulation
	          break;
	
	          //TODO (stretch goal) add undo and redo functions - an array in util.js
	      }
	    })
	    .on('keyup', function () {
	      lastKeyDown = -1;
	
	      if (d3.event.keyCode === 17) {
	        nodecircles.call(drag)
	          .classed('node', true);
	      }
	    })
	
	  //preserve selected node if necessary
	  if(nodeLabel.value){
	    console.log('node was just changed');
	    //LORD KNOWS HOW THIS WORKS
	    var preservedNode = nodecircles.filter(function(d) { return d.label === nodeLabel.value })[0];
	    selectedNode = preservedNode[0].__data__;
	    d3.select(selectedNode.domNode).classed('selected-node', true);
	    console.log(selectedNode);
	  } else if (read.value) {
	    console.log('transition was just changed');
	    //I STILL do not know how to traverse d3 objects using efficient code so this will fucking do
	    var preservedLabel = read.value + "→" + (write.value ? write.value + "," : "") + (moveL.disabled ? "L" : "R");
	    var preservedTransition = edgeselection[0].filter(function(d) {
	      return d.__data__['labels'][0] === preservedLabel;
	    });
	    var tempTransition = preservedTransition.filter(function (d) {
	      var tempObj = d.__data__;
	      return (tempObj.source['label'] === selectedLink.source.label && tempObj.target['label'] === selectedLink.target.label);
	    })[0];
	    selectedLink = tempTransition.__data__;
	    d3.select(selectedLink.domNode).classed('selected-edge', true);
	    console.log(selectedLink);
	  }
	  /* eslint-enable no-invalid-this */
	}
	
	//edit controls for good enjoyable editing
	nodeLabel.addEventListener('focusout', function() {
	  // first make sure the node name actually changed
	  if (!(selectedNode['label'] === nodeLabel.value)) {
	    // get machine code
	    var machine = jsyaml.safeLoad(source.getValue());
	    // does a node with this new name exist already?
	    if (!(machine.table[nodeLabel.value] === undefined)) {
	      // a node exists already
	      throwMachineError("A node with that name exists already.");
	    } else {
	      // we're changing the name of the node
	      machine.table[nodeLabel.value] = machine.table[selectedNode['label']];
	      delete machine.table[selectedNode['label']];
	      //make sure the start state changes if necessary
	      if (machine['start state'] === selectedNode['label']) {
	        machine['start state'] = nodeLabel.value;
	      }
	      // change every transition destination node that has the old node's name
	      for(var node in machine.table) {
	        for (var read in machine.table[node]) {
	          for (var i in machine.table[node][read]) {
	            if(i === "L" | i === "R") {
	              if (machine.table[node][read][i] === selectedNode['label'])
	                machine.table[node][read][i] = nodeLabel.value;
	            }
	          }
	        }
	      }
	      //we're finished here
	      source.setValue(jsyaml.safeDump(machine));
	      util.setCookie('TMReload', 'node name change');
	    }
	  }
	});
	
	startState.addEventListener('change', function(){
	  //this one is pretty foolproof
	  var machine = jsyaml.safeLoad(source.getValue());
	  machine['start state'] = nodeLabel.value;
	  startState.disabled = true;
	  source.setValue(jsyaml.safeDump(machine));
	  util.setCookie('TMReload', 'start state');
	})
	
	deleteNode.addEventListener('click', function (){
	  //this one needs the full transition loop sorting before it works fully but basic node deletion is pretty easy
	  //get machine code
	  if(!startState.checked) {
	    var machine = jsyaml.safeLoad(source.getValue());
	    //delete every transition with the same name as the node being deleted
	    delete machine.table[nodeLabel.value];
	    for (var node in machine.table) {
	      for (var read in machine.table[node]) {
	        for (var i in machine.table[node][read]) {
	          if(i === "L" | i === "R") {
	            if (machine.table[node][read][i] === nodeLabel.value)
	              delete machine.table[node][read];
	          }
	        }
	      }
	    }
	    source.setValue(jsyaml.safeDump(machine));
	    disableEditing();
	    util.setCookie('TMReload', 'deleted a node');
	  } else {
	    //don't let the user delete the start state
	    throwMachineError("Change the start state before trying to delete this node");
	  }
	})
	
	read.addEventListener('focusout', function () {
	  //has the contents of the box changed?
	  var transitionContents = selectedLink.labels[0].split("→");
	  if(!(transitionContents[0] === read.value)) {
	    //get machine
	    var machine = jsyaml.safeLoad(source.getValue());
	    //check if any read symbol duplicated (the guy didnt implement this to begin with)
	    var readSymbolExists = 0;
	    for (var readSymbol in machine.table[selectedLink.source['label']]) {
	      for (var symbol of read.value.split(",")){
	        if (readSymbol.includes(symbol) && !(transitionContents[0].includes(symbol))) {
	          readSymbolExists = 1;
	          break;
	        }
	      }
	      if (readSymbolExists) break;
	    }
	    if(!readSymbolExists) {
	      //delete entry corresponding to old read symbol(s), re-add entry with new read symbols
	      machine['table'][selectedLink.source['label']][read.value] = machine['table'][selectedLink.source['label']][transitionContents[0]];
	      delete machine['table'][selectedLink.source['label']][transitionContents[0]];
	      //we're finished here
	      source.setValue(jsyaml.safeDump(machine));
	      util.setCookie('TMReload', 'transition changed');
	    } else {
	      //throw error if any read symbol appears elsewhere in the source node's table
	      throwMachineError("One or more entered read symbol(s) appear(s) in another transition");
	    }
	  }
	})
	
	write.addEventListener('focusout', function () {
	  var boxContents = selectedLink.labels[0].split("→");
	  if(boxContents[1].includes(",")) {
	    var splitTransition = boxContents[1].split(",");
	    if(!(splitTransition[0] === write.value)){
	      //get machine
	      var machine = jsyaml.safeLoad(source.getValue());
	      //replace the written symbol or delete it if write left empty
	      if(write.value) {
	        machine['table'][selectedLink.source['label']][boxContents[0]]['write'] = write.value;
	      } else {
	        delete machine['table'][selectedLink.source['label']][boxContents[0]]['write'];
	      }
	      //we're finished here
	      source.setValue(jsyaml.safeDump(machine));
	      util.setCookie('TMReload', 'transition write changed');
	    }
	  } else {
	    if(write.value) {
	      //there is now a value for write
	      //grab the machine
	      var machine = jsyaml.safeLoad(source.getValue());
	      //add a write parameter to the object
	      machine['table'][selectedLink.source['label']][boxContents[0]]['write'] = write.value;
	      //we're finished here
	      source.setValue(jsyaml.safeDump(machine));
	      util.setCookie('TMReload', 'transition write changed');
	    }
	  }
	})
	
	moveL.addEventListener('click', function () {
	  //probably pretty simple
	  //disable L, enable R, push L transition, delete R transition
	  moveL.disabled = true;
	  moveR.disabled = false;
	  moveL.classList.toggle('btn-secondary');
	  moveL.classList.toggle('btn-success');
	  moveR.classList.toggle('btn-success');
	  moveR.classList.toggle('btn-secondary');
	
	  //grab the machine
	  var machine = jsyaml.safeLoad(source.getValue());
	  //find the transition based on source node and read box
	  machine['table'][selectedLink.source['label']][read.value]['L'] = machine['table'][selectedLink.source['label']][read.value]['R'];
	  delete machine['table'][selectedLink.source['label']][read.value]['R'];
	  //we're finished here
	  source.setValue(jsyaml.safeDump(machine));
	  util.setCookie('TMReload', 'head movement changed');
	})
	
	moveR.addEventListener('click', function () {
	  //probably pretty simple
	  //disable R, enable L, push R transition, delete L transition
	  moveR.disabled = true;
	  moveL.disabled = false;
	  moveR.classList.toggle('btn-secondary');
	  moveR.classList.toggle('btn-success');
	  moveL.classList.toggle('btn-success');
	  moveL.classList.toggle('btn-secondary');
	
	  //grab the machine
	  var machine = jsyaml.safeLoad(source.getValue());
	  //find the transition based on source node and read box
	  machine['table'][selectedLink.source['label']][read.value]['R'] = machine['table'][selectedLink.source['label']][read.value]['L'];
	  delete machine['table'][selectedLink.source['label']][read.value]['L'];
	  //we're finished here
	  source.setValue(jsyaml.safeDump(machine));
	  util.setCookie('TMReload', 'head movement changed');
	})
	
	deleteLink.addEventListener('click', function (){
	  //this should be easier than deleting a node
	  //find read symbols inside source node object, delete read symbols (without replacing)
	  //grab the machine
	  var machine = jsyaml.safeLoad(source.getValue());
	  delete machine['table'][selectedLink.source['label']][read.value];
	  //we're finished here
	  source.setValue(jsyaml.safeDump(machine));
	  disableEditing();
	  util.setCookie('TMReload', 'delete link');
	})
	
	// Positioning
	
	// {[key: State]: Node} -> PositionTable
	var getPositionTable = _.mapValues(_.pick(['x', 'y', 'px', 'py', 'fixed']));
	
	// Tag nodes w/ positions. Mutates the node map.
	// PositionTable -> {[key: State]: Node} -> void
	function setPositionTable(posTable, stateMap) {
	  _.forEach(function (node, state) {
	    var position = posTable[state];
	    if (position !== undefined) {
	      assign(node, position);
	    }
	  }, stateMap);
	}
	
	//TODO (stretchier goal) have the nodes remain in place when being renamed
	Object.defineProperty(StateViz.prototype, 'positionTable', {
	  get: function () { return getPositionTable(this.__stateMap); },
	  set: function (posTable) {
	    setPositionTable(posTable, this.__stateMap);
	    // ensure that a cooled layout will update
	    this.force.resume();
	  }
	});
	
	
	module.exports = StateViz;


/***/ }),
/* 14 */
/*!****************************************!*\
  !*** ./src/state-diagram/StateViz.css ***!
  \****************************************/
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "state-diagram/StateViz.css";

/***/ }),
/* 15 */
/*!***********************!*\
  !*** ./src/parser.js ***!
  \***********************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var TM = __webpack_require__(/*! ./TuringMachine */ 2),
	    jsyaml = __webpack_require__(/*! js-yaml */ 8),
	    _ = __webpack_require__(/*! lodash */ 12);
	
	/**
	 * Thrown when parsing a string that is valid as YAML but invalid
	 * as a machine specification.
	 *
	 * Examples: unrecognized synonym, no start state defined,
	 * transitioning to an undeclared state.
	 *
	 * A readable message is generated based on the details (if any) provided.
	 * @param {string} reason  A readable error code.
	 *   As an error code, this should be relatively short and not include runtime values.
	 * @param {?Object} details Optional details. Possible keys:
	 *                          problemValue, state, key, synonym, info, suggestion
	 */
	function TMSpecError(reason, details) {
	  this.name = 'TMSpecError';
	  this.stack = (new Error()).stack;
	
	  this.reason = reason;
	  this.details = details || {};
	}
	TMSpecError.prototype = Object.create(Error.prototype);
	TMSpecError.prototype.constructor = TMSpecError;
	
	// generate a formatted description in HTML
	Object.defineProperty(TMSpecError.prototype, 'message', {
	  get: function () {
	    var header = this.reason;
	    var details = this.details;
	
	    function code(str) { return '<code>' + str + '</code>'; }
	    function showLoc(state, symbol, synonym) {
	      if (state != null) {
	        if (symbol != null) {
	          return ' in the transition from state ' + code(state) + ' and symbol ' + code(symbol);
	        } else {
	          return ' for state ' + code(state);
	        }
	      } else if (synonym != null) {
	        return ' in the definition of synonym ' + code(synonym);
	      }
	      return '';
	    }
	    var problemValue = details.problemValue ? ' ' + code(details.problemValue) : '';
	    var location = showLoc(details.state, details.symbol, details.synonym);
	    var sentences = ['<strong>' + header + problemValue + '</strong>' + location
	      , details.info, details.suggestion]
	      .filter(_.identity)
	      .map(function (s) { return s + '.'; });
	    if (location) { sentences.splice(1, 0, '<br>'); }
	    return sentences.join(' ');
	  },
	  enumerable: true
	});
	
	// type TransitionTable = {[key: string]: ?{[key: string]: string} }
	// type TMSpec = {blank: string, start state: string, table: TransitionTable}
	
	// IDEA: check with flow (flowtype.org)
	// throws YAMLException on YAML syntax error
	// throws TMSpecError for an invalid spec (eg. no start state, transitioning to an undefined state)
	// string -> TMSpec
	function parseSpec(str) {
	  var obj = jsyaml.safeLoad(str);
	  // check for required object properties.
	  // auto-convert .blank and 'start state' to string, for convenience.
	  if (obj == null) { throw new TMSpecError('The document is empty',
	    {info: 'Every Turing machine requires a <code>blank</code> tape symbol,' +
	    ' a <code>start state</code>, and a transition <code>table</code>'}); }
	  var detailsForBlank = {suggestion:
	    'Examples: <code>blank: \' \'</code>, <code>blank: \'0\'</code>'};
	  if (obj.blank == null) {
	    throw new TMSpecError('No blank symbol was specified', detailsForBlank);
	  }
	  obj.blank = String(obj.blank);
	  if (obj.blank.length !== 1) {
	    throw new TMSpecError('The blank symbol must be a string of length 1', detailsForBlank);
	  }
	  obj.startState = obj['start state'];
	  delete obj['start state'];
	  if (obj.startState == null) {
	    throw new TMSpecError('No start state was specified',
	    {suggestion: 'Assign one using <code>start state: </code>'});
	  }
	  obj.startState = String(obj.startState);
	  // parse synonyms and transition table
	  checkTableType(obj.table); // parseSynonyms assumes a table object
	  var synonyms = parseSynonyms(obj.synonyms, obj.table);
	  obj.table = parseTable(synonyms, obj.table);
	  // check for references to non-existent states
	  if (!(obj.startState in obj.table)) {
	    throw new TMSpecError('The start state has to be declared in the transition table');
	  }
	
	  return obj;
	}
	
	function checkTableType(val) {
	  if (val == null) {
	    throw new TMSpecError('Missing transition table',
	    {suggestion: 'Specify one using <code>table:</code>'});
	  }
	  if (typeof val !== 'object') {
	    throw new TMSpecError('Transition table has an invalid type',
	      {problemValue: typeof val,
	        info: 'The transition table should be a nested mapping from states to symbols to instructions'});
	  }
	}
	
	// (any, Object) -> ?SynonymMap
	function parseSynonyms(val, table) {
	  if (val == null) {
	    return null;
	  }
	  if (typeof val !== 'object') {
	    throw new TMSpecError('Synonyms table has an invalid type',
	      {problemValue: typeof val,
	        info: 'Synonyms should be a mapping from string abbreviations to instructions'
	        + ' (e.g. <code>accept: {R: accept}</code>)'});
	  }
	  return _.mapValues(val, function (actionVal, key) {
	    try {
	      return parseInstruction(null, table, actionVal);
	    } catch (e) {
	      if (e instanceof TMSpecError) {
	        e.details.synonym = key;
	        if (e.reason === 'Unrecognized string') {
	          e.details.info = 'Note that a synonym cannot be defined using another synonym';
	        }
	      }
	      throw e;
	    }
	  });
	}
	
	// (?SynonymMap, {[key: string]: string}) -> TransitionTable
	function parseTable(synonyms, val) {
	  return _.mapValues(val, function (stateObj, state) {
	    if (stateObj == null) {
	      // case: halting state
	      return null;
	    }
	    if (typeof stateObj !== 'object') {
	      throw new TMSpecError('State entry has an invalid type',
	        {problemValue: typeof stateObj, state: state,
	          info: 'Each state should map symbols to instructions. An empty map signifies a halting state.'});
	    }
	    return _.mapValues(stateObj, function (actionVal, symbol) {
	      try {
	        return parseInstruction(synonyms, val, actionVal);
	      } catch (e) {
	        if (e instanceof TMSpecError) {
	          e.details.state = state;
	          e.details.symbol = symbol;
	        }
	        throw e;
	      }
	    });
	  });
	}
	
	// omits null/undefined properties
	// (?string, direction, ?string) -> {symbol?: string, move: direction, state?: string}
	function makeInstruction(symbol, move, state) {
	  return Object.freeze(_.omitBy({symbol: symbol, move: move, state: state},
	    function (x) { return x == null; }));
	}
	
	function checkTarget(table, instruct) {
	  if (instruct.state != null && !(instruct.state in table)) {
	    throw new TMSpecError('Undeclared state', {problemValue: instruct.state,
	      suggestion: 'Make sure to list all states in the transition table and define their transitions (if any)'});
	  }
	  return instruct;
	}
	
	// throws if the target state is undeclared (not in the table)
	// type SynonymMap = {[key: string]: TMAction}
	// (SynonymMap?, Object, string | Object) -> TMAction
	function parseInstruction(synonyms, table, val) {
	  return checkTarget(table, function () {
	    switch (typeof val) {
	      case 'string': return parseInstructionString(synonyms, val);
	      case 'object': return parseInstructionObject(val);
	      default: throw new TMSpecError('Invalid instruction type',
	        {problemValue: typeof val,
	          info: 'An instruction can be a string (a direction <code>L</code>/<code>R</code> or a synonym)'
	            + ' or a mapping (examples: <code>{R: accept}</code>, <code>{write: \' \', L: start}</code>)'});
	    }
	  }());
	}
	
	var moveLeft = Object.freeze({move: TM.MoveHead.left});
	var moveRight = Object.freeze({move: TM.MoveHead.right});
	
	// case: direction or synonym
	function parseInstructionString(synonyms, val) {
	  if (val === 'L') {
	    return moveLeft;
	  } else if (val === 'R') {
	    return moveRight;
	  }
	  // note: this order prevents overriding L/R in synonyms, as that would
	  // allow inconsistent notation, e.g. 'R' and {R: ..} being different.
	  if (synonyms && synonyms[val]) { return synonyms[val]; }
	  throw new TMSpecError('Unrecognized string',
	    {problemValue: val,
	      info: 'An instruction can be a string if it\'s a synonym or a direction'});
	}
	
	// type ActionObj = {write?: any, L: ?string} | {write?: any, R: ?string}
	// case: ActionObj
	function parseInstructionObject(val) {
	  var symbol, move, state;
	  if (val == null) { throw new TMSpecError('Missing instruction'); }
	  // prevent typos: check for unrecognized keys
	  (function () {
	    var badKey;
	    if (!Object.keys(val).every(function (key) {
	      badKey = key;
	      return key === 'L' || key === 'R' || key === 'write';
	    })) {
	      throw new TMSpecError('Unrecognized key',
	        {problemValue: badKey,
	          info: 'An instruction always has a tape movement <code>L</code> or <code>R</code>, '
	        + 'and optionally can <code>write</code> a symbol'});
	    }
	  })();
	  // one L/R key is required, with optional state value
	  if ('L' in val && 'R' in val) {
	    throw new TMSpecError('Conflicting tape movements',
	    {info: 'Each instruction needs exactly one movement direction, but two were found'});
	  }
	  if ('L' in val) {
	    move = TM.MoveHead.left;
	    state = val.L;
	  } else if ('R' in val) {
	    move = TM.MoveHead.right;
	    state = val.R;
	  } else {
	    throw new TMSpecError('Missing movement direction');
	  }
	  // write key is optional, but must contain a char value if present
	  if ('write' in val) {
	    var writeStr = String(val.write);
	    if (writeStr.length === 1) {
	      symbol = writeStr;
	    } else {
	      throw new TMSpecError('Write requires a string of length 1');
	    }
	  }
	  return makeInstruction(symbol, move, state);
	}
	
	exports.TMSpecError = TMSpecError;
	exports.parseSpec = parseSpec;
	// re-exports
	exports.YAMLException = jsyaml.YAMLException;


/***/ }),
/* 16 */
/*!**********************!*\
  !*** ./src/watch.js ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	/**
	 * Lightweight property assignment watching by overriding getters/setters.
	 * Intended as a bridge between plain JS properties and other libraries.
	 *
	 * Inspired by https://gist.github.com/eligrey/384583, which works for
	 * data properties only, this works for both data and accessor properties.
	 *
	 * 2015-11-21
	 * @author Andy Li
	 */
	
	/**
	 * Watches a property for assignment by overriding it with a getter & setter
	 * on top of the previous value or accessors.
	 *
	 * The handler can intercept assignments by returning a different value.
	 * Watching an unwritable/unsettable property does nothing, but trying to watch
	 * a non-existent or non-configurable property fails fast with TypeError.
	 * @param  {!Object} thisArg The object that contains the property.
	 * @param  {String}  prop    The name of the property to watch.
	 * @param            handler The function to call when the property is
	 *   assigned to. Important: this function intercepts assignment;
	 *   its return value is set as the new value.
	 * @throws {TypeError} if object is null or does not have the property
	 * @throws {TypeError} if thisArg.prop is non-configurable
	 * @return {?Object}         The previous property descriptor, or null if the
	 *   property is not writable/settable.
	 */
	function watch(thisArg, prop, handler) {
	  var desc = Object.getOwnPropertyDescriptor(thisArg, prop);
	  // check pre-conditions: existent, configurable, writable/settable
	  if (desc === undefined) {
	    throw new TypeError('Cannot watch nonexistent property \''+prop+'\'');
	  } else if (!desc.configurable) {
	    throw new TypeError('Cannot watch non-configurable property \''+prop+'\'');
	  } else if (!desc.writable && desc.set === undefined) {
	    return; // no-op since property can't change without reconfiguration
	  }
	
	  var accessors = (function () {
	    if (desc.set) {
	      // case: .get/.set
	      return {
	        get: desc.get,
	        set: function (newval) {
	          return desc.set.call(thisArg, handler.call(thisArg, prop, thisArg[prop], newval));
	        }
	      };
	    } else {
	      // case: .value
	      var val = desc.value;
	      return {
	        get: function () {
	          return val;
	        },
	        set: function (newval) {
	          return val = handler.call(thisArg, prop, val, newval);
	        }
	      };
	    }
	  })();
	  Object.defineProperty(thisArg, prop, accessors);
	
	  return desc;
	}
	
	/**
	 * {@link watch} that, if successful, also calls the handler once with
	 *   the current value (by setting it).
	 * @see watch
	 */
	function watchInit(thisArg, prop, handler) {
	  var value = thisArg[prop];
	  var desc = watch(thisArg, prop, handler);
	  if (desc) { thisArg[prop] = value; }
	  return desc;
	}
	
	if (true) {
	  exports.watch = watch;
	  exports.watchInit = watchInit;
	}


/***/ })
/******/ ]);
//# sourceMappingURL=TMViz.bundle.js.map