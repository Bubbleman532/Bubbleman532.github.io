var main =
webpackJsonp_name_([1],[
/* 0 */
/*!******************!*\
  !*** multi main ***!
  \******************/
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./src/main.js */17);
	(function webpackMissingModule() { throw new Error("Cannot find module \"D:\\bubbleman532.github.io\\build\""); }());


/***/ }),
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ (function(module, exports, __webpack_require__) {

	// main entry point for index.html.
	// important: make sure to coordinate variables and elements between the HTML and JS
	'use strict';
	
	/* eslint-env browser */
	var TMDocumentController = __webpack_require__(/*! ./TMDocumentController */ 18),
	    DocumentMenu = __webpack_require__(/*! ./DocumentMenu */ 20),
	    examples = __webpack_require__(/*! ./examples */ 23),
	    toDocFragment = __webpack_require__(/*! ./util */ 10).toDocFragment;
	var ace = __webpack_require__(/*! ace-builds/src-min-noconflict */ 9);
	var $ = __webpack_require__(/*! jquery */ 42); // for Bootstrap modal dialog events
	
	// load up front so going offline doesn't break anything
	// (for snippet placeholders, used by "New blank document")
	ace.config.loadModule('ace/ext/language_tools');
	
	function getId(id) { return document.getElementById(id); }
	
	function addAlertPane(type, html) {
	  getId('diagram-column').insertAdjacentHTML('afterbegin',
	    '<div class="alert alert-'+type+' alert-dismissible" role="alert">' +
	    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>' +
	    html +
	    '</div>');
	}
	
	
	//////////////////////////
	// Compatibility Checks //
	//////////////////////////
	
	(function () {
	  // Warn when falling back to RAM-only storage
	  // NB. This mainly covers local storage errors and Safari's Private Browsing.
	  if (!__webpack_require__(/*! ./storage */ 21).canUseLocalStorage) {
	    addAlertPane('info', '<p>Local storage is unavailable. ' +
	      'Your browser could be in Private Browsing mode, or it might not support <a href="http://caniuse.com/#feat=namevalue-storage" target="_blank">local storage</a>.</p>' +
	      '<strong>Any changes will be lost after leaving the webpage.</strong>');
	  }
	
	  /*
	  Warn for IE 10 and under, which misbehave and lack certain features.
	  Examples:
	    • IE 9 and under don't support .classList.
	    • IE 10's "storage event is fired even on the originating document where it occurred."
	      http://caniuse.com/#feat=namevalue-storage
	  */
	
	  // Detect IE 10 and under (http://stackoverflow.com/a/16135889)
	  var isIEUnder11 = new Function('/*@cc_on return @_jscript_version; @*/')() < 11;
	  if (isIEUnder11) {
	    addAlertPane('warning',
	      '<p><strong>Your <a href="http://whatbrowser.org" target="_blank">web browser</a> is out of date</strong> and does not support some features used by this program.<br>' +
	      '<em>The page may not work correctly, and data may be lost.</em></p>' +
	      'Please update your browser, or use another browser such as <a href="http://www.google.com/chrome/browser/" target="_blank">Chrome</a> or <a href="http://getfirefox.com" target="_blank">Firefox</a>.');
	  }
	
	  // Warn about iOS local storage volatility
	  $(function () {
	    // Detect iOS (http://stackoverflow.com/a/9039885)
	    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	    if (isIOS) {
	      getId('misc-tips-list').insertAdjacentHTML('afterbegin',
	        '<li><strong class="text-warning">Important note for iOS</strong>: ' +
	        'iOS saves browser local storage in the cache folder, which is <strong>not backed up</strong>, and is ' +
	        '<q cite="https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Browser_compatibility"><strong>subject to occasional clean up</strong>, ' +
	        'at the behest of the OS, typically if space is short.</q></li>');
	    }
	  });
	}());
	
	
	/////////////////////
	// Import & Export //
	/////////////////////
	
	function importDocument(obj) {
	  // duplicate data into the menu, then open it.
	  menu.duplicate(obj, {select: true, type: 'open'});
	}
	
	$(function () {
	  // Enable buttons now that handlers are ready
	  $('.tm-needsready').prop('disabled', false);
	
	  // Run import from URL query (if any)
	  var importArgs = {
	    dialogNode: getId('importDialog'),
	    importDocument: importDocument
	  };
	  __webpack_require__(/*! ./sharing/import */ 43).runImport(importArgs);
	  // Init import dialog
	  var $importPanel = $('#importPanel');
	  $importPanel.one('show.bs.modal', function () {
	    __webpack_require__(/*! ./sharing/import-panel */ 48).init({
	      $dialog: $importPanel,
	      gistIDForm: getId('gistIDForm'),
	      importArgs: importArgs
	    });
	  });
	  // Init export dialog
	  var exportPanel = getId('exportPanel');
	  __webpack_require__(/*! ./sharing/export-panel */ 49).init({
	    $dialog: $(exportPanel),
	    getCurrentDocument: function () {
	      controller.save(); // IMPORTANT: save changes, otherwise data model is out of date
	      return menu.currentDocument;
	    },
	    getIsSynced: controller.getIsSynced.bind(controller),
	    gistContainer: getId('shareGistContainer'),
	    downloadContainer: getId('exportDownloadContainer'),
	    copyContentsButton: getId('copyContentsButton'),
	    textarea: exportPanel.querySelector('textarea')
	  });
	});
	
	
	///////////////////
	// Document List //
	///////////////////
	
	var menu = (function () {
	  var select = document.getElementById('tm-doc-menu');
	  // Group: Documents
	  var docGroup = document.createElement('optgroup');
	  docGroup.label = 'Documents';
	  select.appendChild(docGroup);
	  // Group: Examples
	  var exampleGroup = document.createElement('optgroup');
	  exampleGroup.label = 'Examples';
	  exampleGroup.appendChild(toDocFragment(examples.list.map(
	    DocumentMenu.prototype.optionFromDocument)));
	  select.appendChild(exampleGroup);
	
	  return new DocumentMenu({
	    menu: select,
	    group: docGroup,
	    storagePrefix: 'tm.docs',
	    firsttimeDocID: examples.firsttimeDocID
	  });
	})();
	
	
	/////////////////
	// "Edit" Menu //
	/////////////////
	
	(function () {
	  menu.onChange = function (doc, opts) {
	    switch (opts && opts.type) {
	      case 'duplicate':
	        controller.setBackingDocument(doc);
	        break;
	      case 'delete':
	        controller.forceLoadDocument(doc);
	        break;
	      default:
	        controller.openDocument(doc);
	    }
	    refreshEditMenu();
	  };
	
	  // Refresh the "Edit" menu items depending on document vs. example.
	  var refreshEditMenu = (function () {
	    var renameLink = document.querySelector('[data-target="#renameDialog"]');
	    var deleteLink = document.querySelector('[data-target="#deleteDialog"]');
	    var wasExample;
	    function renameExample() {
	      // duplicate, then rename the duplicate.
	      // how it works: switch to duplicate document ->
	      //   refreshEditMenu() enables rename dialog -> event bubbles up -> dialog opens.
	      // this might be the simplest way; Event.stopPropagation leaves the dropdown hanging.
	      duplicateDocument();
	    }
	
	    return function () {
	      var isExample = menu.currentDocument.isExample;
	      if (wasExample !== isExample) {
	        if (!isExample) {
	          renameLink.textContent = 'Rename…';
	          renameLink.removeEventListener('click', renameExample);
	          renameLink.setAttribute('data-toggle', 'modal');
	          deleteLink.textContent = 'Delete…';
	          deleteLink.setAttribute('data-target', '#deleteDialog');
	        } else {
	          renameLink.textContent = 'Rename a copy…';
	          renameLink.addEventListener('click', renameExample);
	          renameLink.removeAttribute('data-toggle');
	          deleteLink.textContent = 'Reset this example…';
	          deleteLink.setAttribute('data-target', '#resetExampleDialog');
	        }
	        wasExample = isExample;
	      }
	    };
	  }());
	  refreshEditMenu();
	
	  // only swap out the storage backing; don't affect views or undo history
	  function duplicateDocument() {
	    controller.save();
	    menu.duplicate(menu.currentDocument, {select: true});
	  }
	
	  function newBlankDocument() {
	    menu.newDocument({select: true});
	    // load up starter template
	    if (controller.editor.insertSnippet) { // async loaded
	      controller.editor.insertSnippet(examples.blankTemplate);
	      controller.loadEditorSource();
	    }
	  }
	
	  var $renameDialog = $(getId('renameDialog'));
	  [{id: 'tm-doc-action-duplicate', callback: duplicateDocument},
	  {id: 'tm-doc-action-newblank', callback: newBlankDocument}
	  ].forEach(function (item) {
	    document.getElementById(item.id).addEventListener('click', function (e) {
	      e.preventDefault();
	      item.callback(e);
	
	      $renameDialog.modal({keyboard: false})
	        .one('hidden.bs.modal', function () {
	          controller.editor.focus();
	        });
	    });
	  });
	}());
	
	
	/////////////
	// Dialogs //
	/////////////
	
	(function () {
	  // Rename
	  var $renameDialog = $(getId('renameDialog'));
	  var renameBox = getId('renameDialogInput');
	  $renameDialog
	    .on('show.bs.modal', function () {
	      renameBox.value = menu.currentOption.text;
	    })
	    .on('shown.bs.modal', function () {
	      renameBox.select();
	    })
	    // NB. remember data-keyboard="false" on the triggering element,
	    // to prevent closing with Esc and causing a save.
	    // remark: an exception thrown on 'hide' prevents the dialog from closing,
	    // so save during 'hidden' instead.
	    .on('hidden.bs.modal', function () {
	      var newName = renameBox.value;
	      if (menu.currentOption.text !== newName) {
	        menu.rename(newName);
	      }
	      renameBox.value = '';
	    });
	  document.getElementById('renameDialogForm').addEventListener('submit', function (e) {
	    e.preventDefault();
	    $renameDialog.modal('hide');
	  });
	
	  // Delete
	  function deleteDocument() {
	    menu.delete();
	  }
	  document.getElementById('tm-doc-action-delete').addEventListener('click', deleteDocument);
	
	  // Reset Example
	  function discardReset() {
	    menu.delete();
	    // load manually since example stays and selection doesn't change
	    controller.forceLoadDocument(menu.currentDocument);
	  }
	  function saveReset() {
	    menu.duplicate(menu.currentDocument, {select: false});
	    discardReset();
	  }
	  document.getElementById('tm-doc-action-resetdiscard').addEventListener('click', discardReset);
	  document.getElementById('tm-doc-action-resetsave').addEventListener('click', saveReset);
	}());
	
	////////////////
	// Controller //
	////////////////
	
	var controller = (function () {
	  function getButton(container, type) {
	    return container.querySelector('button.tm-' + type);
	  }
	  var editor = document.getElementById('editor-container');
	  // button containers
	  var sim = document.getElementById('controls-container');
	  var ed = editor.parentNode;
	
	  return new TMDocumentController({
	    simulator: document.getElementById('machine-container'),
	    editorAlerts: document.getElementById('editor-alerts-container'),
	    editor: editor
	  }, {
	    simulator: {
	      run: getButton(sim, 'run'),
	      step: getButton(sim, 'step'),
	      reset: getButton(sim, 'reset')
	    },
	    editor: {
	      runlog: getButton(ed, 'editor-runlog'),
	      load: getButton(ed, 'editor-load'),
	      revert: getButton(ed, 'editor-revert')
	    }
	  }, menu.currentDocument);
	}());
	
	controller.editor.setTheme('ace/theme/chrome');
	controller.editor.commands.addCommand({
	  name: 'save',
	  bindKey: { mac: 'Cmd-S', win: 'Ctrl-S' },
	  exec: function () {
	    controller.loadEditorSource();
	  }
	});
	controller.editor.session.setUseWrapMode(true);
	$(function () {
	  try {
	    __webpack_require__(/*! ./kbdshortcuts */ 51).main(controller.editor.commands,
	      getId('kbdShortcutTable')
	    );
	  } catch (e) {
	    /* */
	  }
	});
	
	window.addEventListener('beforeunload', function (ev) {
	  try {
	    controller.save();
	    menu.saveCurrentDocID();
	  } catch (error) {
	    addAlertPane('warning',
	      '<h4>The current document could not be saved.</h4>'+
	      '<p>It’s likely that the <a href="https://en.wikipedia.org/wiki/Web_storage#Storage_size" target="_blank">local storage quota</a> was exceeded. ' +
	      'Try downloading a copy of this document, then deleting other documents to make space.</p>');
	    return (ev || window.event).returnValue =
	      'There is not enough space left to save the current document.';
	  }
	});
	
	// Keep the current document in sync across tabs/windows
	window.addEventListener('blur', function () {
	  // One tab saves the data...
	  controller.save();
	});
	(function () {
	  // ...and the other tab loads it.
	  var isReloading = false;
	  __webpack_require__(/*! ./TMDocument */ 22).addOutsideChangeListener(function (docID, prop) {
	    if (docID === controller.getDocument().id && prop !== 'name' && !isReloading) {
	      // Batch together property changes into one reload
	      isReloading = true;
	      setTimeout(function () {
	        isReloading = false;
	        // Preserve undo history
	        controller.forceLoadDocument(controller.getDocument(), true);
	
	      }, 100);
	    }
	  });
	}());
	
	// For interaction/debugging
	exports.controller = controller;


/***/ }),
/* 18 */
/*!*************************************!*\
  !*** ./src/TMDocumentController.js ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var TMSimulator = __webpack_require__(/*! ./TMSimulator */ 19),
	    parser = __webpack_require__(/*! ./parser */ 15),
	    util = __webpack_require__(/*! ./util */ 10),
	    ace = __webpack_require__(/*! ace-builds/src-min-noconflict */ 9),
	    d3 = __webpack_require__(/*! d3 */ 6);
	var TMSpecError = parser.TMSpecError;
	var YAMLException = parser.YAMLException;
	var UndoManager = ace.require('ace/undomanager').UndoManager;
	
	/**
	 * For editing and displaying a TMDocument.
	 * The controller coordinates the interactions between
	 *   1. simulator
	 *   2. code editor
	 *   3. storage
	 *
	 * All container and button params are required.
	 * @param {Object} containers
	 *   Empty containers to use (contents will likely be replaced).
	 * @param {HTMLDivElement} containers.simulator
	 * @param {HTMLDivElement} containers.editorAlerts
	 * @param {HTMLDivElement} containers.editor
	 * @param {Object} buttons Buttons to use.
	 * @param {HTMLButtonElement} buttons.simulator.run
	 * @param {HTMLButtonElement} buttons.simulator.step
	 * @param {HTMLButtonElement} buttons.simulator.reset
	 * @param {HTMLButtonElement} buttons.editor.runlog For switching between editor and log
	 * @param {HTMLButtonElement} buttons.editor.load For loading the editor source
	 * @param {HTMLButtonElement} buttons.editor.revert For reverting the editor source
	 * @param {TMDocument} document The document to load from and save to.
	 */
	function TMDocumentController(containers, buttons, document) {
	  this.simulator = new TMSimulator(containers.simulator, buttons.simulator);
	
	  // Set up ace editor //
	  var editor = ace.edit(containers.editor);
	  editor.session.setOptions({
	    mode: 'ace/mode/yaml',
	    tabSize: 2,
	    useSoftTabs: true
	  });
	  editor.setOptions({
	    minLines: 15,
	    maxLines: 50
	  });
	  // suppress warning about
	  // "Automatically scrolling cursor into view after selection change"
	  editor.$blockScrolling = Infinity;
	
	  var editorButtons = buttons.editor;
	  var self = this;
	
	  util.setCookie('TMReload', '');
	
	  window.setInterval(function () {
	    if (util.getCookie('TMReload')){
	      self.loadEditorSource();
	      // save whenever "Load" is pressed
	      self.save();
	      //self.reset();
	      //self.editor.focus();
	      util.setCookie('TMReload', '');
	    }
	  }, 50);
	
	  editorButtons.runlog
	      .addEventListener('click', function () {
	        var divLog = window.document.getElementById('run-log');
	        var divEditor = window.document.getElementById('editor-container');
	
	        if (divLog.getAttribute("hidden") === "hidden") {
	          divLog.removeAttribute("hidden");
	          divEditor.setAttribute("hidden", "hidden");
	          editorButtons.load.disabled = true;
	          editorButtons.revert.disabled = true;
	          editorButtons.runlog.innerHTML="Editor";
	        } else {
	          divEditor.removeAttribute("hidden");
	          divLog.setAttribute("hidden", "hidden");
	          editorButtons.load.disabled = false;
	          editorButtons.revert.disabled = false;
	          editorButtons.runlog.innerHTML="Run Log";
	        }
	      });
	  editorButtons.load
	      .addEventListener('click', function () {
	        self.loadEditorSource();
	        // save whenever "Load" is pressed
	        self.save();
	        self.editor.focus();
	      });
	  editorButtons.revert
	      .addEventListener('click', function () {
	        self.revertEditorSource();
	        self.editor.focus();
	      });
	
	  Object.defineProperties(this, {
	    __document: {
	      value: {editor: {}}, // dummy document that gets replaced
	      writable: true
	    },
	    buttons   : { value: buttons },
	    containers: { value: containers },
	    editor    : { value: editor, enumerable: true }
	  });
	  this.openDocument(document);
	}
	
	TMDocumentController.prototype.getDocument = function () {
	  return this.__document;
	};
	
	// set the backing document, without saving/loading or affecting the views.
	TMDocumentController.prototype.setBackingDocument = function (doc) {
	  this.__document = doc;
	};
	
	// save the current document, then open another one.
	// does nothing if the document ID is the same.
	TMDocumentController.prototype.openDocument = function (doc) {
	  if (this.getDocument().id === doc.id) { return; } // same document
	  this.save();
	  return this.forceLoadDocument(doc);
	};
	
	// (low-level) load the document. current data is discarded without saving.
	// this can be used to switch from a deleted document or reload a document.
	TMDocumentController.prototype.forceLoadDocument = function (doc, keepUndoHistory) {
	  this.setBackingDocument(doc);
	  var diagramSource = doc.sourceCode;
	  var editorSource = doc.editorSourceCode;
	  // init //
	  this.simulator.clear();
	  this.setEditorValue(editorSource == null ? diagramSource : editorSource);
	  // prevent undo-ing to the previous document. note: .reset() doesn't work
	  if (!keepUndoHistory) {
	    this.editor.session.setUndoManager(new UndoManager());
	  }
	
	  if (editorSource == null) {
	    // case: synced: load straight from editor.
	    this.loadEditorSource();
	  } else {
	    // case: not synced: editor has separate contents.
	    this.isSynced = false;
	    try {
	      this.simulator.sourceCode = diagramSource;
	      this.simulator.positionTable = doc.positionTable;
	    } catch (e) {
	      this.showCorruptDiagramAlert(true);
	    }
	  }
	};
	
	TMDocumentController.prototype.save = function () {
	  var doc = this.getDocument();
	  if (this.hasValidDiagram) {
	    // sidenote: deleting first can allow saving when space would otherwise be full
	    doc.editorSourceCode = this.isSynced ? undefined : this.editor.getValue();
	    doc.sourceCode = this.simulator.sourceCode;
	    doc.positionTable = this.simulator.positionTable;
	  } else {
	    if (doc.editorSourceCode == null) {
	      // case 1: editor was synced with the diagram.
	      //  only edit doc.sourceCode until it's fixed;
	      //  don't worsen the problem to case 2.
	      doc.sourceCode = this.editor.getValue();
	    } else {
	      // case 2: editor has separate contents.
	      //  this is more confusing, as there are two "source code" values to contend with.
	      doc.editorSourceCode = this.editor.getValue();
	    }
	  }
	};
	
	/**
	 * Set the editor contents.
	 * • Converts null to '', since editor.setValue(null) crashes.
	 * • Clears the editor alerts.
	 * @param {?string} str
	 */
	TMDocumentController.prototype.setEditorValue = function (str) {
	  this.editor.setValue(util.coalesce(str, ''), -1 /* put cursor at start */);
	  this.setAlertErrors([]);
	};
	
	/////////////////////////
	// Error/Alert Display //
	/////////////////////////
	
	function aceAnnotationFromYAMLException(e) {
	  return {
	    row: e.mark.line,
	    column: e.mark.column,
	    text: 'Not valid YAML (possibly caused by a typo):\n' + e.message,
	    type: 'error'
	  };
	}
	
	TMDocumentController.prototype.setAlertErrors = function (errors) {
	  var self = this;
	  var alerts = d3.select(self.containers.editorAlerts).selectAll('.alert')
	    .data(errors, function (e) { return String(e); }); // key by error description
	
	  alerts.exit().remove();
	
	  alerts.enter()
	    .append('div')
	      .attr('class', 'alert alert-danger')
	      .attr('role', 'alert')
	      .each(/** @this div */ function (e) {
	        var div = d3.select(this);
	        if (e instanceof YAMLException) {
	          var annot = aceAnnotationFromYAMLException(e);
	          var lineNum = annot.row + 1; // annotation lines start at 0; editor starts at 1
	          var column = annot.column;
	          div.append('strong')
	              .text('Syntax error on ')
	             .append('a')
	              .text('line ' + lineNum)
	              .on('click', function () {
	                self.editor.gotoLine(lineNum, column, true);
	                self.editor.focus();
	                // prevent scrolling, especially href="#" scrolling to the top
	                d3.event.preventDefault();
	              })
	              .attr('href', '#' + self.containers.editor.id);
	          div.append('br');
	          // aside: text nodes aren't elements so they need to be wrapped (e.g. in span)
	          // https://github.com/mbostock/d3/issues/94
	          div.append('span').text('Possible reason: ' + e.reason);
	        } else if (e instanceof TMSpecError) {
	          div.html(e.message);
	        } else {
	          div.html('<strong>Unexpected error</strong>: ' + e);
	        }
	      });
	  self.editor.session.setAnnotations(
	    errors
	    .map(function (e) {
	      return (e instanceof YAMLException) ? aceAnnotationFromYAMLException(e) : null;
	    })
	    .filter(function (x) { return x; })
	  );
	};
	
	
	//////////////////////////////
	// Syncing diagram & editor //
	//////////////////////////////
	
	// Sync Status
	
	// This method can be overridden as necessary.
	// The default implementation toggles Bootstrap 3 classes.
	TMDocumentController.prototype.setLoadButtonSuccess = function (didSucceed) {
	  d3.select(this.buttons.editor.load)
	      .classed({
	        'btn-success': didSucceed,
	        'btn-primary': !didSucceed
	      });
	};
	
	// internal. whether the editor and diagram source code are in sync, and the diagram is valid.
	// Updates "Load machine" button display.
	// for future reference: .isSynced cannot be moved to TMDocument because it requires knowledge from the simulator.
	Object.defineProperty(TMDocumentController.prototype, 'isSynced', {
	  set: function (isSynced) {
	    isSynced = Boolean(isSynced);
	    if (this.__isSynced !== isSynced) {
	      this.__isSynced = isSynced;
	      this.setLoadButtonSuccess(isSynced);
	      if (isSynced) {
	        // changes cause desync
	        var onChange = function () {
	          this.isSynced = false;
	          this.editor.removeListener('change', onChange);
	        }.bind(this);
	        this.editor.on('change', onChange);
	      }
	    }
	  },
	  get: function () { return this.__isSynced; }
	});
	
	// public API for isSynced
	TMDocumentController.prototype.getIsSynced = function () {
	  return Boolean(this.isSynced);
	};
	
	// Load & Revert
	
	// internal. used to detect when an imported document is corrupted.
	Object.defineProperty(TMDocumentController.prototype, 'hasValidDiagram', {
	  get: function () {
	    return Boolean(this.simulator.sourceCode);
	  }
	});
	
	/**
	 * Show/hide the notice that the diagram's source code is invalid;
	 * use this when the editor has contents of its own (so it can't display the diagram's source).
	 *
	 * This happens for imported documents that were corrupted.
	 * It can also happen if the value in storage is tampered with.
	 * @param  {boolean} show true to display immediately, false to hide.
	 */
	TMDocumentController.prototype.showCorruptDiagramAlert = function (show) {
	  function enquote(s) { return '<q>' + s + '</q>'; }
	  var div = d3.select(this.simulator.container);
	  if (show) {
	    var revertName = this.buttons.editor.revert.textContent.trim();
	    div.html('')
	      .append('div')
	        .attr('class', 'alert alert-danger')
	        .html('<h4>This imported document has an error</h4>' +
	          [ 'The diagram was not valid and could not be displayed.'
	          , 'You can either load a new diagram from the editor, or attempt to recover this one'
	          , 'using ' + enquote(revertName) + ' (which will replace the current editor contents).'
	          ].join('<br>')
	        );
	  } else {
	    div.selectAll('.alert').remove();
	  }
	};
	
	// Sync from editor to diagram
	TMDocumentController.prototype.loadEditorSource = function () {
	  // load to diagram, and report any errors
	  var errors = (function () {
	    try {
	      var isNewDiagram = !this.hasValidDiagram;
	      this.simulator.sourceCode = this.editor.getValue();
	      if (isNewDiagram) {
	        // loaded new, or recovery succeeded => close error notice, restore positions
	        this.showCorruptDiagramAlert(false);
	        this.simulator.positionTable = this.getDocument().positionTable;
	      }
	      // .toJSON() is the only known way to preserve the cursor/selection(s)
	      // this.__loadedEditorSelection = this.editor.session.selection.toJSON();
	      return [];
	    } catch (e) {
	      return [e];
	    }
	  }.call(this));
	  this.isSynced = (errors.length === 0);
	  this.setAlertErrors(errors);
	};
	
	// Sync from diagram to editor
	TMDocumentController.prototype.revertEditorSource = function () {
	  this.setEditorValue(this.hasValidDiagram
	    ? this.simulator.sourceCode
	    : this.getDocument().sourceCode);
	
	  if (this.hasValidDiagram) {
	    this.isSynced = true;
	  } else {
	    // show errors when reverting to a corrupted diagram
	    this.loadEditorSource();
	  }
	  // if (this.__loadedEditorSelection) {
	  //   this.editor.session.selection.fromJSON(this.__loadedEditorSelection);
	  // }
	};
	
	module.exports = TMDocumentController;


/***/ }),
/* 19 */
/*!****************************!*\
  !*** ./src/TMSimulator.js ***!
  \****************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var parseSpec = __webpack_require__(/*! ./parser */ 15).parseSpec,
	    TMViz = __webpack_require__(/*! ./TMViz */ 1),
	    watchInit = __webpack_require__(/*! ./watch */ 16).watchInit,
	    values = __webpack_require__(/*! lodash */ 12).values;
	
	/**
	 * Turing machine simulator component.
	 *
	 * Contains a state diagram, tape diagram, and button controls.
	 * @param {[type]} container [description]
	 * @param {[type]} buttons   [description]
	 */
	function TMSimulator(container, buttons) {
	  this.container = container;
	  this.buttons = buttons;
	
	  var self = this;
	  buttons.step
	      .addEventListener('click', function () {
	        self.machine.isRunning = false;
	        self.machine.step(); // each step click corresponds to 1 machine step
	      });
	  buttons.run
	      .addEventListener('click', function () {
	        self.machine.isRunning = !self.machine.isRunning;
	      });
	  buttons.reset
	      .addEventListener('click', function () {
	        self.machine.reset();
	      });
	  buttons.all = values(buttons);
	
	  this.clear();
	}
	
	TMSimulator.prototype.clear = function () {
	  this.sourceCode = null;
	};
	
	Object.defineProperties(TMSimulator.prototype, {
	  /**
	   * The machine's source code.
	   * • Setting a new source code will attempt to persist the state node positions.
	   * • To set a new machine, first call .clear(), then set the source code.
	   */
	  sourceCode: { // this is the getter and setter for the yaml code inside the ace editor
	    get: function () {
	      return this.__sourceCode;
	    },
	    // throws if sourceCode has errors
	    set: function (sourceCode) {
	      if (this.machine) {
	        this.machine.isRunning = false; // important
	        this.machine.stateviz.force.stop();
	      }
	      if (sourceCode == null) {
	        // clear display
	        this.machine = null;
	        this.container.innerHTML = '';
	      } else {
	        // parse & check, then set
	        var spec = parseSpec(sourceCode);
	        if (this.machine) {
	          // case: update
	          // copy & restore positions, clear & load contents
	          var posTable = this.machine.positionTable;
	          this.clear();
	          this.machine = new TMViz(this.container, spec, posTable);
	        } else {
	          // case: load new
	          this.machine = new TMViz(this.container, spec);
	        }
	      }
	      this.__sourceCode = sourceCode;
	    },
	    enumerable: true
	  },
	  positionTable: {
	    get: function () {
	      return this.machine && this.machine.positionTable;
	    },
	    set: function (posTable) {
	      if (this.machine && posTable) {
	        this.machine.positionTable = posTable;
	      }
	    },
	    enumerable: true
	  },
	  machine: {
	    get: function () {
	      return this.__machine;
	    },
	    set: function (machine) {
	      this.__machine = machine;
	      this.rebindButtons();
	    }
	  }
	});
	
	/////////////
	// Buttons //
	/////////////
	
	/**
	 * The innerHTML for the "Run" button.
	 * The default value can be overridden.
	 * @type {string}
	 */
	TMSimulator.prototype.htmlForRunButton =
	  '<span class="glyphicon glyphicon-play" aria-hidden="true"></span><br>Run';
	TMSimulator.prototype.htmlForPauseButton =
	  '<span class="glyphicon glyphicon-pause" aria-hidden="true"></span><br>Pause';
	
	// bind: .disabled for Step and Run, and .innerHTML (Run/Pause) for Run
	function rebindStepRun(stepButton, runButton, runHTML, pauseHTML, machine) {
	  function onHaltedChange(isHalted) {
	    stepButton.disabled = isHalted;
	    runButton.disabled = isHalted;
	  }
	  function onRunningChange(isRunning) {
	    runButton.innerHTML = isRunning ? pauseHTML : runHTML;
	  }
	  watchInit(machine, 'isHalted', function (prop, oldval, isHalted) {
	    onHaltedChange(isHalted);
	    return isHalted;
	  });
	  watchInit(machine, 'isRunning', function (prop, oldval, isRunning) {
	    onRunningChange(isRunning);
	    return isRunning;
	  });
	}
	
	// internal method.
	TMSimulator.prototype.rebindButtons = function () {
	  var buttons = this.buttons;
	  var enable = (this.machine != null);
	  if (enable) {
	    rebindStepRun(buttons.step, buttons.run,
	      this.htmlForRunButton, this.htmlForPauseButton, this.machine);
	  }
	  buttons.all.forEach(function (b) { b.disabled = !enable; });
	};
	
	module.exports = TMSimulator;


/***/ }),
/* 20 */
/*!*****************************!*\
  !*** ./src/DocumentMenu.js ***!
  \*****************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* global document */
	var KeyValueStorage = __webpack_require__(/*! ./storage */ 21).KeyValueStorage;
	var TMDocument = __webpack_require__(/*! ./TMDocument */ 22);
	var d3 = __webpack_require__(/*! d3 */ 6);
	var defaults = __webpack_require__(/*! lodash/fp */ 5).defaults; // NB. 2nd arg takes precedence
	
	/**
	 * Document menu controller.
	 *
	 * The view is fully determined by a 3-tuple: ([ID], ID -> Name, currentID).
	 * @constructor
	 * @param {Object}  args                  argument object
	 * @param {HTMLSelectElement}
	 *                  args.menu
	 * @param {?Node}  [args.group=args.menu] Node to add documents to.
	 * @param {string}  args.storagePrefix
	 * @param {?(TMDocument -> HTMLOptionElement)}
	 *                  args.makeOption       Customize rendering for each document entry.
	 * @param {?string} args.firsttimeDocID   Document to open on the first visit.
	 */
	function DocumentMenu(args) {
	  var menu = args.menu,
	      group = args.group || menu,
	      storagePrefix = args.storagePrefix,
	      firsttimeDocID = args.firsttimeDocID;
	
	  if (!menu) {
	    throw new TypeError('DocumentMenu: missing parameter: menu element');
	  } else if (!storagePrefix) {
	    throw new TypeError('DocumentMenu: missing parameter: storage prefix');
	  }
	  if (args.makeOption) {
	    this.optionFromDocument = args.makeOption;
	  }
	  this.menu = menu;
	  this.group = group;
	  this.group.innerHTML = '';
	  this.__storagePrefix = storagePrefix;
	
	  // Load document entries (non-examples)
	  this.doclist = new DocumentList(storagePrefix + '.list');
	  this.render();
	  // Re-open last-opened document
	  this.selectDocID(this.getSavedCurrentDocID() || firsttimeDocID);
	
	  // Listen for selection changes
	  var self = this;
	  this.menu.addEventListener('change', function () {
	    //if the editor isnt visible, hide the runlog, open the editor
	    var divLog = window.document.getElementById('run-log');
	    var divEditor = window.document.getElementById('editor-container');
	    var editorLoad = window.document.getElementById('editor-load');
	    var editorRevert = window.document.getElementById('editor-revert');
	    var editorRunlog = window.document.getElementById('editor-runlog');
	
	    if (!(divLog.getAttribute("hidden") === "hidden")) {
	      divEditor.removeAttribute("hidden");
	      divLog.setAttribute("hidden", "hidden");
	      editorLoad.disabled = false;
	      editorRevert.disabled = false;
	      editorRunlog.innerHTML="Run Log";
	    }
	
	    //make sure to also reset the label boxes so we don't keep a selection accidentally
	    var nodeLabel = window.document.getElementById('nodeLabel');
	    var read = window.document.getElementById('read');
	    var write = window.document.getElementById('write');
	    nodeLabel.value = "";
	    read.value = "";
	    write.value = "";
	
	    //now make it look normal
	    nodeLabel.disabled = true;
	    window.document.getElementById('node-edit-controls').setAttribute("style", "display: flex");
	    window.document.getElementById('transition-edit-controls').setAttribute("style", "display: none");
	    window.document.getElementById('startState').disabled = true;
	    window.document.getElementById('deleteNode').disabled = true;
	    self.onChange(self.currentDocument, {type: 'open'});
	  });
	
	  // Listen for storage changes in other tabs/windows
	  KeyValueStorage.addStorageListener(function (e) {
	    var docID;
	    var option, newOption;
	
	    if (e.key === self.doclist.storageKey) {
	      // case: [ID] list changed
	      self.doclist.readList();
	      self.render();
	    } else if ( (docID = TMDocument.IDFromNameStorageKey(e.key)) ) {
	      // case: single document renamed: (ID -> Name) changed
	      option = self.findOptionByDocID(docID);
	      if (option) {
	        // replace the whole <option>, to be consistent with .optionFromDocument
	        option.parentNode.replaceChild(
	          newOption = self.optionFromDocument(new TMDocument(docID)),
	          option
	        );
	        newOption.selected = option.selected;
	        d3.select(newOption).datum( d3.select(option).datum() );
	      }
	    }
	  });
	}
	
	Object.defineProperties(DocumentMenu.prototype, {
	  currentOption: {
	    get: function () {
	      return this.menu.options[this.menu.selectedIndex];
	    },
	    enumerable: true
	  },
	  currentDocument: {
	    get: function () {
	      var opt = this.currentOption;
	      return opt ? new TMDocument(opt.value) : null;
	    },
	    enumerable: true
	  }
	});
	
	DocumentMenu.prototype.render = function () {
	  var currentDocID = this.currentOption ? this.currentOption.value : null;
	
	  var option = d3.select(this.group).selectAll('option')
	    .data(this.doclist.list, function (entry) { return entry.id; });
	
	  option.exit().remove();
	
	  var self = this;
	  option.enter().insert(function (entry) {
	    return self.optionFromDocument(new TMDocument(entry.id));
	  });
	
	  // If current document was deleted, switch to another document
	  if (this.currentOption.value !== currentDocID) {
	    // fallback 1: saved current docID
	    if (!this.selectDocID(this.getSavedCurrentDocID(), {type: 'delete'})) {
	      // fallback 2: whatever is now selected
	      this.onChange(this.currentDocument, {type: 'delete'});
	    }
	  }
	};
	
	// Returns the <option> whose 'value' attribute is docID.
	DocumentMenu.prototype.findOptionByDocID = function (docID) {
	  return this.menu.querySelector('option[value="' + docID.replace(/"/g, '\\"') + '"]');
	};
	
	// Selects (switches the active item to) the given docID. Returns true on success.
	DocumentMenu.prototype.selectDocID = function (docID, opts) {
	  try {
	    this.findOptionByDocID(docID).selected = true;
	  } catch (e) {
	    return false;
	  }
	  this.onChange(this.currentDocument, opts);
	  return true;
	};
	
	// Saves the current (selected) docID to storage.
	DocumentMenu.prototype.saveCurrentDocID = function () {
	  var docID = this.currentOption && this.currentOption.value;
	  if (docID) {
	    KeyValueStorage.write(this.__storagePrefix + '.currentDocID', docID);
	  }
	};
	
	// Returns the saved current docID, otherwise null.
	DocumentMenu.prototype.getSavedCurrentDocID = function () {
	  return KeyValueStorage.read(this.__storagePrefix + '.currentDocID');
	};
	
	// Configurable methods
	
	DocumentMenu.prototype.optionFromDocument = function (doc) {
	  var option = document.createElement('option');
	  option.value = doc.id;
	  option.text = doc.name || 'untitled';
	  return option;
	};
	
	// Called when the current document ID changes
	// through user action (<select>) or this class's API.
	// The callback receives the new value of .currentDocument,
	// along with the options object (whose .type
	// is 'duplicate', 'delete', or 'open').
	DocumentMenu.prototype.onChange = function () {
	};
	
	// Internal Helpers
	
	// prepend then select
	DocumentMenu.prototype.__prepend = function (doc, opts) {
	  var option = this.optionFromDocument(doc);
	  this.group.insertBefore(option, this.group.firstChild);
	  if (opts && opts.select) {
	    this.menu.selectedIndex = option.index;
	    this.onChange(doc, opts);
	  }
	  return doc;
	};
	
	// Methods not about Current Document
	
	DocumentMenu.prototype.newDocument = function (opts) {
	  return this.__prepend(this.doclist.newDocument(), defaults({type: 'open'}, opts));
	};
	
	// Methods about Current Document
	
	DocumentMenu.prototype.duplicate = function (doc, opts) {
	  return this.__prepend(this.doclist.duplicate(doc), defaults({type: 'duplicate'}, opts));
	};
	
	DocumentMenu.prototype.rename = function (name) {
	  this.currentDocument.name = name;
	  this.currentOption.text = name;
	};
	
	// required invariant: one option is always selected.
	// returns true if the current entry was removed from the list.
	DocumentMenu.prototype.delete = function (opts) {
	  this.currentDocument.delete();
	  var index = this.menu.selectedIndex;
	  var didDeleteEntry = this.doclist.deleteIndex(index);
	  if (didDeleteEntry) {
	    this.currentOption.remove();
	    this.menu.selectedIndex = index;
	    this.onChange(this.currentDocument, defaults({type: 'delete'}, opts));
	  }
	  return didDeleteEntry;
	};
	
	/////////////////////
	// Document List   //
	// (model/storage) //
	/////////////////////
	
	
	// for custom documents.
	function DocumentList(storageKey) {
	  this.storageKey = storageKey;
	  this.readList();
	}
	
	// () -> string
	DocumentList.newID = function () {
	  return String(Date.now());
	};
	
	// internal methods.
	DocumentList.prototype.add = function (docID) {
	  this.__list.unshift({id: docID});
	  this.writeList();
	};
	DocumentList.prototype.readList = function () {
	  this.__list = JSON.parse(KeyValueStorage.read(this.storageKey)) || [];
	};
	DocumentList.prototype.writeList = function () {
	  KeyValueStorage.write(this.storageKey, JSON.stringify(this.__list));
	};
	
	DocumentList.prototype.newDocument = function () {
	  var newID = DocumentList.newID();
	  this.add(newID);
	  return new TMDocument(newID);
	};
	
	DocumentList.prototype.duplicate = function (doc) {
	  return this.newDocument().copyFrom(doc);
	};
	
	/**
	 * Behaves like list.splice(index, 1).
	 * @param  {number} index index of the element to delete
	 * @return {boolean} true if an element was removed, false otherwise (index out of bounds)
	 */
	DocumentList.prototype.deleteIndex = function (index) {
	  var deleted = this.__list.splice(index, 1);
	  this.writeList();
	  return (deleted.length > 0);
	};
	
	Object.defineProperties(DocumentList.prototype, {
	  list: {
	    get: function () { return this.__list; },
	    enumerable: true
	  }
	});
	
	module.exports = DocumentMenu;


/***/ }),
/* 21 */
/*!************************!*\
  !*** ./src/storage.js ***!
  \************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var isBrowserIEorEdge = __webpack_require__(/*! ./util */ 10).isBrowserIEorEdge;
	/* global localStorage:false, window:false */
	
	///////////////////////
	// Key-Value Storage //
	///////////////////////
	
	var canUseLocalStorage = (function () {
	  // from modernizr v3.3.1 (modernizr.com)
	  var mod = 'modernizr';
	  try {
	    localStorage.setItem(mod, mod);
	    localStorage.removeItem(mod);
	    return true;
	  } catch (e) {
	    return false;
	  }
	})();
	
	// RAM-only fallback
	var RAMStorage = (function () {
	  var obj = {};
	  return Object.freeze({
	    get length() { return Object.keys(obj).length; },
	    key: function (n) { return (n in Object.keys(obj)) ? Object.keys(obj)[n] : null; },
	    getItem: function (key) { return {}.hasOwnProperty.call(obj, key) ? obj[key] : null; },
	    setItem: function (key, val) { obj[key] = String(val); },
	    removeItem: function (key) { delete obj[key]; },
	    clear: function () { obj = {}; }
	  });
	})();
	
	var KeyValueStorage = (function () {
	  var s = canUseLocalStorage ? localStorage : RAMStorage;
	
	  // workaround IE/Edge firing events on its own window
	  var fromOwnWindow = isBrowserIEorEdge
	    ? function () { return window.document.hasFocus(); }
	    : function () { return false; };
	
	  return {
	    read  : s.getItem.bind(s),
	    write : s.setItem.bind(s),
	    remove: s.removeItem.bind(s),
	    // Registers a listener for StorageEvents from other tabs/windows.
	    addStorageListener: canUseLocalStorage
	      ? function (listener) {
	        window.addEventListener('storage', function (e) {
	          if (fromOwnWindow()) {
	            return;
	          }
	          if (e.storageArea === localStorage) {
	            listener(e);
	          }
	        });
	      }
	      : function () {},
	    removeStorageListener: canUseLocalStorage
	      ? window.removeEventListener.bind(window, 'storage')
	      : function () {}
	  };
	})();
	
	
	exports.canUseLocalStorage = canUseLocalStorage;
	exports.KeyValueStorage = KeyValueStorage;


/***/ }),
/* 22 */
/*!***************************!*\
  !*** ./src/TMDocument.js ***!
  \***************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var KeyValueStorage = __webpack_require__(/*! ./storage */ 21).KeyValueStorage,
	    examples = __webpack_require__(/*! ./examples */ 23),
	    util = __webpack_require__(/*! ./util */ 10),
	    _ = __webpack_require__(/*! lodash/fp */ 5);
	
	/**
	 * Document model (storage).
	 * @param {string} docID Each document ID in a key-value store should be unique.
	 *                       An ID is typically a timestamp. It should not contain '.'.
	 */
	function TMDocument(docID) {
	  var preset = examples.get(docID);
	  Object.defineProperties(this, {
	    id:     { value: docID },
	    prefix: { value: 'doc.' + docID },
	    isExample: { value: preset ? true : false }
	  });
	  // fall back to reading presets for example documents
	  if (preset) {
	    Object.defineProperties(this, {
	      sourceCode: useFallbackGet(preset, this, 'sourceCode'),
	      // names are read-only
	      positionTable: useFallbackGet(preset, this, 'positionTable'),
	      name: {
	        get: function () { return preset.name; },
	        set: function () {}, // don't err when removing (set = null)
	        enumerable: true
	      }
	    });
	  }
	}
	
	function useFallbackGet(preset, obj, prop) {
	  var proto = Object.getPrototypeOf(obj);
	  var desc = Object.getOwnPropertyDescriptor(proto, prop);
	  var get = desc.get;
	  desc.get = function () {
	    return util.coalesce(get.call(obj), preset[prop]);
	  };
	  return desc;
	}
	
	// internal method.
	TMDocument.prototype.path = function (path) {
	  return [this.prefix, path].join('.');
	};
	
	(function () {
	  var store = KeyValueStorage;
	  var read = store.read.bind(store);
	  var write = function (key, val) {
	    if (val != null) {
	      store.write(key, val);
	    } else {
	      store.remove(key);
	    }
	  };
	  // var remove = store.remove.bind(store);
	  function stringProp(path) {
	    return {
	      get: function () { return read(this.path(path)); },
	      set: function (val) { write(this.path(path), val); },
	      enumerable: true
	    };
	  }
	
	  var propDescriptors = {
	    sourceCode: stringProp('diagram.sourceCode'),
	    positionTable: {
	      get: function () {
	        return util.applyMaybe(parsePositionTable,
	          read(this.path('diagram.positions')));
	      },
	      set: function (val) {
	        write(this.path('diagram.positions'),
	          util.applyMaybe(stringifyPositionTable, val));
	      },
	      enumerable: true
	    },
	    editorSourceCode: stringProp('editor.sourceCode'),
	    name: stringProp('name')
	  };
	  Object.defineProperties(TMDocument.prototype, propDescriptors);
	  TMDocument.prototype.dataKeys = Object.keys(propDescriptors);
	})();
	
	// IDEA: bypass extra parse & stringify cycle for positions
	TMDocument.prototype.copyFrom = function (other) {
	  this.dataKeys.forEach(function (key) {
	    this[key] = other[key];
	  }, this);
	  return this;
	};
	
	TMDocument.prototype.delete = function () {
	  this.copyFrom({});
	};
	
	// Cross-tab/window storage sync
	
	/**
	 * Checks whether a storage key is for a document's name.
	 * @return {?string} The document ID if true, otherwise null.
	 */
	TMDocument.IDFromNameStorageKey = function (string) {
	  var result = /^doc\.([^.]+)\.name$/.exec(string);
	  return result && result[1];
	};
	
	/**
	 * Registers a listener for document changes caused by other tabs/windows.
	 * The listener receives the document ID and the property name that changed.
	 * @param {Function} listener
	 */
	TMDocument.addOutsideChangeListener = function (listener) {
	  var re = /^doc\.([^.]+)\.(.+)$/;
	
	  KeyValueStorage.addStorageListener(function (e) {
	    var matches = re.exec(e.key);
	    if (matches) {
	      listener(matches[1], matches[2]);
	    }
	  });
	};
	
	/////////////////////////
	// Position table JSON //
	/////////////////////////
	
	// JSON -> Object
	var parsePositionTable = JSON.parse;
	
	// PositionTable -> JSON
	var stringifyPositionTable = _.flow(
	  _.mapValues(truncateCoords(2)),
	  JSON.stringify
	);
	
	// Truncate .x .y .px .py to 2 decimal places, to save space.
	function truncateCoords(decimalPlaces) {
	  var multiplier = Math.pow(10, decimalPlaces);
	  function truncate(value) {
	    return Math.round(value * multiplier)/multiplier;
	  }
	
	  return function (val) {
	    var result =  _(val).pick(['x','y','px','py']).mapValues(truncate).value();
	    result.fixed = val.fixed;
	    return result;
	  };
	}
	
	module.exports = TMDocument;


/***/ }),
/* 23 */
/*!*************************!*\
  !*** ./src/examples.js ***!
  \*************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var parseDocument = __webpack_require__(/*! ./sharing/format */ 24).parseDocument;
	var fromPairs = __webpack_require__(/*! lodash/fp */ 5).fromPairs;
	
	
	function requireExample(name) {
	  return __webpack_require__(/*! raw!./examples */ 25)("./" + name + '.yaml');
	}
	
	var examplePairs = [
	  'repeat01',
	  'binaryIncrement',
	  'divisibleBy3',
	  'copy1s',
	  'divisibleBy3Base10',
	  'matchThreeLengths',
	  'matchBinaryStrings',
	  'palindrome',
	  'busyBeaver3',
	  'busyBeaver4',
	  'powersOfTwo',
	  'lengthMult',
	  'binaryAdd',
	  'unaryMult',
	  'binaryMult'
	].map(function (id) {
	  // parse each string into a document
	  var doc = parseDocument(requireExample(id));
	  doc.id = id;
	
	  return [id, doc];
	});
	var examples = Object.freeze(fromPairs(examplePairs));
	
	
	function isExampleID(docID) {
	  return {}.hasOwnProperty.call(examples, docID);
	}
	
	function get(docID) {
	  return isExampleID(docID) ? examples[docID] : null;
	}
	
	var list = examplePairs.map(function (pair) { return pair[1]; });
	
	
	exports.hasID = isExampleID;
	exports.get = get;
	exports.list = list;
	exports.firsttimeDocID = 'binaryIncrement';
	exports.blankTemplate = requireExample('_template');


/***/ }),
/* 24 */
/*!*******************************!*\
  !*** ./src/sharing/format.js ***!
  \*******************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var jsyaml = __webpack_require__(/*! js-yaml */ 8),
	    _ = __webpack_require__(/*! lodash/fp */ 5);
	
	// Document Serialization
	
	var docToYaml = {
	  name: 'name',
	  sourceCode: 'source code',
	  positionTable: 'positions',
	  editorSourceCode: 'editor contents'
	};
	var yamlToDoc = _.invert(docToYaml);
	
	// like _.mapKeys, but only using the keys specified in a mapping object.
	// {[key: string] -> string} -> ?Object -> Object
	function mapKeys(mapping) {
	  return function (input) {
	    var output = {};
	    if (input != null) {
	      Object.keys(mapping).forEach(function (fromKey) {
	        var toKey = mapping[fromKey];
	        output[toKey] = input[fromKey];
	      });
	    }
	    return output;
	  };
	}
	
	// we want parseDocument . stringifyDocument = identity, up to null == undefined.
	
	/**
	 * Serialize a document.
	 * For each state node position, only .x, .y, and .fixed are saved.
	 * .fixed is omitted if true (its default value).
	 * @param  {TMDocument} doc document to serialize
	 * @return {string}
	 */
	var stringifyDocument = _.flow(
	  mapKeys(docToYaml),
	  _.omitBy(function (x) { return x == null; }),
	  _.update('positions', _.mapValues(function (pos) {
	    return pos.fixed
	      ? {x: pos.x, y: pos.y}
	      : {x: pos.x, y: pos.y, fixed: false};
	  })),
	  // NB. lodash/fp/partialRight takes an array of arguments.
	  _.partialRight(jsyaml.safeDump, [{
	    flowLevel: 2,       // positions: one state per line
	    lineWidth: -1,      // don't wrap lines
	    noRefs: true,       // no aliases/references are used
	    noCompatMode: true  // use y: instead of 'y':
	  }])
	);
	
	/**
	 * Deserialize a document.
	 * State positions' .px and .py are optional and default to .x and .y.
	 * .fixed defaults to true.
	 * @param  {string} str    serialized document
	 * @return {Object}        data usable in TMDocument.copyFrom()
	 * @throws {YAMLException} on YAML syntax error
	 * @throws {TypeError}     when missing "source code" string property
	 */
	var parseDocument = _.flow(
	  jsyaml.safeLoad,
	  _.update('positions', _.mapValues(function (pos) {
	    // NB. lodash/fp/defaults is swapped: 2nd takes precedence
	    return _.defaults({px: pos.x, py: pos.y, fixed: true}, pos);
	  })),
	  mapKeys(yamlToDoc),
	  checkData
	);
	
	// throw if "source code" attribute is missing or not a string
	function checkData(obj) {
	  if (obj == null || obj.sourceCode == null) {
	    throw new InvalidDocumentError('The “source code:” value is missing');
	  } else if (!_.isString(obj.sourceCode)) {
	    throw new InvalidDocumentError('The “source code:” value needs to be of type string');
	  }
	  return obj;
	}
	
	// for valid YAML that is not valid as a document
	function InvalidDocumentError(message) {
	  this.name = 'InvalidDocumentError';
	  this.message = message || 'Invalid document';
	  this.stack = (new Error()).stack;
	}
	InvalidDocumentError.prototype = Object.create(Error.prototype);
	InvalidDocumentError.prototype.constructor = InvalidDocumentError;
	
	exports.stringifyDocument = stringifyDocument;
	exports.parseDocument = parseDocument;
	exports.InvalidDocumentError = InvalidDocumentError;
	
	// Re-exports
	exports.YAMLException = jsyaml.YAMLException;


/***/ }),
/* 25 */
/*!****************************************************!*\
  !*** ./src/examples ./~/raw-loader!^\.\/.*\.yaml$ ***!
  \****************************************************/
/***/ (function(module, exports, __webpack_require__) {

	var map = {
		"./_template.yaml": 26,
		"./binaryAdd.yaml": 27,
		"./binaryIncrement.yaml": 28,
		"./binaryMult.yaml": 29,
		"./busyBeaver3.yaml": 30,
		"./busyBeaver4.yaml": 31,
		"./copy1s.yaml": 32,
		"./divisibleBy3.yaml": 33,
		"./divisibleBy3Base10.yaml": 34,
		"./lengthMult.yaml": 35,
		"./matchBinaryStrings.yaml": 36,
		"./matchThreeLengths.yaml": 37,
		"./palindrome.yaml": 38,
		"./powersOfTwo.yaml": 39,
		"./repeat01.yaml": 40,
		"./unaryMult.yaml": 41
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 25;


/***/ }),
/* 26 */
/*!****************************************************!*\
  !*** ./~/raw-loader!./src/examples/_template.yaml ***!
  \****************************************************/
/***/ (function(module, exports) {

	module.exports = "input: '${2}'\r\nblank: '${3:_}'\r\nstart state: ${4:start}\r\ntable:\r\n  ${4}: {}\r\n"

/***/ }),
/* 27 */
/*!****************************************************!*\
  !*** ./~/raw-loader!./src/examples/binaryAdd.yaml ***!
  \****************************************************/
/***/ (function(module, exports) {

	module.exports = "name: binary addition\r\nsource code: |\r\n  input: 1011+11001\r\n  blank: _\r\n  start state: right\r\n  table:\r\n    right:\r\n      '0,1,+': R\r\n      _:\r\n        L: read\r\n    read:\r\n      '0':\r\n        write: c\r\n        L: have0\r\n      '1':\r\n        write: c\r\n        L: have1\r\n      +:\r\n        write: _\r\n        L: rewrite\r\n    have0:\r\n      '0,1': L\r\n      +:\r\n        L: add0\r\n    have1:\r\n      '0,1': L\r\n      +:\r\n        L: add1\r\n    add0:\r\n      '1':\r\n        write: I\r\n        R: back0\r\n      '0,_':\r\n        write: O\r\n        R: back0\r\n      'O,I': L\r\n    add1:\r\n      '1':\r\n        write: O\r\n        L: carry\r\n      '0,_':\r\n        write: I\r\n        R: back1\r\n      'O,I': L\r\n    carry:\r\n      '1':\r\n        write: 0\r\n        L: carry\r\n      '0,_':\r\n        write: 1\r\n        R: back1\r\n    back0:\r\n        '0,1,O,I,+': R\r\n        c:\r\n          write: 0\r\n          L: read\r\n    back1:\r\n        '0,1,O,I,+': R\r\n        c:\r\n          write: 1\r\n          L: read\r\n    rewrite:\r\n        O:\r\n          write: 0\r\n          L: rewrite\r\n        I:\r\n          write: 1\r\n          L: rewrite\r\n        '0,1': L\r\n        _:\r\n          R: done\r\n    done: {}\r\n\r\n  \r\n  # Adds two binary numbers together.\r\n\r\n  # Format: Given input a+b where a and b are binary numbers,\r\n  # leaves c b on the tape, where c = a+b.\r\n  # Example: '11+1' => '100 1'.\r\n  \r\n  # Steps:\r\n  # Start at the second number's rightmost digit.\r\n  # Add each digit from right to left:\r\n  # read the current digit of the second number,\r\n  # and add it to the next place of the first number,\r\n  # marking the place (using O or I) as already added.\r\n  # Then, restore the current digit, and repeat with the next digit.\r\n  # Finish: rewrite place markers back to 0s and 1s.\r\n\r\n  # Exercise:\r\n\r\n  # • Generate the Fibonacci sequence in binary, listed from right to left:\r\n  #   ...1101 1000 101 11 10 1 1 0\r\n  #   Hint: prefix the current number with a +, copy the previous number\r\n  #   and place it left of the +, run the adder, and repeat.\r\n  #   Example: '1 0' => '+1 0' => '0+1 0' => '1 1 0' => '+1 1 0' => ...\r\npositions:\r\n  right:   {x: 300, y: 130}\r\n  rewrite: {x: 500, y: 130}\r\n  done:    {x: 620, y: 130}\r\n\r\n  back0:  {x: 250, y: 250}\r\n  read:   {x: 400, y: 250}\r\n  back1:  {x: 550, y: 250}\r\n  carry:  {x: 650, y: 250}\r\n\r\n  add0:   {x: 150, y: 400}\r\n  have0:  {x: 300, y: 400}\r\n  have1:  {x: 500, y: 400}\r\n  add1:   {x: 650, y: 400}\r\n"

/***/ }),
/* 28 */
/*!**********************************************************!*\
  !*** ./~/raw-loader!./src/examples/binaryIncrement.yaml ***!
  \**********************************************************/
/***/ (function(module, exports) {

	module.exports = "name: binary increment\r\nsource code: |\r\n  input: '1011'\r\n  blank: _\r\n  start state: right\r\n  table:\r\n    right:\r\n      '1,0': R\r\n      _:\r\n        L: carry\r\n    carry:\r\n      '1':\r\n        write: 0\r\n        L: carry\r\n      '0,_':\r\n        write: 1\r\n        L: done\r\n    done: {}\r\n\r\n\r\n  # Adds 1 to a binary number.\r\n\r\n  # Steps:\r\n  # scan to the rightmost digit\r\n  # then carry the 1\r\n\r\n  # Exercises:\r\n\r\n  # • Modify the machine to always halt on the leftmost digit\r\n  #   (regardless of the number's length).\r\n  #   Hint: add a state between carry and done.\r\n\r\n  # • Make a machine that adds 2 instead of 1.\r\n  #   Hint: 2 is '10' in binary, so the last digit is unaffected.\r\n  #   Alternative hint: chain together two copies of the machine from\r\n  #   the first exercise (renaming the states of the second copy).\r\n\r\n  # • Make a machine to subtract 1.\r\n  #   To simplify things, assume the input is always greater than 0.\r\npositions:\r\n  right: {x: 230, y: 250}\r\n  carry: {x: 400, y: 250}\r\n  done: {x: 570, y: 250}\r\n"

/***/ }),
/* 29 */
/*!*****************************************************!*\
  !*** ./~/raw-loader!./src/examples/binaryMult.yaml ***!
  \*****************************************************/
/***/ (function(module, exports) {

	module.exports = "name: binary multiplication\r\nsource code: |\r\n  input: 11*101\r\n  blank: _\r\n  start state: start\r\n  table:\r\n    start:\r\n      '0,1':\r\n        L: init\r\n    init:\r\n      _:\r\n        write: +\r\n        R: right\r\n    right:\r\n      '0,1,*': R\r\n      _:\r\n        L: readB\r\n    readB:\r\n      '0':\r\n        write: _\r\n        L: doubleL\r\n      '1':\r\n        write: _\r\n        L: addA\r\n    addA:\r\n      '0,1': L\r\n      '*':\r\n        L: read\r\n    doubleL:\r\n      '0,1': L\r\n      '*':\r\n        write: 0\r\n        R: shift\r\n    double:\r\n      '0,1,+': R\r\n      '*':\r\n        write: 0\r\n        R: shift\r\n    shift:\r\n      '0':\r\n        write: '*'\r\n        R: shift0\r\n      '1':\r\n        write: '*'\r\n        R: shift1\r\n      _:\r\n        L: tidy\r\n    shift0:\r\n      '0':\r\n        R: shift0\r\n      '1':\r\n        write: 0\r\n        R: shift1\r\n      _:\r\n        write: 0\r\n        R: right\r\n    shift1:\r\n      '0':\r\n        write: 1\r\n        R: shift0\r\n      '1':\r\n        R: shift1\r\n      _:\r\n        write: 1\r\n        R: right\r\n    tidy:\r\n      '0,1':\r\n        write: _\r\n        L: tidy\r\n      +:\r\n        write: _\r\n        L: done\r\n    done: {}\r\n    read:\r\n      '0':\r\n        write: c\r\n        L: have0\r\n      '1':\r\n        write: c\r\n        L: have1\r\n      +:\r\n        L: rewrite\r\n    have0:\r\n      '0,1': L\r\n      +:\r\n        L: add0\r\n    have1:\r\n      '0,1': L\r\n      +:\r\n        L: add1\r\n    add0:\r\n      '1':\r\n        write: I\r\n        R: back0\r\n      'O,I': L\r\n      '0,_':\r\n        write: O\r\n        R: back0\r\n    add1:\r\n      '1':\r\n        write: O\r\n        L: carry\r\n      'O,I': L\r\n      '0,_':\r\n        write: I\r\n        R: back1\r\n    carry:\r\n      '1':\r\n        write: 0\r\n        L: carry\r\n      '0,_':\r\n        write: 1\r\n        R: back1\r\n    back0:\r\n      '0,1,O,I,+': R\r\n      c:\r\n        write: 0\r\n        L: read\r\n    back1:\r\n      '0,1,O,I,+': R\r\n      c:\r\n        write: 1\r\n        L: read\r\n    rewrite:\r\n      O:\r\n        write: 0\r\n        L: rewrite\r\n      I:\r\n        write: 1\r\n        L: rewrite\r\n      '0,1': L\r\n      _:\r\n        R: double\r\n  \r\n  \r\n  # Multiplies two binary numbers together.\r\n\r\n  # Examples: '11*11' => '1001', '111*110' => '101010'.\r\n  \r\n  # Steps:\r\n  # Prefix the input with a '+', and go to the rightmost digit.\r\n  # Read and erase the last digit of the multiplier.\r\n  # If it's 1, add the current multiplicand.\r\n  # In any case, double the multiplicand afterwards.\r\n  # Make room by shifting the multiplier right 1 cell.\r\n  \r\n  # This uses the 'binary addition' machine almost verbatim.\r\n  # It's adjusted to keep the '+'\r\n  # and to lead to another state instead of halting.\r\n\r\n  # Remark:\r\n  # We can view the machine as expressing a recursive function:\r\n\r\n  #   multiply(a, b) = mult(0, a, b)\r\n\r\n  #   mult(acc, a, 0     ) = acc\r\n  #   mult(acc, a, 2k + 0) = mult(acc    , 2a, k)   where k ≠ 0\r\n  #   mult(acc, a, 2k + 1) = mult(acc + a, 2a, k)\r\n\r\n  # where a, b, and k are natural numbers.\r\n\r\n  # Each reduction maintains the invariant\r\n  #   mult(acc, a, b) = acc + a * b\r\n  # Note that mult's third argument (b) is always decreasing,\r\n  # so mult is guaranteed to halt.\r\n  # Eventually b reaches 0 and the result is simply the accumulator.\r\npositions:\r\n  start:  {x: 80 , y: 70}\r\n  init:   {x: 190, y: 70}\r\n  tidy:   {x: 730, y: 70}\r\n  done:   {x: 730, y: 180}\r\n\r\n  right:  {x: 300, y: 115}\r\n  shift:  {x: 600, y: 115}\r\n  shift1: {x: 450, y: 70}\r\n  shift0: {x: 450, y: 160}\r\n\r\n  readB:  {x: 300, y: 215}\r\n  addA:   {x: 160, y: 215}\r\n  doubleL: {x: 550, y: 215}\r\n\r\n  rewrite: {x: 363, y: 300}\r\n  double: {x: 650, y: 300}\r\n\r\n  back0:  {x: 160, y: 370}\r\n  read:   {x: 300, y: 370}\r\n  back1:  {x: 440, y: 370}\r\n  carry:  {x: 540, y: 370}\r\n\r\n  add0:   {x:  60, y: 470}\r\n  have0:  {x: 200, y: 470}\r\n  have1:  {x: 400, y: 470}\r\n  add1:   {x: 540, y: 470}\r\n"

/***/ }),
/* 30 */
/*!******************************************************!*\
  !*** ./~/raw-loader!./src/examples/busyBeaver3.yaml ***!
  \******************************************************/
/***/ (function(module, exports) {

	module.exports = "name: 3-state busy beaver\r\nsource code: |\r\n  input: ''\r\n  blank: '0'\r\n  start state: A\r\n  table:\r\n    A:\r\n      '0':\r\n        write: 1\r\n        R: B\r\n      '1':\r\n        L: C\r\n    B:\r\n      '0':\r\n        write: 1\r\n        L: A\r\n      '1': R\r\n    C:\r\n      '0':\r\n        write: 1\r\n        L: B\r\n      '1':\r\n        R: H\r\n    H: {}\r\n  \r\n  \r\n  # A 3-state 2-symbol busy beaver for most non-blank symbols.\r\n  # It takes 13 steps and leaves 6 non-blank symbols on the tape.\r\n\r\n  # What's a \"busy beaver\"?\r\n  #   Suppose every possible Turing machine with n states and k symbols\r\n  #   (for instance, 3 states and 2 symbols) were started on\r\n  #   a blank tape with no input.\r\n  #   Some of the machines would never halt. Out of the ones that do halt,\r\n  #   a machine that leaves the most non-blank symbols on the tape\r\n  #   is called a busy beaver.\r\n\r\n  # An alternative criterion is halting after the most steps.\r\n  # This busy beaver takes the most steps (21) but only prints 5 1's:\r\n    # A:\r\n    #   0: {write: 1, R: B}\r\n    #   1: {R: H}\r\n    # B:\r\n    #   0: {write: 1, L: B}\r\n    #   1: {write: 0, R: C}\r\n    # C:\r\n    #   0: {write: 1, L}\r\n    #   1: {L: A}\r\n    # H: {}\r\n\r\n\r\n  # Exercise:\r\n\r\n  # • Consider Turing machines that have n states and k symbols.\r\n  #   Instead of a missing instruction, halting is denoted by\r\n  #   a transition to a special \"halt\" state (for a total of n+1 states).\r\n  #   How many different transition functions are possible?\r\n\r\n  #   Hint: Each instruction writes a symbol, moves left or right,\r\n  #   and goes to a state.\r\n  #   There is one instruction per combination of non-halt state & symbol.\r\n\r\n\r\n\r\n  #   Answer: (2k(n+1))^(nk)\r\npositions:\r\n  A: {x: 320, y: 300}\r\n  B: {x: 400, y: 156}\r\n  C: {x: 480, y: 300}\r\n  H: {x: 400, y: 376}\r\n"

/***/ }),
/* 31 */
/*!******************************************************!*\
  !*** ./~/raw-loader!./src/examples/busyBeaver4.yaml ***!
  \******************************************************/
/***/ (function(module, exports) {

	module.exports = "name: 4-state busy beaver\r\nsource code: |\r\n  blank: 0\r\n  start state: A\r\n  table:\r\n    A:\r\n      '0':\r\n        write: 1\r\n        R: B\r\n      '1':\r\n        L: B\r\n    B:\r\n      '0':\r\n        write: 1\r\n        L: A\r\n      '1':\r\n        write: 0\r\n        L: C\r\n    C:\r\n      '0':\r\n        write: 1\r\n        R: H\r\n      '1':\r\n        L: D\r\n    D:\r\n      '0':\r\n        write: 1\r\n        R: D\r\n      '1':\r\n        write: 0\r\n        R: A\r\n    H: {}\r\n\r\n\r\n  # A 4-state 2-symbol busy beaver\r\n  # that halts after 107 steps, leaving 13 1's on the tape.\r\n  # It takes the most steps *and* prints the most 1's.\r\n\r\n  # Finding a busy beaver requires considering every n-state k-symbol\r\n  # machine and proving either that it halts with no more non-blank symbols\r\n  # or that it never halts at all.\r\n\r\n  # Even with strategies to reduce the search space—\r\n  # including normalization, accelerated simulation, and automated proofs—\r\n  # there are still machines that show surprising complexity\r\n  # and require individual analysis.\r\n\r\n  # This 4-state busy beaver was proven by Allen Brady in 1983.\r\n  # Busy beavers for 5 states and above are as yet unknown.\r\n  # At the time of writing, the current 5-state 2-symbol contender\r\n  # takes 47,176,870 steps to halt, and the 6-state contender\r\n  # takes over 7.4 * 10^36534 steps\r\n  # (http://www.logique.jussieu.fr/~michel/bbc.html).\r\n  # \"Given that 5-state 2-symbol halting Turing machines can compute\r\n  # Collatz-like congruential functions, it may be very hard to find\r\n  # [the next busy beaver]\" (https://oeis.org/A060843).\r\n\r\n\r\n  # An entertaining read on busy beavers and their profoundness:\r\n\r\n  # • \"Who Can Name the Bigger Number?\"\r\n  #   http://www.scottaaronson.com/writings/bignumbers.html\r\npositions:\r\n  # square with side length 160\r\n  A: {x: 320, y: 170}\r\n  B: {x: 480, y: 170}\r\n\r\n  C: {x: 480, y: 330}\r\n  D: {x: 320, y: 330}\r\n  H: {x: 620, y: 330}\r\n"

/***/ }),
/* 32 */
/*!*************************************************!*\
  !*** ./~/raw-loader!./src/examples/copy1s.yaml ***!
  \*************************************************/
/***/ (function(module, exports) {

	module.exports = "name: copy 1s\r\nsource code: |\r\n  input: '111'\r\n  blank: 0\r\n  start state: each\r\n  table:\r\n    each:\r\n      '0':\r\n        R: H\r\n      '1':\r\n        write: 0\r\n        R: sep\r\n    sep:\r\n      '0':\r\n        R: add\r\n      '1': R\r\n    add:\r\n      '0':\r\n        write: 1\r\n        L: sepL\r\n      '1': R\r\n    sepL:\r\n      '0':\r\n        L: next\r\n      '1': L\r\n    next:\r\n      '0':\r\n        write: 1\r\n        R: each\r\n      '1': L\r\n    H: {}\r\n\r\n\r\n  # Copies a string of consecutive 1s.\r\n  \r\n  # Steps:\r\n  # mark the current 1 by erasing it\r\n  # skip to the separator\r\n  # skip to the end of the copy and write a 1\r\n  # return to the separator\r\n  # return to the erased 1, restore it, and then advance to the next 1\r\n\r\n  # Exercises:\r\n\r\n  # • Edit the machine to copy the string indefinitely,\r\n  #   i.e. given the input '11', produce 11011011011...\r\n  #   Hint: this can be done by modifying only one transition.\r\n\r\n  # • Make a machine to output the endless sequence 1011011101111011111...\r\npositions:\r\n  each: {x: 400, y: 100}\r\n  sep:  {x: 400, y: 250}\r\n  add:  {x: 400, y: 400}\r\n  sepL: {x: 250, y: 250}\r\n  next: {x: 250, y: 100}\r\n  H:    {x: 550, y: 100}\r\n"

/***/ }),
/* 33 */
/*!*******************************************************!*\
  !*** ./~/raw-loader!./src/examples/divisibleBy3.yaml ***!
  \*******************************************************/
/***/ (function(module, exports) {

	module.exports = "name: divisible by 3\r\nsource code: |\r\n  input: '1001'\r\n  blank: _\r\n  start state: q0\r\n  table:\r\n    q0:\r\n      '0': R\r\n      '1':\r\n        R: q1\r\n      _:\r\n        R: accept\r\n    q1:\r\n      '0':\r\n        R: q2\r\n      '1':\r\n        R: q0\r\n    q2:\r\n      '0':\r\n        R: q1\r\n      '1':\r\n        R: q2\r\n    accept: {}\r\n  \r\n  \r\n  # Checks if a binary number is divisible by 3.\r\n  # try '1111' (15), '10100' (20), '111001' (57)\r\n  \r\n  # How it works:\r\n\r\n  # Consider reading a binary number, say 10011 (19),\r\n  # from left to right one digit at a time.\r\n  # Each time a digit is read, the new value equals the new digit\r\n  # plus the old value shifted left one place (multiplied by 2).\r\n\r\n  # Digits  Value\r\n  # -------------\r\n  #         0\r\n  # 1       1\r\n  # 10      2\r\n  # 100     4\r\n  # 1001    9\r\n  # 10011   19\r\n\r\n  # Now instead of tracking the entire number, just track the remainder.\r\n  # It works the same way.\r\n\r\n  # Exercises:\r\n\r\n  # • Modify the machine to check if n-1 is divisible by 3,\r\n  #   where n is the input. That is, accept the binary of 1, 4, 7, 10, ...\r\n  #   Hint: this can be done without modifying the tape (no 'write').\r\n\r\n  # • Round the number up to the nearest multiple of 3.\r\n  #   Hint: do one pass right to find the remainder, then another pass left\r\n  #   to add. See the 'binary increment' example for how to add.\r\n\r\n  # • Round the number down to the nearest multiple of 3.\r\npositions:\r\n  q0: {x: 230, y: 250}\r\n  q1: {x: 400, y: 250}\r\n  q2: {x: 570, y: 250}\r\n  accept: {x: 230, y: 380}\r\n"

/***/ }),
/* 34 */
/*!*************************************************************!*\
  !*** ./~/raw-loader!./src/examples/divisibleBy3Base10.yaml ***!
  \*************************************************************/
/***/ (function(module, exports) {

	module.exports = "name: divisible by 3 (base 10)\r\nsource code: |\r\n  input: '4728'\r\n  blank: _\r\n  start state: q0\r\n  table:\r\n    q0:\r\n      '0,3,6,9': R\r\n      '1,4,7':\r\n        R: q1\r\n      '2,5,8':\r\n        R: q2\r\n      _:\r\n        R: accept\r\n    q1:\r\n      '0,3,6,9': R\r\n      '1,4,7':\r\n        R: q2\r\n      '2,5,8':\r\n        R: q0\r\n    q2:\r\n      '0,3,6,9': R\r\n      '1,4,7':\r\n        R: q0\r\n      '2,5,8':\r\n        R: q1\r\n    accept: {}\r\n  \r\n  \r\n  # Checks if a base 10 number is divisible by 3.\r\n  # try 42, 57, 1337, 5328, 7521, 314159265\r\n  \r\n  # This uses the same idea as the base 2 version.\r\n  #\r\n  # To make things more interesting, we derive the step relation:\r\n  # Let x be the number left of the tape head,\r\n  #     d the digit under the head, and\r\n  #     x' the number up to and including the head.\r\n  # Then\r\n  #   x' = 10x + d .\r\n  # Notice 10 ≡ 1 (mod 3). Therefore\r\n  #   x' ≡ x + d (mod 3) .\r\n  # Each step simply adds the new digit's remainder mod 3.\r\n  \r\n  # Exercises:\r\n\r\n  # • Check for divisibility by 5.\r\n  #   Hint: only 2 states (besides accept) are required.\r\n\r\n  # • Check for divisibility by 4.\r\n  #   Hint: use 4 states (besides accept).\r\npositions:\r\n  # centered equilateral triangle with side length 250\r\n  q0: {x: 275, y: 322}\r\n  q1: {x: 400, y: 105}\r\n  q2: {x: 525, y: 322}\r\n  accept: {x: 275, y: 430}\r\n"

/***/ }),
/* 35 */
/*!*****************************************************!*\
  !*** ./~/raw-loader!./src/examples/lengthMult.yaml ***!
  \*****************************************************/
/***/ (function(module, exports) {

	module.exports = "name: multiplied lengths\r\nsource code: |\r\n  input: aabbbcccccc\r\n  blank: _\r\n  start state: start\r\n  table:\r\n    start:\r\n      a:\r\n        R: a+\r\n    a+:\r\n      a: R\r\n      b:\r\n        R: b+\r\n    b+:\r\n      b: R\r\n      c:\r\n        R: c+\r\n    c+:\r\n      c: R\r\n      _:\r\n        L: left\r\n    left:\r\n      'a,b,c': L\r\n      _:\r\n        R: eachA\r\n    eachA:\r\n      a:\r\n        write: _\r\n        R: eachB\r\n      b:\r\n        R: scan\r\n    eachB:\r\n      a: R\r\n      b:\r\n        write: B\r\n        R: markC\r\n      C:\r\n        L: nextA\r\n    markC:\r\n      'b,C': R\r\n      c:\r\n        write: C\r\n        L: nextB\r\n    nextB:\r\n      'b,C': L\r\n      B:\r\n        R: eachB\r\n    nextA:\r\n      a: L\r\n      B:\r\n        write: b\r\n        L: nextA\r\n      _:\r\n        R: eachA\r\n    scan:\r\n      'b,C': R\r\n      _:\r\n        R: accept\r\n    accept: {}\r\n\r\n  \r\n  # Decides the language { a^(i)b^(j)c^(k) | i*j = k and i,j,k ≥ 1 }.\r\n  # (a's followed by b's then c's,\r\n  # where the number of a's multiplied by the number of b's\r\n  # equals the number of c's.)\r\n  \r\n  # Check for the form a^(i)b^(j)c^(k) where i,j,k ≥ 1.\r\n  # Then check that i*j = k.\r\n  #   The approach is two nested loops:\r\n  #   For each 'a':\r\n  #     For each 'b':\r\n  #       Mark one 'c'\r\n  #   At the end, check that all c's are marked.\r\n\r\npositions:\r\n  start:  {x: 180, y: 40}\r\n  a+:     {x: 180, y: 180}\r\n  b+:     {x: 180, y: 320}\r\n  c+:     {x: 180, y: 460}\r\n  left:   {x: 290, y: 320}\r\n\r\n  accept: {x: 400, y: 40}\r\n  eachA:  {x: 400, y: 180}\r\n  eachB:  {x: 400, y: 320}\r\n  markC:  {x: 400, y: 460}\r\n\r\n  scan:   {x: 560, y: 180}\r\n  nextA:  {x: 560, y: 320}\r\n  nextB:  {x: 560, y: 460}\r\n"

/***/ }),
/* 36 */
/*!*************************************************************!*\
  !*** ./~/raw-loader!./src/examples/matchBinaryStrings.yaml ***!
  \*************************************************************/
/***/ (function(module, exports) {

	module.exports = "name: equal strings\r\nsource code: |\r\n  input: 01001#01001\r\n  blank: _\r\n  start state: start\r\n  table:\r\n    start:\r\n      '0':\r\n        write: _\r\n        R: have0\r\n      '1':\r\n        write: _\r\n        R: have1\r\n      '#':\r\n        R: check\r\n    have0:\r\n      '0,1': R\r\n      '#':\r\n        R: match0\r\n    have1:\r\n      '0,1': R\r\n      '#':\r\n        R: match1\r\n    match0:\r\n      '0':\r\n        write: x\r\n        L: back\r\n      x: R\r\n    match1:\r\n      '1':\r\n        write: x\r\n        L: back\r\n      x: R\r\n    back:\r\n      '0,1,#,x': L\r\n      _:\r\n        R: start\r\n    check:\r\n      x: R\r\n      _:\r\n        R: accept\r\n    accept: {}\r\n  \r\n  \r\n  # Decides the language { w#w | w ∈ {0,1}* }\r\n  # (two equal binary strings separated by '#')\r\n  # Two strings are equal if they are both the empty string,\r\n  # or they start with the same symbol and are equal thereafter.\r\n\r\n  # Exercises:\r\n\r\n  # • Accept if the second string is the bitwise complement\r\n  #   (1s and 0s swapped) of the first, e.g. accept '1101#0010'.\r\n\r\n  # • Check that a binary string has the same number of 0s and 1s;\r\n  #   eg., accept '001110' but reject '10010'.\r\n\r\n  # • Check if two strings are different.\r\n  #   Example: accept '00#001' and '0101#0111', but reject '1001#1001'.\r\npositions:\r\n  accept: {x: 80 , y: 250}\r\n  check:  {x: 190, y: 250}\r\n  # regular hexagon with side length 150\r\n  start:  {x: 300, y: 250}\r\n  back:   {x: 600, y: 250}\r\n  have1:  {x: 375, y: 120.10}\r\n  match1: {x: 525, y: 120.10}\r\n  have0:  {x: 375, y: 379.90}\r\n  match0: {x: 525, y: 379.90}\r\n"

/***/ }),
/* 37 */
/*!************************************************************!*\
  !*** ./~/raw-loader!./src/examples/matchThreeLengths.yaml ***!
  \************************************************************/
/***/ (function(module, exports) {

	module.exports = "name: three equal lengths\r\nsource code: |\r\n  input: aabbcc\r\n  blank: _\r\n  start state: qA\r\n  table:\r\n    qA:\r\n      a:\r\n        write: A\r\n        R: qB\r\n      B:\r\n        R: scan\r\n    qB:\r\n      'a,B': R\r\n      b:\r\n        write: B\r\n        R: qC\r\n    qC:\r\n      'b,C': R\r\n      c:\r\n        write: C\r\n        L: back\r\n    back:\r\n      'a,B,b,C': L\r\n      A:\r\n        R: qA\r\n    scan:\r\n      'B,C': R\r\n      _:\r\n        R: accept\r\n    accept: {}\r\n    \r\n  \r\n  # Decides the language { aⁿbⁿcⁿ | n ≥ 1 }, that is,\r\n  # accepts a's followed by b's then c's of the same length.\r\n\r\n  # Mark the first a, b, and c on each pass (by capitalizing them).\r\n  # All a's must precede all b's, which must precede all c's.\r\n  # When there are no more a's,\r\n  # all input symbols should have been marked.\r\n\r\n  # Exercises:\r\n\r\n  # • Suppose a ledger starts from 0 and gains one dollar for each +\r\n  #   and loses one for each -. Reading left to right,\r\n  #   check that the account never goes into the negative.\r\n  #   Examples: accept '+-++' and '++-+--', reject '-++' and '++---+'.\r\n\r\n  # • Check parentheses for proper nesting,\r\n  #   e.g. accept '()(()()())' but reject '(()))(' and '(()('.\r\npositions:\r\n  qA: {x: 240, y: 250}\r\n  qB: {x: 400, y: 250}\r\n  qC: {x: 560, y: 250}\r\n  back:   {x: 400, y: 370}\r\n  scan:   {x: 320, y: 150}\r\n  accept: {x: 480, y: 150}\r\n"

/***/ }),
/* 38 */
/*!*****************************************************!*\
  !*** ./~/raw-loader!./src/examples/palindrome.yaml ***!
  \*****************************************************/
/***/ (function(module, exports) {

	module.exports = "name: palindrome\r\nsource code: |\r\n  input: abba\r\n  blank: _\r\n  start state: start\r\n  synonyms:\r\n    accept:\r\n      R: accept\r\n    reject:\r\n      R: reject\r\n  table:\r\n    start:\r\n      a:\r\n        write: _\r\n        R: haveA\r\n      b:\r\n        write: _\r\n        R: haveB\r\n      _: accept\r\n    haveA:\r\n      'a,b': R\r\n      _:\r\n        L: matchA\r\n    haveB:\r\n      'a,b': R\r\n      _:\r\n        L: matchB\r\n    matchA:\r\n      a:\r\n        write: _\r\n        L: back\r\n      b: reject\r\n      _: accept\r\n    matchB:\r\n      a: reject\r\n      b:\r\n        write: _\r\n        L: back\r\n      _: accept\r\n    back:\r\n      'a,b': L\r\n      _:\r\n        R: start\r\n    accept: {}\r\n    reject: {}\r\n    \r\n  \r\n  # Accepts palindromes made of the symbols 'a' and 'b'\r\n  # A palindrome is either the empty string, a single symbol,\r\n  # or a (shorter) palindrome with the same symbol added to both ends.\r\n\r\n  # Exercise:\r\n\r\n  # • Modify the machine to include 'c' in the symbol alphabet,\r\n  #   so it also works for strings like 'cabbac'.\r\npositions:\r\n  haveA:  {x: 240, y: 185}\r\n  start:  {x: 400, y: 185}\r\n  haveB:  {x: 560, y: 185}\r\n\r\n  matchA: {x: 240, y: 315}\r\n  back:   {x: 400, y: 315}\r\n  matchB: {x: 560, y: 315}\r\n\r\n  accept: {x: 400, y: 55}\r\n  reject: {x: 400, y: 445}\r\n"

/***/ }),
/* 39 */
/*!******************************************************!*\
  !*** ./~/raw-loader!./src/examples/powersOfTwo.yaml ***!
  \******************************************************/
/***/ (function(module, exports) {

	module.exports = "name: powers of two\r\nsource code: |\r\n  input: '0000'\r\n  blank: _\r\n  start state: zero\r\n  synonyms:\r\n    accept:\r\n      R: accept\r\n    reject:\r\n      R: reject\r\n  table:\r\n    zero:\r\n      '0':\r\n        write: _\r\n        R: one\r\n      _: reject\r\n    one:\r\n      '0':\r\n        write: x\r\n        R: even\r\n      x: R\r\n      _: accept\r\n    even:\r\n      '0':\r\n        R: odd\r\n      x: R\r\n      _:\r\n        L: back\r\n    odd:\r\n      '0':\r\n        write: x\r\n        R: even\r\n      x: R\r\n      _: reject\r\n    back:\r\n      '0,x': L\r\n      _:\r\n        R: one\r\n    accept: {}\r\n    reject: {}\r\n\r\n  \r\n  # Matches strings of 0s whose length is a power of two.\r\n\r\n    # This example comes from the textbook\r\n    #   \"Introduction to the Theory of Computation\" (3rd edition, 2012)\r\n    #   by Michael Sipser\r\n    # The states have been renamed (from q1, q2, etc.)\r\n    # to make it easier to understand.\r\n  \r\n  # The idea: divide the length by 2 repeatedly until it reaches 1.\r\n\r\n  # To do this, cross off every other 0, one pass at a time.\r\n  # If any pass reads an odd number of 0s (a remainder), reject right away.\r\n  # Otherwise if every pass halves the length cleanly,\r\n  # the length must be a power of two (1*2^n for n ≥ 0).\r\n\r\n  # Note that since the first 0 is never crossed off, we can simply\r\n  # erase it on the first pass and start the count from 1 from then on.\r\n\r\npositions:\r\n  zero:   {x: 200, y: 200}\r\n  one:    {x: 400, y: 200}\r\n  even:   {x: 600, y: 200}\r\n\r\n  odd:    {x: 600, y: 385}\r\n  back:   {x: 500, y: 125}\r\n  accept: {x: 400, y: 300}\r\n  reject: {x: 200, y: 385}\r\n"

/***/ }),
/* 40 */
/*!***************************************************!*\
  !*** ./~/raw-loader!./src/examples/repeat01.yaml ***!
  \***************************************************/
/***/ (function(module, exports) {

	module.exports = "name: repeat 0 1\r\nsource code: |\r\n  input: ''\r\n  blank: _\r\n  start state: b\r\n  table:\r\n    b:\r\n      _:\r\n        write: 0\r\n        R: c\r\n    c:\r\n      _:\r\n        R: e\r\n    e:\r\n      _:\r\n        write: 1\r\n        R: f\r\n    f:\r\n      _:\r\n        R: b\r\n\r\n\r\n  # This is the first example machine given by Alan Turing in his 1936 paper\r\n  #   \"On Computable Numbers, with an Application to\r\n  #    the Entscheidungsproblem\".\r\n  # It simply writes the endless sequence 0 1 0 1 0 1...\r\n\r\n  # (Turing uses the convention of leaving a gap after each output cell,\r\n  # reserving it for marking the cell. For instance, on a tape that\r\n  # contains '0 1x0 0 1 1y1y0y', x marks the leftmost 1 and y marks 110.)\r\npositions:\r\n  b: {x: 300, y: 200}\r\n  c: {x: 450, y: 150}\r\n  e: {x: 500, y: 300}\r\n  f: {x: 350, y: 350}\r\n"

/***/ }),
/* 41 */
/*!****************************************************!*\
  !*** ./~/raw-loader!./src/examples/unaryMult.yaml ***!
  \****************************************************/
/***/ (function(module, exports) {

	module.exports = "name: unary multiplication\r\nsource code: |\r\n  input: '||*|||'\r\n  blank: _\r\n  start state: eachA\r\n  table:\r\n    eachA:\r\n      '|':\r\n        write: _\r\n        R: toB\r\n      '*':\r\n        R: skip\r\n    toB:\r\n      '|': R\r\n      '*':\r\n        R: eachB\r\n    nextA:\r\n      '|,*': L\r\n      _:\r\n        write: '|'\r\n        R: eachA\r\n    skip:\r\n      '|': R\r\n      _:\r\n        R: done\r\n    done: {}\r\n    eachB:\r\n      '|':\r\n        write: _\r\n        R: sep\r\n      _:\r\n        L: nextA\r\n    sep:\r\n      '|': R\r\n      _:\r\n        R: add\r\n    add:\r\n      '|': R\r\n      _:\r\n        write: '|'\r\n        L: sepL\r\n    sepL:\r\n      '|': L\r\n      _:\r\n        L: nextB\r\n    nextB:\r\n      '|': L\r\n      _:\r\n        write: '|'\r\n        R: eachB\r\n\r\n  \r\n  # Multiplies together two unary numbers separated by a '*'.\r\n  # (Unary is like tallying. Here '||*|||' means 2 times 3.)\r\n  \r\n  # The idea:\r\n  #   multiply(0, b) = 0\r\n  #   multiply(a, b) = b + multiply(a-1, b)   when a > 0\r\n  \r\n  # This machine directly utilises the 'copy 1s' machine:\r\n  # For each 1 in a, add a copy of b.\r\n\r\npositions:\r\n  eachA:  {x: 400, y:  50}\r\n  toB:    {x: 400, y: 150}\r\n  eachB:  {x: 400, y: 250}\r\n  sep:   {x: 400, y: 350}\r\n  add:   {x: 400, y: 450}\r\n\r\n  sepL:  {x: 280, y: 350}\r\n  nextB:  {x: 280, y: 250}\r\n\r\n  nextA:  {x: 280, y: 90}\r\n  skip:   {x: 520, y: 90}\r\n  done:   {x: 520, y: 190}\r\n"

/***/ }),
/* 42 */
/*!*************************!*\
  !*** external "jQuery" ***!
  \*************************/
/***/ (function(module, exports) {

	module.exports = jQuery;

/***/ }),
/* 43 */
/*!*******************************!*\
  !*** ./src/sharing/import.js ***!
  \*******************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* eslint-env browser */
	var CheckboxTable = __webpack_require__(/*! ./CheckboxTable */ 44);
	var FileReaderPromise = __webpack_require__(/*! ./FileReaderPromise */ 45);
	var format = __webpack_require__(/*! ./format */ 24);
	var getGist = __webpack_require__(/*! ./gist */ 47).getGist;
	
	var $ = __webpack_require__(/*! jquery */ 42);
	var _ = __webpack_require__(/*! lodash/fp */ 5);
	var d3 = __webpack_require__(/*! d3 */ 6);
	var Promise = __webpack_require__(/*! bluebird */ 46);  // eslint-disable-line no-shadow
	
	
	function decodeFormURLComponent(str) {
	  return decodeURIComponent(str.replace('+', ' '));
	}
	
	/**
	 * https://url.spec.whatwg.org/#urlencoded-parsing
	 */
	function queryParams(queryString) {
	  function decode(str) {
	    return str ? decodeFormURLComponent(str) : '';
	  }
	  var result = {};
	  queryString.split('&').forEach(function (str) {
	    var pair = str.split('=');
	    result[decode(pair[0])] = decode(pair[1]);
	  });
	  return result;
	}
	
	///////////////////
	// Import Dialog //
	///////////////////
	
	// requires an existing dialog in the DOM
	function ImportDialog(dialogNode) {
	  this.node = dialogNode;
	  this.titleNode = dialogNode.querySelector('.modal-header .modal-title');
	  this.bodyNode = dialogNode.querySelector('.modal-body');
	  this.footerNode = dialogNode.querySelector('.modal-footer');
	  this.cancelButtonNode = d3.select(this.footerNode).text('')
	    .append('button')
	      .attr({type: 'button', class: 'btn btn-default', 'data-dismiss': 'modal'})
	      .text('Cancel')
	    .node();
	  this.$dialog = $(dialogNode)
	    .one('hide.bs.modal', this.__onClose.bind(this));
	}
	
	// internal event handler.
	ImportDialog.prototype.__onClose = function () {
	  this.onClose();
	  // use .empty to clean up $.on used in CheckboxTable
	  $(this.bodyNode).empty();
	  $(this.footerNode).empty();
	};
	
	// configurable
	ImportDialog.prototype.onClose = function () {
	};
	
	ImportDialog.prototype.show = function () {
	  this.$dialog.modal({backdrop: 'static', keyboard: false});
	};
	
	ImportDialog.prototype.close = function () {
	  this.$dialog.modal('hide');
	};
	
	ImportDialog.prototype.setBodyChildNodes = function (nodes) {
	  this.bodyNode.textContent = '';
	  this.bodyNode.appendChild(joinNodes(nodes));
	};
	
	function appendPanel(div, titleHTML) {
	  var panel = div.append('div')
	      .attr('class', 'panel panel-default');
	  panel.append('div')
	      .attr('class', 'panel-heading')
	    .append('h5')
	      .attr('class', 'panel-title')
	      .html(titleHTML);
	  return panel;
	}
	
	var emptySelection = Object.freeze(d3.selectAll([]));
	
	// (D3Selection, {title: string, data: [string]}) -> void
	function appendListPanel(container, data) {
	  var panel = emptySelection;
	  if (data.data && data.data.length) {
	    panel = appendPanel(container, data.title);
	    panel.append('div')
	        .attr('class', 'panel-body')
	      .append('ul')
	        .attr('class', 'list-inline')
	      .selectAll('li')
	        .data(data.data)
	      .enter().append('li')
	        .text(_.identity);
	  }
	  return panel;
	}
	
	// ( D3Selection, {title: string, headers: [string],
	//  data: [[string | (D3Selection -> void)]]} ) -> void
	function appendTablePanel(container, data) {
	  var panel = emptySelection;
	  if (data.data && data.data.length) {
	    panel = appendPanel(container, data.title);
	    panel.append('table')
	        .attr('class', 'table')
	        .call(function (table) {
	          // headers
	          table.append('thead')
	            .append('tr').selectAll('th').data(data.headers)
	            .enter().append('th').text(_.identity);
	          // contents
	          table.append('tbody').selectAll('tr')
	              .data(data.data)
	            .enter().append('tr').selectAll('td')
	              .data(_.identity)
	            .enter().append('td').each(/* @this td */ function (d) {
	              var td = d3.select(this);
	              if (typeof d === 'function') {
	                d(td);
	              } else {
	                td.text(d);
	              }
	            });
	        });
	  }
	  return panel;
	}
	
	// NonDocumentFiles -> boolean
	var isEmptyNonDocs = _.every(_.isEmpty);
	
	// (D3Selection, NonDocumentFiles, ?string) -> void
	function listNondocuments(dialogBody, nondocs, disclosureTitle) {
	  if (isEmptyNonDocs(nondocs)) {
	    return;
	  }
	  // Disclosure triangle
	  var collapseId = 'nondocument-files';
	  dialogBody.append('a')
	      .attr({
	        href: '#'+collapseId,
	        class: 'disclosure-triangle collapsed',
	        role: 'button',
	        'data-toggle': 'collapse'
	      })
	      .text(disclosureTitle ? disclosureTitle : 'Show other files');
	  var container = dialogBody.append('div')
	      .attr({
	        id: collapseId,
	        class: 'collapse'
	      });
	  // Errors by type, most important first
	  appendTablePanel(container, {
	    title: 'Unexpected error',
	    headers: ['Filename', 'Error'],
	    data: nondocs.otherError.map(function functionName(d) {
	      return [d.filename, errorString(d.error) ];
	    })
	  }).classed('panel-danger', true);
	  appendTablePanel(container, {
	    title: 'Not suitable for import',
	    headers: ['Filename', 'Reason'],
	    data: nondocs.badDoc.map(function (d) {
	      return [d.filename, d.error.message];
	    })
	  });
	  appendTablePanel(container, {
	    title: 'Not valid as YAML',
	    headers: ['Filename', 'Syntax error'],
	    data: nondocs.badYAML.map(function (d) {
	      return [d.filename,
	        function (td) { td.append('pre').text(d.error.message); } ];
	    })
	  });
	  // TODO: document largest allowed filesize; limit export likewise
	  appendListPanel(container, {
	    title: 'File is too large',
	    data: nondocs.tooLarge
	  });
	  appendListPanel(container, {
	    title: 'Different file extension (not <code>.yaml</code>/<code>.yml</code>)',
	    data: nondocs.wrongType
	  });
	}
	
	// deal with objects like DOMError (whose .toString gives "[object FileError]")
	function errorString(reason) {
	  return reason instanceof Error
	    ? String(reason)
	    : reason.message || reason.name || String(reason);
	}
	
	//////////////////////
	// Document Parsing //
	//////////////////////
	
	/* Interface for Document Parsing
	  type GistFile = {
	    filename: string,
	    size: number,
	    truncated: boolean,
	    content: string
	  };
	  type TMData = {source code: string};
	  type DocFile = {filename: string, size: number, document: TMData};
	
	  type Filename = string;
	  type ErrorTuple = {filename: Filename, error: Error | YAMLException};
	  type NonDocumentFiles = {
	    wrongType:  [Filename],
	    tooLarge:   [Filename],
	    badYAML:    [ErrorTuple],
	    badDoc:     [ErrorTuple],
	    otherError: [ErrorTuple]
	  };
	  type ParseResult = {documentFiles: [DocFile], nonDocumentFiles: NonDocumentFiles};
	 */
	
	// Parse each file into a document or a categorized error.
	// Local files are read only if they have the right extension and size.
	// NB. make sure to convert FileList to an actual Array.
	// The promise resolves with ParseResult.
	// (number, [GistFile | File]) -> Promise
	function parseFiles(sizelimit, files) {
	  var docfiles = [];
	  var nondocs = {wrongType: [], tooLarge: [], badYAML: [], badDoc: [], otherError: []};
	
	  return Promise.each(files, function (file) {
	    var name = file.filename || file.name; // eslint-disable-line no-shadow
	    if (name.search(/\.ya?ml$/) === -1) {
	      nondocs.wrongType.push(name);
	    } else if (file.truncated || file.size > sizelimit) {
	      nondocs.tooLarge.push(name);
	    } else {
	      return Promise.resolve(file.content != null ? file.content
	        : FileReaderPromise.readAsText(file))
	      .then(function (content) {
	        docfiles.push({
	          filename: name,
	          size: file.size,
	          document: format.parseDocument(content)
	        });
	      }).catch(function (e) {
	        var tuple = {filename: name, error: e};
	        if (e instanceof format.YAMLException) {
	          nondocs.badYAML.push(tuple);
	        } else if (e instanceof format.InvalidDocumentError) {
	          nondocs.badDoc.push(tuple);
	        } else {
	          nondocs.otherError.push(tuple);
	        }
	      });
	    }
	  }).return({documentFiles: docfiles, nonDocumentFiles: nondocs});
	}
	
	/////////////////////
	// Document Import //
	/////////////////////
	
	function showSizeKB(n) {
	  // example: 12.0 KB
	  return (Math.ceil(10*n/1024)/10).toFixed(1) + ' KB';
	}
	
	// {docFiles: [DocFile], nonDocumentFiles: NonDocumentFiles,
	//  dialog: ImportDialog, citeNode?: Node, importDocuments: [TMData] -> void} -> void
	function pickMultiple(args) {
	  var docfiles = args.documentFiles,
	      nondocs = args.nonDocumentFiles,
	      citeNode = args.citeNode,
	      dialog = args.dialog,
	      importDocuments = args.importDocuments;
	  // Dialog body
	  var dialogBody = d3.select(dialog.bodyNode).text('');
	  dialogBody.append('p').call(function (p) {
	    p.append('strong').text('Select documents to import');
	    if (citeNode) {
	      p.node().appendChild(document.createTextNode(' from '));
	      p.node().appendChild(citeNode);
	    }
	  });
	  var ctable = new CheckboxTable({
	    table: dialogBody.append('table')
	      .attr({class: 'table table-hover checkbox-table'}),
	    headers: ['Filename', 'Size'],
	    data: docfiles.map(function (doc) {
	      return [doc.filename, showSizeKB(doc.size)];
	    })
	  });
	  listNondocuments(dialogBody, nondocs);
	  // Dialog footer
	  var importButton = d3.select(dialog.footerNode).append('button')
	      .attr({type: 'button', class: 'btn btn-primary', 'data-dismiss': 'modal'})
	      .property('disabled', true)
	      .text('Import')
	      .on('click', /* @this button */ function () {
	        d3.select(this).on('click', null); // prevent double import; like .one()
	        var names = d3.set(ctable.getCheckedValues());
	        importDocuments(docfiles
	          .filter(function (file) { return names.has(file.filename); })
	          .map(_.property('document'))
	        );
	      })
	    .node();
	  ctable.onChange = function () {
	    importButton.disabled = ctable.isCheckedEmpty();
	  };
	}
	
	// {nonDocumentFiles: NonDocumentFiles, dialog: ImportDialog, citeLink?: Node} -> void
	function pickNone(args) {
	  var nondocs = args.nonDocumentFiles,
	      dialog = args.dialog,
	      citeLink = args.citeLink;
	
	  d3.select(dialog.bodyNode).text('').call(function (body) {
	    body.append('p').append('strong').text(!isEmptyNonDocs(nondocs)
	        ? 'None of the files are suitable for import.'
	        : 'No files were selected.');
	    if (citeLink) {
	      body.append('p').text('Requested URL: ').node().appendChild(citeLink);
	    }
	    listNondocuments(body, nondocs, 'Show details');
	  });
	  dialog.cancelButtonNode.textContent = 'Close';
	}
	
	// Intermingle text and nodes.
	// [Node | string] -> DocumentFragment
	function joinNodes(nodes) {
	  var result = document.createDocumentFragment();
	  nodes.forEach(function (node) {
	    if (typeof node === 'string') {
	      result.appendChild(document.createTextNode(node));
	    } else {
	      result.appendChild(node);
	    }
	  });
	  return result;
	}
	
	function wrapTag(tagName, node) {
	  var tag = document.createElement(tagName);
	  tag.appendChild(node);
	  return tag;
	}
	
	// Create a link with text <q>`gist description`</q> if given, otherwise gist `gistID`.
	// {gistID: string, description?: string} -> HTMLAnchorElement | HTMLQuoteElement
	function gistDescriptionLink(args) {
	  var link = externalLink({
	    href: 'https://gist.github.com/' + args.gistID,
	    textContent: args.description || ('gist ' + args.gistID)
	  });
	  return args.description ? wrapTag('q', link) : link;
	}
	
	// {href: string, textContent?: string} -> HTMLAnchorElement
	function externalLink(args) {
	  var link = document.createElement('a');
	  link.href = args.href;
	  link.target = '_blank';
	  link.textContent = args.textContent || args.href;
	  return link;
	}
	
	// The returned promise resolves/cancels when the dialog is closed:
	// • resolves if loading (before import) finished and the user cancelled anyway
	// • cancels if files were still loading and not yet displayed (eg. fetch, parse)
	// ({gistID: string, dialogNode: Node, importDocument: TMData -> void} |
	// {files: FileList, dialogNode: Node, importDocument: TMData -> void}) -> Promise
	function importCommon(args) {
	  var gistID = args.gistID,
	      dialogNode = args.dialogNode,
	      importDocument = args.importDocument;
	
	  var dialog = new ImportDialog(dialogNode);
	  var citeLink;
	  var citeNode;
	  // prevent accidentally exceeding quota
	  var MAX_FILESIZE = 400 * 1024;
	  // Start fetch, show dialog
	  var filesPromise = (function () {
	    if (gistID != null) {
	      dialog.titleNode.textContent = 'Import from GitHub gist';
	      citeLink = externalLink({href: 'https://gist.github.com/' + gistID});
	      dialog.setBodyChildNodes(['Retrieving ', citeLink, '…']);
	      return getGist(gistID).then(function (data) {
	        citeNode = gistDescriptionLink({
	          gistID: gistID,
	          description: data.description
	        });
	        dialog.setBodyChildNodes(['Processing ', citeLink, '…']);
	        return _.values(data.files);
	      });
	    } else {
	      dialog.titleNode.textContent = 'Import from files';
	      dialog.setBodyChildNodes(['Processing files…']);
	      return Promise.resolve(_.toArray(args.files));
	    }
	  }());
	  dialog.show();
	  // Parse, pick, import
	  var promise = filesPromise
	  .then(parseFiles.bind(undefined, MAX_FILESIZE))
	  .then(function (parsed) {
	    var docfiles = parsed.documentFiles;
	    switch (docfiles.length) {
	      case 0:
	        pickNone({
	          nonDocumentFiles: parsed.nonDocumentFiles,
	          dialog: dialog,
	          citeLink: citeLink
	        });
	        return;
	      case 1:
	        importDocument(docfiles[0].document);
	        dialog.close();
	        return;
	      default:
	        pickMultiple({
	          documentFiles: docfiles,
	          nonDocumentFiles: parsed.nonDocumentFiles,
	          dialog: dialog,
	          citeNode: citeNode,
	          importDocuments: function importDocuments(docs) {
	            docs.concat().reverse().map(importDocument);
	          }
	        });
	    }
	  })
	  .catch(function (reason) {
	    dialog.setBodyChildNodes([messageForError(reason)]
	      .concat(citeLink ? ['Requested URL: ', citeLink] : [])
	    );
	    dialog.cancelButtonNode.textContent = 'Close';
	  });
	  var waitForDialog = new Promise(function (resolve) {
	    dialog.onClose = function () {
	      promise.cancel();
	      resolve();
	    };
	  });
	  return promise.return(waitForDialog);
	}
	
	// {gistID: string, dialogNode: Node, importDocument: TMData -> void} -> Promise
	var importGist = importCommon;
	
	// {files: FileList, dialogNode: Node, importDocument: TMData -> void} -> Promise
	var importLocalFiles = importCommon;
	
	function createElementHTML(tagName, innerHTML) {
	  var element = document.createElement(tagName);
	  element.innerHTML = innerHTML;
	  return element;
	}
	
	// ({xhr: jqXHR} | Error) -> Node
	function messageForError(reason) {
	  var xhr = reason.xhr;
	  if (xhr) {
	    // case: couldn't fetch
	    return createElementHTML('p', (function () {
	      switch (reason.status) {
	        case 'abort':
	          return [''];
	        case 'timeout':
	          return [
	            '<strong>The request timed out.</strong>',
	            'You can check your connection and try again.'
	          ];
	        default:
	        // case: HTTP error
	          if (xhr.status === 404) {
	            return [
	              '<strong>No GitHub gist exists with that ID.</strong>',
	              'It’s possible the ID is incorrect, or the gist was deleted.'
	            ];
	          } else if (xhr.status === 0) {
	            return ['GitHub could not be reached. Your Internet connection may be offline.'];
	          } else {
	            return [
	              'The import failed because of a <strong>connection error</strong>.',
	              'HTTP status code: ' + xhr.status + ' ' + xhr.statusText
	            ];
	          }
	      }
	    }()).join('<br>'));
	  } else {
	    // case: other error
	    var pre = document.createElement('pre');
	    pre.textContent = errorString(reason);
	    return joinNodes([
	      createElementHTML('p', 'An unexpected error occurred:'), pre]);
	  }
	}
	
	// Import a gist via ?import-gist=gistID and remove the query string from the URL.
	// Call this once the DOM is ready (document.readyState === 'interactive').
	// {dialogNode: Node, importDocument: TMData -> void} -> void
	function runImport(args) {
	  function removeQuery() {
	    try {
	      history.replaceState(null, null, location.pathname);
	    } catch (e) {
	      // ignore
	    }
	  }
	
	  var params = queryParams(location.search.substring(1));
	  var gistID = params['import-gist'];
	  if (gistID) {
	    importGist(_.assign({gistID: gistID}, args))
	    .finally(removeQuery);
	  }
	}
	
	exports.importGist = importGist;
	exports.importLocalFiles = importLocalFiles;
	exports.runImport = runImport;


/***/ }),
/* 44 */
/*!**************************************!*\
  !*** ./src/sharing/CheckboxTable.js ***!
  \**************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	// var d3 = require('d3');
	var $ = __webpack_require__(/*! jquery */ 42); // for event delegation
	
	function identity(x) { return x; }
	function head(array) { return array[0]; }
	
	/**
	 * A <table> that includes a checkbox in front of each row,
	 * and a header checkbox to (de)select all rows.
	 * @param {D3Selection<HTMLTableElement>} args.table empty table to use
	 * @param {[string]}    [args.headers] column headers
	 * @param {[[string]]}  [args.data]    table data
	 */
	function CheckboxTable(args) {
	  this.table = args.table;
	  this.headerRow = this.table.append('thead').append('tr');
	  this.tbody = this.table.append('tbody');
	  // header checkbox (selects/deselects all checkboxes)
	  var self = this;
	  this.headerCheckbox = this.headerRow
	    .append('th')
	      .attr('class', 'checkbox-cell')
	    .append('input')
	      .attr('type', 'checkbox')
	      .on('click', /* @this checkbox */ function () {
	        self.getCheckboxes().property('checked', this.checked);
	        self.onChange();
	      });
	  $(this.tbody.node()).on('click', 'tr', /* @this tr */ function (e) {
	    // treat whole <tr> as click zone
	    if (e.target.tagName !== 'INPUT') {
	      var box = this.querySelector('input[type="checkbox"]');
	      box.checked = !box.checked;
	    }
	    // update header checkbox
	    self.refresh();
	    self.onChange();
	  });
	  // content
	  args.headers && this.setHeaders(args.headers);
	  args.data && this.setData(args.data);
	}
	
	/**
	 * Set the column headers.
	 * @param {[string]} headers
	 */
	CheckboxTable.prototype.setHeaders = function (headers) {
	  var th = this.headerRow
	    .selectAll('th:not(.checkbox-cell)')
	      .data(headers);
	  th.exit().remove();
	  th.enter().append('th');
	  th.text(identity);
	};
	
	/**
	 * Set the table body data.
	 *
	 * Each row begins with a checkbox whose .value is the first cell.
	 * Rows are keyed by the first cell when updating data.
	 * @param {[[string]]} data
	 * @return this
	 */
	CheckboxTable.prototype.setData = function (data) {
	  var tr = this.tbody.selectAll('tr')
	      .data(data, head);
	  tr.exit().remove();
	  tr.enter()
	    .append('tr')
	  // checkbox at the start of each row
	    .append('td')
	      .attr('class', 'checkbox-cell')
	    .append('input')
	      .attr({
	        type: 'checkbox',
	        value: head
	      });
	  tr.order();
	  // row cells
	  var td = tr.selectAll('td:not(.checkbox-cell)')
	      .data(identity);
	  td.exit().remove();
	  td.enter().append('td');
	  td.text(identity);
	
	  return this;
	};
	
	CheckboxTable.prototype.getCheckboxes = function () {
	  return this.tbody.selectAll('input[type="checkbox"]');
	};
	
	CheckboxTable.prototype.getCheckedValues = function () {
	  return this.tbody.selectAll('input[type="checkbox"]:checked')[0]
	    .map(function (x) { return x.value; });
	};
	
	CheckboxTable.prototype.isCheckedEmpty = function () {
	  var headerBox = this.headerCheckbox.node();
	  return !(headerBox.checked || headerBox.indeterminate);
	};
	
	/**
	 * Refresh the header checkbox (called after a row checkbox is toggled).
	 */
	CheckboxTable.prototype.refresh = function () {
	  var headerBox = this.headerCheckbox.node();
	  var boxes = this.getCheckboxes();
	
	  var total = boxes.size();
	  var checked = boxes.filter(':checked').size();
	  if (checked === 0) {
	    headerBox.checked = false;
	  } else if (checked === total) {
	    headerBox.checked = true;
	  }
	  headerBox.indeterminate = (0 < checked && checked < total);
	};
	
	// configurable. called after a click toggles a row or header checkbox.
	CheckboxTable.prototype.onChange = function () {
	};
	
	module.exports = CheckboxTable;


/***/ }),
/* 45 */
/*!******************************************!*\
  !*** ./src/sharing/FileReaderPromise.js ***!
  \******************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* global FileReader:false */
	var Promise = __webpack_require__(/*! bluebird */ 46); // eslint-disable-line no-shadow
	
	// arguments are forwarded to FileReader.readAsText
	// (Blob, ?encoding) -> Promise
	function readAsText() {
	  var args = arguments;
	  return new Promise(function (resolve, reject, onCancel) {
	    var reader = new FileReader();
	    reader.addEventListener('load', function () {
	      resolve(reader.result);
	    });
	    reader.addEventListener('error', function () {
	      reject(reader.error);
	    });
	    onCancel && onCancel(function () {
	      try { reader.abort(); } catch (e) {/* */}
	    });
	
	    reader.readAsText.apply(reader, args);
	  });
	}
	
	exports.readAsText = readAsText;


/***/ }),
/* 46 */
/*!**************************!*\
  !*** external "Promise" ***!
  \**************************/
/***/ (function(module, exports) {

	module.exports = Promise;

/***/ }),
/* 47 */
/*!*****************************!*\
  !*** ./src/sharing/gist.js ***!
  \*****************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var $ = __webpack_require__(/*! jquery */ 42);
	var Promise = __webpack_require__(/*! bluebird */ 46); // eslint-disable-line no-shadow
	
	Promise.config({
	  cancellation: true
	});
	
	// On success, 'resolve' is called with the response data.
	// On failure, 'reject' is called with {xhr: jqXHR, status: string, error: string}.
	// To abort the request, use .cancel (from bluebird). Neither is called in that case.
	// jqXHR -> Promise
	function promisifyAjax(xhr) {
	  return new Promise(function (resolve, reject, onCancel) {
	    xhr.then(resolve, function (jqXHR, textStatus, errorThrown) {
	      reject({xhr: jqXHR, status: textStatus, error: errorThrown});
	    });
	    onCancel && onCancel(function () {
	      try { xhr.abort(); } catch (e) {/* */}
	    });
	  });
	}
	
	// GistID -> Promise
	// @see promisifyAjax
	function getGist(gistID) {
	  return promisifyAjax($.ajax({
	    url: 'https://api.github.com/gists/' + gistID,
	    type: 'GET',
	    dataType: 'json',
	    accepts: 'application/vnd.github.v3+json' // specify API version for stability
	  }));
	}
	
	// https://developer.github.com/v3/gists/#create-a-gist
	// @see promisifyAjax
	// {files: {[filename: string]: {content: string}},
	//  description?: string, public?: boolean} -> Promise
	function createGist(payload) {
	  // return Promise.delay(1000, {id: 'offlinetesting'});
	  return promisifyAjax($.ajax({
	    url: 'https://api.github.com/gists',
	    type: 'POST',
	    data: JSON.stringify(payload),
	    // headers: {Authorization: 'token DEVTOKEN'},
	    dataType: 'json', // response datatype
	    accepts: 'application/vnd.github.v3+json' // specify API version for stability
	  }));
	}
	
	exports.getGist = getGist;
	exports.createGist = createGist;


/***/ }),
/* 48 */
/*!*************************************!*\
  !*** ./src/sharing/import-panel.js ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* global document: false */
	var docimport = __webpack_require__(/*! ./import */ 43);
	var format = __webpack_require__(/*! ./format */ 24);
	var _ = __webpack_require__(/*! lodash/fp */ 5);
	var d3 = __webpack_require__(/*! d3 */ 6);
	
	// Init the import panel and attach event handlers
	// {$dialog: jQuery, gistIDForm: HTMLFormElement, importArgs: Object} -> void
	function init(args) {
	  var $dialog = args.$dialog,
	      gistIDForm = args.gistIDForm,
	      importArgs = args.importArgs;
	
	  function hideDialog() {
	    $dialog.modal('hide');
	    // Workaround needed for opening another modal before a modal is done hiding.
	    // Without this, the <body> scrolls instead of the modal:
	    // modal2.show locks body scroll => modal1.hidden unlocks body scroll
	    // while modal2 is still open.
	    var nextDialog = importArgs.dialogNode;
	    $dialog.one('hidden.bs.modal', function () {
	      if (nextDialog.classList.contains('in')) {
	        document.body.classList.add('modal-open');
	      }
	    });
	  }
	
	  // Panel: From GitHub gist
	  gistIDForm.addEventListener('submit', function (e) {
	    e.preventDefault();
	    hideDialog();
	
	    var gistID = gistIDForm.querySelector('input[type="text"]').value;
	    docimport.importGist(_.assign({gistID: gistID}, importArgs));
	  });
	
	  // Panel: From files
	  (function () {
	    // TODO: factor out element IDs and containers into interface
	    var panelBody = document.querySelector('#importFilesPanel > .panel-body');
	    // <input type="file">
	    var fileInput = panelBody.querySelector('input[type="file"]');
	    var importFilesButton = document.getElementById('importFilesButton');
	    importFilesButton.addEventListener('click', function () {
	      hideDialog();
	      docimport.importLocalFiles(_.assign({files: fileInput.files}, importArgs));
	    });
	    // <textarea>
	    var textarea = panelBody.querySelector('textarea');
	    var importContentsButton = document.getElementById('importContentsButton');
	    importContentsButton.parentNode.style.position = 'relative';
	    importContentsButton.addEventListener('click', function (e) {
	      if (importDocumentContents(
	        { containers: {status: e.target.parentNode, details: panelBody },
	          importDocument: importArgs.importDocument },
	        textarea.value
	      )) {
	        textarea.select();
	      }
	    });
	  }());
	}
	
	///////////////////////////////
	// Import from pasted string //
	///////////////////////////////
	
	// () -> HTMLButtonElement
	function createCloseIcon() {
	  return d3.select(document.createElement('button'))
	      .attr({class: 'close', 'aria-label': 'Close'})
	      .html('<span aria-hidden="true">&times;</span>')
	    .node();
	}
	
	// Show import outcome (success/failure) and error (if any)
	// ({status: HTMLElement, details: HTMLElement}, ?Error) -> void
	function showImportContentOutcome(containers, error) {
	  var statusContainer = d3.select(containers.status),
	      detailsContainer = d3.select(containers.details);
	  statusContainer.selectAll('[role="alert"]').remove();
	  detailsContainer.selectAll('.alert').remove();
	  var status = statusContainer.append('span')
	      .attr({role: 'alert'})
	      .style({
	        position: 'absolute', left: 0, width: '40%', // center between left and button
	        top: '50%', transform: 'translateY(-60%)' // center vertically
	      });
	
	  // () -> string
	  function showErrorDetails() {
	    var details = detailsContainer.append('div')
	        .attr({role: 'alert', class: 'alert alert-danger'})
	        .style('margin-top', '1em');
	    details.append(createCloseIcon)
	        .attr('data-dismiss', 'alert')
	        .on('click', function () {
	          status.remove(); // dismiss details => also dismiss status
	        });
	    if (error instanceof format.YAMLException) {
	      details.append('h4').text('Not valid YAML'); // only ".alert h4" has margin-top: 0
	      details.append('pre').text(error.message);
	    } else if (error instanceof format.InvalidDocumentError) {
	      details.append('span')
	          .text(error.message.replace(/\.?$/, '.')); // add period if missing
	    } else {
	      details.append('h4').text('Unexpected error');
	      details.append('pre').text(String(error));
	      return 'Import failed';
	    }
	    return 'Not a valid document';
	  }
	
	  if (error) {
	    var statusSummary = showErrorDetails();
	    status.attr({class: 'text-danger'})
	        .html('<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> '
	                + statusSummary);
	  } else {
	    status.attr({class: 'text-success'})
	        .html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> '
	                + 'Import succeeded')
	      .transition()
	        .delay(2500)
	        .duration(2000)
	        .style('opacity', 0)
	        .remove();
	  }
	}
	
	// returns true if import succeeded
	function importDocumentContents(opts, content) {
	  var containers = opts.containers,
	      importDocument = opts.importDocument;
	
	  var error = (function () {
	    try {
	      importDocument(format.parseDocument(content));
	    } catch (e) {
	      return e;
	    }
	  }());
	  showImportContentOutcome(containers, error);
	  return (error == null);
	}
	
	exports.init = init;


/***/ }),
/* 49 */
/*!*************************************!*\
  !*** ./src/sharing/export-panel.js ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	/* eslint-env browser */
	var format = __webpack_require__(/*! ./format */ 24);
	var createGist = __webpack_require__(/*! ./gist */ 47).createGist;
	var Clipboard = __webpack_require__(/*! clipboard */ 50);
	var $ = __webpack_require__(/*! jquery */ 42); // for bootstrap tooltip
	
	// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/a/download.js
	var canUseDownloadAttribute =
	  !window.externalHost && 'download' in document.createElement('a');
	
	// can copy to clipboard programmatically?
	var canUseCopyCommand = (function () {
	  try {
	    return document.queryCommandSupported('copy');
	  } catch (e) {
	    return false;
	  }
	}());
	
	// Add event handlers to select an HTMLInputElement's text on focus.
	function addSelectOnFocus(element) {
	  element.addEventListener('focus', function selectAll(e) {
	    e.target.select();
	  });
	  // Safari workaround
	  element.addEventListener('mouseup', function (e) {
	    e.preventDefault();
	  });
	}
	
	// Show a one-time tooltip.
	// NB. an existing title attribute overrides the tooltip options.
	function showTransientTooltip($element, options) {
	  $element.tooltip(options)
	    .tooltip('show')
	    .one('hidden.bs.tooltip', function () {
	      $element.tooltip('destroy');
	    });
	}
	
	function showCopiedTooltip(element) {
	  showTransientTooltip($(element), {title: 'Copied!', placement: 'bottom'});
	}
	
	
	///////////////////////
	// Share with GitHub //
	///////////////////////
	
	/**
	 * Generate a new gist and display a shareable link.
	 * @param  {HTMLElement} container  Container to use for displaying the link.
	 * @param  {HTMLButtonElement} button
	 * @param  {string} filename
	 * @param  {string} contents  The file contents.
	 * @return {Promise}          Cancellable promise to create the gist.
	 */
	function generateGist(container, button, filename, contents) {
	  var oldButtonText = button.textContent;
	  button.textContent = 'Loading…';
	  button.disabled = true;
	
	  var payload = {
	    files: {},
	    description: 'Turing machine for http://turingmachine.io',
	    public: true
	  };
	  payload.files[filename] = {content: contents};
	
	  return createGist(payload).then(function (response) {
	    // Show link on success
	    var id = response.id;
	    showGeneratedGist(container, 'http://turingmachine.io/?import-gist=' + id);
	  }).catch(function (reason) {
	    // Alert error on failure
	    var message = (function () {
	      var xhr = reason.xhr;
	      try {
	        return 'Response from GitHub: “' + xhr.responseJSON.message + '”';
	      } catch (e) {
	        if (xhr.status > 0) {
	          return 'HTTP status code: ' + xhr.status + ' ' + xhr.statusText;
	        } else {
	          return 'GitHub could not be reached.\nYour Internet connection may be offline.';
	        }
	      }
	    }());
	    alert('Could not create new gist.\n\n' + message);
	
	    button.disabled = false;
	    button.textContent = oldButtonText;
	  });
	}
	
	function showGeneratedGist(container, url) {
	  container.innerHTML =
	    '<input id="sharedPermalink" type="url" class="form-control" readonly>' +
	    '<button type="button" class="btn btn-default" data-clipboard-target="#sharedPermalink">' +
	    '<span class="glyphicon glyphicon-copy" aria-hidden="true"></span>' +
	    '</button>';
	  var urlInput = container.querySelector('input');
	  urlInput.value = url;
	  urlInput.size = url.length + 2;
	  addSelectOnFocus(urlInput);
	  urlInput.focus();
	}
	
	function createGenerateGistButton(container) {
	  container.innerHTML =
	  '<button type="button" class="btn btn-default">Create permalink</button>' +
	  '<p class="help-block">This will create and link to a new' +
	    ' <a href="https://help.github.com/articles/creating-gists/#creating-an-anonymous-gist"' +
	    ' target="_blank">read-only</a> GitHub gist.' +
	  '</p>';
	  return container.querySelector('button');
	}
	
	
	///////////////////
	// Download file //
	///////////////////
	
	// Create a link button if canUseDownloadAttribute, otherwise a link with instructions.
	function createDownloadLink(filename, contents) {
	  var link = document.createElement('a');
	  link.href = 'data:text/x-yaml;charset=utf-8,' + encodeURIComponent(contents);
	  link.target = '_blank';
	  link.download = filename;
	
	  if (canUseDownloadAttribute) {
	    link.textContent = 'Download document';
	    link.className = 'btn btn-primary';
	    return link;
	  } else {
	    link.textContent = 'Right-click here and choose “Save target as…” or “Download Linked File As…”';
	    var p = document.createElement('p');
	    p.innerHTML = ', <br>then name the file to end with <code>.yaml</code>';
	    p.insertBefore(link, p.firstChild);
	    return p;
	  }
	}
	
	
	////////////
	// Common //
	////////////
	
	function init(args) {
	  var $dialog = args.$dialog,
	      getCurrentDocument = args.getCurrentDocument,
	      getIsSynced = args.getIsSynced,
	      gistContainer = args.gistContainer,
	      downloadContainer = args.downloadContainer,
	      textarea = args.textarea;
	
	  if (canUseDownloadAttribute) {
	    $dialog.addClass('download-attr');
	  }
	  if (!canUseCopyCommand) {
	    $dialog.addClass('no-copycommand');
	  }
	  gistContainer.className = 'form-group form-inline';
	  addSelectOnFocus(textarea);
	
	  function setupDialog() {
	    var doc = getCurrentDocument();
	    var filename = doc.name + '.yaml';
	    var contents = format.stringifyDocument(doc);
	    var gistPromise;
	
	    // warn about unsynced changes
	    var $alert;
	    if (!getIsSynced()) {
	      $alert = $(
	        '<div class="alert alert-warning" role="alert">' +
	        'The code editor has <strong>unsynced changes</strong> and might not correspond with the diagram.<br>' +
	        'Click <q>Load machine</q> to try to sync them. Otherwise, two sets of code will be exported.' +
	        '</div>'
	      ).prependTo($dialog.find('.modal-body'));
	    }
	
	    createGenerateGistButton(gistContainer).addEventListener('click', function (e) {
	      gistPromise = generateGist(gistContainer, e.target, filename, contents);
	    });
	
	    // "Download document" button link
	    downloadContainer.appendChild(createDownloadLink(filename, contents));
	    // <textarea> for document contents
	    textarea.value = contents;
	
	    var clipboard = new Clipboard('[data-clipboard-target]');
	    clipboard.on('success', function (e) {
	      showCopiedTooltip(e.trigger);
	      e.clearSelection();
	    });
	
	    // return cleanup function
	    return function () {
	      if (gistPromise) {
	        try { gistPromise.cancel(); } catch (e) {/* */}
	      }
	      if ($alert) { $alert.remove(); }
	      gistContainer.textContent = '';
	      downloadContainer.textContent = '';
	      textarea.value = '';
	      clipboard.destroy();
	    };
	  }
	
	  $dialog.on('show.bs.modal', function () {
	    var cleanup = setupDialog();
	    $dialog.one('hidden.bs.modal', cleanup);
	  });
	  $dialog.on('shown.bs.modal', function () {
	    // workaround "Copy to clipboard" .focus() scrolling down to <textarea>
	    // note: doesn't work when <textarea> is completely out of view
	    textarea.setSelectionRange(0,0);
	  });
	}
	
	exports.init = init;


/***/ }),
/* 50 */
/*!****************************!*\
  !*** external "Clipboard" ***!
  \****************************/
/***/ (function(module, exports) {

	module.exports = Clipboard;

/***/ }),
/* 51 */
/*!*****************************!*\
  !*** ./src/kbdshortcuts.js ***!
  \*****************************/
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	/**
	 * Displays a table of keyboard shortcuts.
	 */
	
	var d3 = __webpack_require__(/*! d3 */ 6);
	
	function identity(x) { return x; }
	
	/**
	 * Renders a table, using three layers of list nesting: tbody, tr, td.
	 * @param  {[ [[HTML]] ]}     data
	 * @param  {HTMLTableElement} table
	 * @return {D3Selection}            D3 selection of the <tbody> elements
	 */
	function renderTable(data, table) {
	  var tbody = d3.select(table).selectAll('tbody')
	      .data(data)
	    .enter().append('tbody');
	
	  var tr = tbody.selectAll('tr')
	      .data(identity)
	    .enter().append('tr');
	
	  tr.selectAll('td')
	      .data(identity)
	    .enter().append('td')
	      .html(identity);
	
	  return tbody;
	}
	
	
	// type Key = string;
	// type KeyList = [Key];
	
	// Key -> Key
	function abbreviateKey(key) {
	  switch (key) {
	    case 'Command': return 'Cmd';
	    case 'Option':  return 'Opt';
	    case 'Up':      return '↑';
	    case 'Down':    return '↓';
	    case 'Left':    return '←';
	    case 'Right':   return '→';
	    default:        return key;
	  }
	}
	
	// KeyList -> HTML
	function keylistToHTML(keys) {
	  return keys.map(function (key) {
	    return '<kbd>' + key + '</kbd>';
	  }).join('-');
	}
	
	// Commands -> String -> KeyList
	function createGetKeylist(commands) {
	  var platform = commands.platform;
	  // workaround: some ace keybindings for Mac use Alt instead of Option
	  var altToOption = platform !== 'mac' ? identity : function (key) {
	    return (key === 'Alt') ? 'Option' : key;
	  };
	
	  return function getKeylist(name) {
	    return commands.commands[name].bindKey[platform].split('-').map(altToOption);
	  };
	}
	
	
	// Fills a <table> with some default keyboard shortcuts.
	function main(commands, table) {
	  var getKeylist = createGetKeylist(commands);
	
	  return renderTable(entries.map(function (group) {
	    return group.map(function (d) {
	      return [
	        keylistToHTML(getKeylist(d.name).map(abbreviateKey)),
	        d.desc
	      ];
	    });
	  }), table);
	}
	
	var entries = [
	  [
	    { name: 'save', desc: 'Load machine<br> <small>Save changes and load the machine.</small>' }
	  ], [
	    { name: 'togglecomment', desc: 'Toggle comment' },
	    { name: 'indent', desc: 'Indent selection' },
	    { name: 'outdent', desc: 'Unindent selection' }
	  ], [
	    { name: 'movelinesup', desc: 'Move line up' },
	    { name: 'movelinesdown', desc: 'Move line down' },
	    { name: 'duplicateSelection', desc: 'Duplicate line/selection' }
	  ], [
	    { name: 'selectMoreAfter', desc: 'Add next occurrence to selection<br> <small>Like a quick “find”. Useful for renaming things.</small>' },
	    { name: 'find', desc: 'Find' },
	    { name: 'replace', desc: 'Find and Replace' }
	  ]
	];
	
	
	exports.main = main;


/***/ })
]);
//# sourceMappingURL=main.bundle.js.map