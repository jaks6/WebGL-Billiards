/*******************************************************************************
 * Copyright (C) 2015, Markus Sprunck All rights reserved. Redistribution and
 * use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met: - Redistributions of source
 * code must retain the above copyright notice, this list of conditions and the
 * following disclaimer. - Redistributions in binary form must reproduce the
 * above copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the distribution. -
 * The name of its contributor may be used to endorse or promote products
 * derived from this software without specific prior written permission. THIS
 * SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

"use strict";

/**
 * Simple rendering with pure WebGL based on three.js without any other 3rd
 * party library. The look & feel should be like in the Chrome Experiment
 * DAT.GUI with some minor improvements. This is an early development stage, so
 * some features are missing.
 */
THREE.SimpleDatGui = function(parameters) {
	
	console.log('THREE.SimpleDatGui 11');
	
	// Assign mandatory parameter
	if ((typeof parameters === "undefined")
	    || (typeof parameters.scene === "undefined")) {
		console.err("THREE.SimpleDatGui - missing parameter scene");
	}
	if ((typeof parameters.camera === "undefined")) {
		console.err("THREE.SimpleDatGui - missing parameter camera");
	}
	if ("PerspectiveCamera" !== parameters.camera.type) {
		console.warn("THREE.SimpleDatGui - non perspective camera supported");
	}
	if ((typeof parameters.renderer === "undefined")) {
		console.err("THREE.SimpleDatGui - missing parameter renderer");
	}
	this.scene = parameters.scene;
	this.camera = parameters.camera;
	this.renderer = parameters.renderer;
	
	// Assign optional parameter
	this.width = (parameters.width !== undefined) ? parameters.width
	    * parameters.scale : 300;
	this.position = (parameters.position !== undefined) ? parameters.position : new THREE.Vector3(-150, 100, 150);
	this.rotation = (parameters.rotation !== undefined) ? parameters.rotation : new THREE.Vector3(0, 0, 0);
	this.scale = (parameters.scale !== undefined) ? parameters.scale : 1;
	this.automatic = (parameters.automatic !== undefined) ? parameters.automatic : false;
	this.mouse = (parameters.mouse !== undefined) ? parameters.mouse : null;
	
	// For internal use only
	this._options = this.getOptions();
	this._private = new THREE.SimpleDatGui.__internals(this);
};

/**
 * Same method as in DAT.GUI
 */
THREE.SimpleDatGui.prototype.addFolder = function(name) {
	
	var result = new THREE.SimpleDatGuiControl(null, name, 0, 0, this, false, false, this._options);
	this._private.children.push(result);
	return result;
}

/**
 * Same method as in DAT.GUI
 */
THREE.SimpleDatGui.prototype.setPosition = function(position) {
	
	this.rotation = position;
	
}

THREE.SimpleDatGui.prototype.setAutomatic = function(automatic) {
	
	this.automatic = automatic;
}

/**
 * Same method as in DAT.GUI
 */
THREE.SimpleDatGui.prototype.add = function(object, property, minValue, maxValue) {
	
	var result = new THREE.SimpleDatGuiControl(object, property, minValue, maxValue, this, false, true, this._options);
	this._private.children.push(result);
	return result;
}

/**
 * Same method as in DAT.GUI
 */
THREE.SimpleDatGui.prototype.close = function() {
	
	this._private.closed = true;
	return this;
}

/**
 * Difference to DAT.GUI - hide gui
 */
THREE.SimpleDatGui.prototype.hide = function() {
	
	this._private.hidden = true;
	return this;
}

/**
 * Difference to DAT.GUI - hide gui
 */
THREE.SimpleDatGui.prototype.isHidden = function() {
	
	return this._private.hidden;
}

/**
 * Difference to DAT.GUI - show gui
 */
THREE.SimpleDatGui.prototype.show = function() {
	
	this._private.hidden = false;
	return this;
}

/**
 * Difference to DAT.GUI - Because all the rendering is done in the scene this
 * method should be called before the rendering. In this function for each
 * element there happens the update of visibility, color and sensitivity to
 * mouse events.
 */
THREE.SimpleDatGui.prototype.update = function(parameters) {
	
	// This can be used in cases the window resizes
	if (parameters !== undefined
	    && parameters.position !== undefined) {
		this.position = parameters.position;
		this._options.POSITION = this.position;
	}
	
	// UPDATE RENDERING OF ALL CONTROLS
	var that = this;
	var indexOfVisibleControls = -1;
	this._private.children.forEach(function(child) {
		if (!child.isElementHidden) {
			indexOfVisibleControls++;
		}
		child.updateRendering(indexOfVisibleControls, that._private.isClosed()
		    || that._private.hidden);
		
		child._private.children.forEach(function(element) {
			if (!element.isElementHidden) {
				indexOfVisibleControls++;
			}
			element.updateRendering(indexOfVisibleControls, that._private.isClosed()
			    || that._private.hidden);
		});
	});
	
	// JUST VISIBLE CONTROLS INTERACT WITH MOUSE
	var that = this;
	this._private.mouseBindings = [];
	
	if (!this._private.isClosed()
	    && !that._private.hidden) {
		this._private.children.forEach(function(child) {
			
			// ALL CONTROLS
			child._private.children.forEach(function(element) {
				if (!element.isElementHidden) {
					if (element.isComboBoxControl()) {
						for (var i = 0; i < element.wComboBoxListFields.length; i++) {
							that._private.mouseBindings.push(element.wComboBoxListFields[i]);
						}
						that._private.mouseBindings.push(element.wComboBoxTextField);
					}
					else if (element.isPropertyNumber()) {
						that._private.mouseBindings.push(element.wValueSliderField);
						that._private.mouseBindings.push(element.wValueTextField);
					}
					else {
						that._private.mouseBindings.push(element.wArea);
					}
				}
			});
			
			// ALL VISIBLE FOLDER
			if (!child.isElementHidden) {
				if (child.isComboBoxControl()) {
					for (var i = 0; i < child.wComboBoxListFields.length; i++) {
						that._private.mouseBindings.push(child.wComboBoxListFields[i]);
					}
					that._private.mouseBindings.push(child.wComboBoxTextField);
				}
				else if (!that.isElementFolder
				    && child.isPropertyNumber()) {
					that._private.mouseBindings.push(child.wValueSliderField);
					that._private.mouseBindings.push(child.wValueTextField);
				}
				else {
					that._private.mouseBindings.push(child.wArea);
				}
			}
		});
	}
};

/**
 * Difference to DAT.GUI - the opacity makes the complete interface transparent.
 * This is just an optional feature which is helpful in some situations.
 */
THREE.SimpleDatGui.prototype.setOpacity = function(opacity) {
	
	this._private.opacityGui = Math.max(20, Math.min(100, opacity));
	return this;
}

/**
 * Internal implementation may change - please don't access directly
 */
THREE.SimpleDatGui.__internals = function(gui) {
	
	this.gui = gui;
	
	var that = this;
	
	// Status
	this.hidden = false;
	this.closed = false;
	this.opacityGui = 100;
	this.shiftPressed = false;
	this.mouseDown = false;
	
	// Active controls
	this.selected = null;
	this.focus = null;
	this.comboBox = null;
	this.children = [];
	this.mouseBindings = [];
	
	// Create all event listeners
	gui.renderer.domElement.addEventListener('mousemove', function(event) {
		if (gui._private.mouseDown) {
			gui._private.handleEventOnScrollBar(event);
		}
		gui._private.onMouseMoveEvt(event);
	}.bind(gui));
	
	gui.renderer.domElement.addEventListener('mousedown', function(event) {
		gui._private.mouseDown = true;
		gui._private.onMouseDownEvt(event);
	}.bind(gui));
	
	gui.renderer.domElement.addEventListener('mouseup', function(event) {
		gui._private.mouseDown = false;
	}.bind(gui));
	
	window.addEventListener('keypress', function(event) {
		gui._private.onKeyPressEvt(event);
	}.bind(gui));
	
	window.addEventListener('keyup', function(event) {
		if (this._private.isKeyShift(that.getCharacterCode(event))) {
			that.shiftPressed = false;
		}
	}.bind(gui));
	
	window.addEventListener('keydown', function(event) {
		if (this._private.isKeyShift(that.getCharacterCode(event))) {
			that.shiftPressed = true;
		}
		gui._private.onKeyDownEvt(event);
	}.bind(gui));
};

THREE.SimpleDatGui.prototype.getOptions = function() {
	
	var scale = this.scale;
	var area_size = new THREE.Vector3(this.width, 20 * scale, 2.0 * scale);
	var delta_z = 0.3 * scale;
	var delta_z_order = 0.4 * scale;
	var font_size = 8 * scale;
	var rightBorder = 4 * scale;
	var text_offset_x = 2 * scale;
	var text_field_size = new THREE.Vector3(0.6
	    * area_size.x - rightBorder, 14 * scale, delta_z);
	var valueFiledSize = new THREE.Vector3(0.2 * area_size.x, 14 * scale, delta_z);
	var labelTab1 = new THREE.Vector3(0.4 * area_size.x, 20 * scale, delta_z);
	var labelTab2 = new THREE.Vector3(area_size.x
	    - rightBorder - valueFiledSize.x, 20 * scale, delta_z);
	var slider_field_size = new THREE.Vector3(labelTab2.x
	    - labelTab1.x - rightBorder, 14 * scale, delta_z);
	var marker_size = new THREE.Vector3(3 * scale, area_size.y, area_size.z);
	var checkbox_filed_size = new THREE.Vector3(10 * scale, 10 * scale, delta_z);
	var matrial = {
		transparent : true
	};
	var font_param = {
		size : font_size
	};
	var quaternion = new THREE.Quaternion();
	var euler = new THREE.Euler();
	euler.set(this.rotation.x, this.rotation.y, this.rotation.z, 'YXZ');
	quaternion.setFromEuler(euler);
	
	return {
	    SCALE : scale,
	    AREA : area_size,
	    CHECKBOX : checkbox_filed_size,
	    DELTA_Z : delta_z,
	    DELTA_Z_ORDER : delta_z_order,
	    FONT : font_size,
	    MARKER : marker_size,
	    NUMBER : valueFiledSize,
	    OFFSET_X : text_offset_x,
	    POSITION : this.position,
	    ROTATION : this.rotation,
	    QUATERION : quaternion,
	    RIGHT_BORDER : rightBorder,
	    SLIDER : slider_field_size,
	    TAB_1 : labelTab1,
	    TAB_2 : labelTab2,
	    TEXT : text_field_size,
	    LABEL_OFFSET_Y : 4 * scale,
	    MATERIAL : matrial,
	    FONT_PARAM : font_param,
	    
	    COLOR_VALUE_FIELD : '0x303030',
	    COLOR_CURSOR : '0xFFFF00',
	    COLOR_LABEL : '0xFFFFFF',
	    COLOR_TEXT : '0x1ed36f',
	    COLOR_COMBOBOX_AREA : '0xFFFFFF',
	    COLOR_COMBOBOX_AREA_SELECTED : '0x33FF66',
	    COLOR_COMBOBOX_AREA_SELECTED_FRAME : '0x33FF66',
	    COLOR_COMBOBOX_TEXT : '0x111111',
	    COLOR_COMBOBOX_ARROW : '0x000000',
	    COLOR_BASE_CLOSE_BUTTON : '0x121212',
	    COLOR_SELECTED : '0x010101',
	    COLOR_MARKER_BUTTON : '0xe61d5f',
	    COLOR_MARKER_CHECKBOX : '0x806787',
	    COLOR_MARKER_TEXT : '0x1ed36f',
	    COLOR_MARKER_NUMBER : '0x2fa1d6',
	    COLOR_MARKER_CLOSE_SELECTED : '0x010101',
	    COLOR_MARKER_CLOSE : '0x121212',
	    COLOR_BODER : '0x060606'
	}
}

THREE.SimpleDatGui.__internals.prototype.onMouseMoveEvt = function(event) {
	
	var intersects = this.getIntersectingObjects(event);
	if (null != intersects
	    && intersects.length > 0) {
		
		// Stop other event listeners from receiving this event
		event.stopImmediatePropagation();
		
		var element = intersects[0].object.WebGLElement;
		if (element.isComboBoxControl()
		    && element.isComboBoxExpanded()) {
			if (typeof intersects[0].object.text !== "undefined") {
				element.selectedFieldText = intersects[0].object.text;
			}
			this.comboBox = element;
		}
		else {
			this.gui._private.selected = element;
		}
		
		if (this.gui.mouse == null) {
			if (element.isComboBoxControl()) {
				this.gui.renderer.domElement.style.cursor = "pointer";
			}
			else if (element.isPropertyNumber()
			    && typeof intersects[0].object.isTextValueField === "undefined") {
				this.gui.renderer.domElement.style.cursor = "w-resize";
				this.gui._private.focus = null;
			}
			else if (element.isTextControl()) {
				this.gui.renderer.domElement.style.cursor = "text";
			}
			else {
				this.gui.renderer.domElement.style.cursor = "pointer";
			}
		}
		else {
			if (element.isComboBoxControl()) {
				this.gui.mouse.setMouse("default");
			}
			else if (element.isPropertyNumber()
			    && typeof intersects[0].object.isTextValueField === "undefined") {
				this.gui.mouse.setMouse("w-resize");
			}
			else if (element.isTextControl()) {
				this.gui.mouse.setMouse("text");
			}
			else {
				this.gui.mouse.setMouse("pointer");
			}
		}
	}
	else {
		this.gui._private.selected = null;
		this.activeComboBox = null;
		if (this.gui.mouse == null) {
			this.gui.renderer.domElement.style.cursor = "default";
		}
		else {
			this.gui.mouse.setMouse("default");
		}
	}
}

THREE.SimpleDatGui.__internals.prototype.onMouseDownEvt = function(event) {
	
	if (event.which == 1 /* Left mouse button */) {
		
		var intersects = this.getIntersectingObjects(event);
		if (null != intersects
		    && intersects.length > 0) {
			
			// Stop other event listeners from receiving this event. On iOS this should not be 
			// done, because the keyboard closes
			var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
			if (!iOS) {
				event.stopImmediatePropagation();
			}
			
			// Set focus and selection on this control
			var element = intersects[0].object.WebGLElement;
			this.gui._private.focus = element;
			this.gui._private.selected = element;
			
			if (element.isComboBoxControl()
			    && element.isComboBoxExpanded()) {
				var oldText = element.newText;
				if (element.isAcceptedValues) {
					element.newText = element.selectedFieldText;
					element.object[element.property] = element.newText;
				}
				else {
					var value = element.minValue[element.selectedFieldText];
					element.object[element.property] = value;
					element.newText = element.selectedFieldText;
				}
				this.activeComboBox = null;
				if (typeof element.newText !== "undefined") {
					element.textHelper.calculateLeftAlignText(element.newText);
					element._private.createComboBoxText();
					if (oldText != element.newText) {
						element.executeCallback();
					}
				}
				return;
			}
			
			if (element.isComboBoxControl()) {
				this.activeComboBox = element;
			}
			else if (element.isFunctionControl()) {
				element.executeCallback();
			}
			else if (element.isTextControl()) {
				if (typeof intersects[0].object.sliderType === "undefined") {
					this.setNewCursorFromMouseDownEvt(intersects);
					this.createDummyTextInputToShowKeyboard(event.clientY);
				}
				else {
					this.handleEventOnScrollBar(event);
				}
			}
			else if (element.isCheckBoxControl()) {
				element.object[element.property] = !element.object[this.gui._private.focus.property];
				element.executeCallback();
			}
			else if (element.isElementFolder) {
				element.executeCallback();
			}
		}
	}
}

THREE.SimpleDatGui.__internals.prototype.handleEventOnScrollBar = function(event) {
	var intersects = this.getIntersectingObjects(event);
	if (null != intersects
	    && intersects.length > 0) {
		var element = intersects[0].object.WebGLElement;
		if (typeof element.wValueSliderField !== "undefined"
		    && element.wValueSliderField.sliderType === "field") {
			var deltaX = (Math.pow(Math.pow(intersects[0].point.x
			    + element.wValueSliderField.position.x, 2)
			    + Math.pow(intersects[0].point.y
			        - element.wValueSliderField.position.y, 2) + Math.pow(intersects[0].point.z
			        - element.wValueSliderField.position.z, 2), 0.5))
			    / this.gui._options.SLIDER.x;
			
			var numberOfSteps = (element.maxValue - element.minValue)
			    / element.step;
			deltaX *= numberOfSteps;
			deltaX -= deltaX % 1;
			
			element.object[element.property] = element.minValue
			    + element.step * deltaX;
			element.executeCallback();
			this.gui._private.focus = null;
		}
	}
}

/**
 * Insert new character at cursor position
 */
THREE.SimpleDatGui.__internals.prototype.onKeyPressEvt = function(event) {
	
	// Don't process the control keys is needed for Firefox
	if (this.isKeyTab(event.keyCode)
	    || this.isKeyEnter(event.keyCode) || this.isKeyPos1(event.keyCode) || this.isKeyEnd(event.keyCode)
	    || this.isKeyLeft(event.keyCode) || this.isKeyRight(event.keyCode) || this.isKeyEnf(event.keyCode)
	    || this.isKeyBackspace(event.keyCode)) {
		return;
	}
	
	// Just in the case the focus is in a text control
	var focus = this.gui._private.focus;
	if (focus !== null
	    && focus.isTextControl()) {
		
		// Insert new character
		var cursor = focus.textHelper.cursor;
		var oldText = focus.newText;
		var oldTextFirst = oldText.substring(0, cursor);
		var oldTextSecond = oldText.substring(cursor, oldText.length);
		var newCharacter = String.fromCharCode(this.getCharacterCode(event));
		focus.newText = oldTextFirst
		    + newCharacter + oldTextSecond;
		
		// Truncate text if needed
		focus.textHelper.cursor = cursor + 1;
		focus.textHelper.calculateAlignTextLastCall(focus.newText);
		
		// Render new text
		focus._private.createTextValue(focus.textHelper.truncated);
	}
}

/**
 * Get and handle state of special keys
 */
THREE.SimpleDatGui.__internals.prototype.onKeyDownEvt = function(event) {
	
	// Just in the case the focus is in a text control
	var focus = this.gui._private.focus;
	if (focus !== null) {
		if (focus.isTextControl()) {
			var charCode = this.getCharacterCode(event);
			if (this.isKeyTab(charCode)
			    || this.isKeyEnter(charCode)) {
				this.acknowledgeInput();
			}
			else if (this.isKeyPos1(charCode)) {
				this.moveCursorToFirstCharacter();
			}
			else if (this.isKeyEnd(charCode)) {
				this.moveCursorToLastCharacter();
			}
			else if (this.isKeyLeft(charCode)) {
				this.moveCursorToPreviousCharacter(event);
			}
			else if (this.isKeyRight(charCode)) {
				this.moveCursorToNextCharacter(event);
			}
			else if (this.isKeyEnf(charCode)) {
				this.deleteNextCharacter();
			}
			else if (this.isKeyBackspace(charCode)) {
				this.deletePreviousCharacter();
				event.preventDefault();
			}
		}
	}
}

/**
 * Ensures compatibility between different browsers, i.e. Chrome, Firefox, IE
 */
THREE.SimpleDatGui.__internals.prototype.getCharacterCode = function(event) {
	
	event = event
	    || window.event;
	var charCode = (typeof event.which == "number") ? event.which : event.keyCode;
	return charCode;
}

THREE.SimpleDatGui.__internals.prototype.isKeyTab = function(code) {
	
	return code === 9;
}

THREE.SimpleDatGui.__internals.prototype.isKeyEnter = function(code) {
	
	return code === 13;
}

THREE.SimpleDatGui.__internals.prototype.isKeyPos1 = function(code) {
	
	return code === 36;
}

THREE.SimpleDatGui.__internals.prototype.isKeyEnd = function(code) {
	
	return code === 35;
}

THREE.SimpleDatGui.__internals.prototype.isKeyLeft = function(code) {
	
	return code === 37;
}

THREE.SimpleDatGui.__internals.prototype.isKeyRight = function(code) {
	
	return code === 39;
}

THREE.SimpleDatGui.__internals.prototype.isKeyEnf = function(code) {
	
	return code === 46;
}

THREE.SimpleDatGui.__internals.prototype.isKeyBackspace = function(code) {
	
	return code === 8;
}

THREE.SimpleDatGui.__internals.prototype.isKeyShift = function(code) {
	
	return code === 16;
}

THREE.SimpleDatGui.__internals.prototype.isClosed = function() {
	
	return this.gui._private.closed;
}

THREE.SimpleDatGui.__internals.prototype.toggleClosed = function() {
	
	this.gui._private.closed = !this.gui._private.closed;
}

THREE.SimpleDatGui.__internals.prototype.acknowledgeInput = function() {
	
	var focus = this.gui._private.focus;
	focus.lastValue = focus.newText;
	
	if (focus.isPropertyNumber()) {
		var value = parseFloat(focus.newText);
		value = Math.min(Math.max(value, focus.minValue), focus.maxValue);
		focus.object[focus.property] = value;
		focus._private.createValueSliderBar(focus.scaling);
	}
	else {
		focus.object[focus.property] = focus.newText;
	}
	
	focus.executeCallback();
	
	// Deactivate focus
	this.gui._private.focus = null;
	
	// Deactivate focus - workaround to hide keyboard on iOS
	document.getElementById('simple_dat_gui_dummy_text_input').blur();
}

THREE.SimpleDatGui.__internals.prototype.moveCursorToFirstCharacter = function() {
	
	var focus = this.gui._private.focus;
	var textHelper = focus.textHelper;
	textHelper.cursor = 0;
	textHelper.start = 0;
	textHelper.calculateLeftAlignText(focus.newText);
	focus._private.createTextValue(focus.textHelper.truncated);
}

THREE.SimpleDatGui.__internals.prototype.moveCursorToLastCharacter = function() {
	
	var focus = this.gui._private.focus;
	var textHelper = focus.textHelper;
	var value = focus.newText;
	textHelper.cursor = value.length;
	textHelper.end = value.length - 1;
	textHelper.calculateAlignTextLastCall(focus.newText);
	focus._private.createTextValue(focus.textHelper.truncated);
}

THREE.SimpleDatGui.__internals.prototype.moveCursorToNextCharacter = function(event) {
	
	var focus = this.gui._private.focus;
	var textHelper = focus.textHelper;
	var value = focus.newText;
	if (textHelper.cursor < value.length) {
		textHelper.cursor += 1;
		if (textHelper.cursor > focus.textHelper.end) {
			textHelper.calculateAlignTextLastCall(focus.newText);
		}
	}
	focus._private.createTextValue(focus.textHelper.truncated);
}

THREE.SimpleDatGui.__internals.prototype.moveCursorToPreviousCharacter = function(event) {
	
	var focus = this.gui._private.focus;
	var textHelper = this.gui._private.focus.textHelper;
	if (textHelper.cursor > 0) {
		textHelper.cursor -= 1;
	}
	if (textHelper.start > textHelper.cursor) {
		if (textHelper.start > 0) {
			textHelper.start--;
		}
		textHelper.calculateAlignTextLastCall(focus.newText);
	}
	focus._private.createTextValue(focus.textHelper.truncated);
}

THREE.SimpleDatGui.__internals.prototype.deletePreviousCharacter = function() {
	
	var focus = this.gui._private.focus;
	var textHelper = focus.textHelper;
	var value = focus.object[focus.property];
	if (textHelper.cursor > 0) {
		var value = focus.newText;
		focus.newText = value.substring(0, textHelper.cursor - 1)
		    + value.substring(textHelper.cursor, value.length);
		textHelper.cursor -= 1;
		textHelper.calculateAlignTextLastCall(focus.newText);
		focus._private.createTextValue(textHelper.truncated);
	}
}

THREE.SimpleDatGui.__internals.prototype.deleteNextCharacter = function() {
	
	var focus = this.gui._private.focus;
	var textHelper = focus.textHelper;
	var value = focus.newText;
	focus.newText = value.substring(0, textHelper.cursor)
	    + value.substring(textHelper.cursor + 1, value.length);
	textHelper.calculateAlignTextLastCall(focus.newText);
	focus._private.createTextValue(focus.textHelper.truncated);
}

/**
 * Workaround to activate keyboard on iOS
 */
THREE.SimpleDatGui.__internals.prototype.createDummyTextInputToShowKeyboard = function(positionY) {
	
	var element = document.getElementById('simple_dat_gui_dummy_text_input');
	if (element == null) {
		var _div = document.createElement("div");
		_div.setAttribute("id", "div_simple_dat_gui_dummy_text_input");
		var _form = document.createElement("form");
		_div.appendChild(_form);
		var _input = document.createElement("input");
		_input.setAttribute("type", "text");
		_input.setAttribute("id", "simple_dat_gui_dummy_text_input");
		_input.setAttribute("style", "opacity: 0; width: 1px; font-size: 0px;");
		_form.appendChild(_input);
		document.body.appendChild(_div);
	}
	document.getElementById('div_simple_dat_gui_dummy_text_input').setAttribute("style", "position: absolute; top: "
	    + positionY + "px; right: 0px;");
	document.getElementById('simple_dat_gui_dummy_text_input').focus();
}

THREE.SimpleDatGui.__internals.prototype.getMousePositon = function(event) {
	
	var domElement = this.gui.renderer.domElement;
	var mouse = {};
	mouse.x = ((event.clientX) / (window.innerWidth - domElement.offsetLeft)) * 2 - 1;
	mouse.y = -((event.clientY - domElement.offsetTop) / (domElement.clientHeight)) * 2 + 1;
	return mouse;
}

THREE.SimpleDatGui.__internals.prototype.getIntersectingObjects = function(event) {
	var domElement = this.gui.renderer.domElement;
	var mouse = {};
	mouse.x = ((event.clientX) / (window.innerWidth - domElement.offsetLeft)) * 2 - 1;
	mouse.y = -((event.clientY - domElement.offsetTop) / (domElement.clientHeight)) * 2 + 1;
	var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
	vector.unproject(this.gui.camera);
	var raycaster = new THREE.Raycaster(this.gui.camera.position, vector.sub(this.gui.camera.position).normalize());
	return raycaster.intersectObjects(this.gui._private.mouseBindings);
}

THREE.SimpleDatGui.__internals.prototype.setNewCursorFromMouseDownEvt = function(intersects) {
	
	var element = intersects[0].object.WebGLElement;
	var focus = this.gui._private.focus;
	var textHelper = element.textHelper;
	var value = focus.newText;
	this.gui._private.selected = element;
	
	var deltaX = Math.pow(Math.pow(intersects[0].point.x
	    + element.textHelper.residiumX - element.wTextValue.position.x, 2)
	    + Math.pow(intersects[0].point.y
	        - element.wTextValue.position.y, 2) + Math.pow(intersects[0].point.z
	        - element.wTextValue.position.z, 2), 0.5);
	if (deltaX > textHelper.possibleCursorPositons[textHelper.possibleCursorPositons.length - 1].x) {
		textHelper.end = value.length - 1;
		textHelper.cursor = value.length;
		textHelper.calculateAlignTextLastCall(value);
	}
	else {
		for (var i = 0; i < textHelper.possibleCursorPositons.length - 1; i++) {
			var minX = textHelper.possibleCursorPositons[i].x;
			var maxX = textHelper.possibleCursorPositons[i + 1].x;
			if (deltaX > minX
			    && deltaX <= maxX) {
				textHelper.cursor = i
				    + textHelper.start;
			}
		}
	}
}

THREE.SimpleDatGuiControl = function(object, property, minValue, maxValue, parent, isCloseButton, isRootControl,
    options) {
	
	// This is used for internal functions
	this._private = new THREE.SimpleDatGuiControl.__internals(this);
	
	var that = this;
	
	// ATTRIBUTES
	this._options = options;
	this.object = object;
	this.property = property;
	this.propertyType = (object != null) ? typeof object[property] : "folder";
	this.label = property;
	this.onChangeCallback = null;
	this.isCloseButton = isCloseButton;
	
	// MANAGE COMBOBOX
	var getKeys = function(obj) {
		var keys = [];
		for ( var key in obj) {
			keys.push(key);
		}
		return keys;
	}
	this.isAcceptedValues = (minValue instanceof Array);
	this.isNamedValues = (typeof minValue === 'object')
	    && !this.isAcceptedValues;
	this.isCombobox = this.isNamedValues
	    || this.isAcceptedValues;
	this.comboBoxList = (this.isNamedValues) ? getKeys(minValue) : minValue;
	this.selectedFieldText = "";
	
	// MANAGE NUMBER INPUT
	this.minValue = minValue | 0.0;
	this.maxValue = maxValue | 1000.0;
	
	// MANAGE TEXT INPUT
	this.textHelper = new THREE.SimpleDatGuiTextHelper(this._options);
	this.newText = "";
	
	// RELATIVES
	this.parent = parent;
	this._private.children = [];
	
	// STATE
	this.isRootControl = isRootControl;
	this.isFolderCollapsed = true;
	this.isElementFolder = this.propertyType === "folder";
	this.isElementHidden = (!this.isRootControl) ? !this.isElementFolder : false;
	this.isOnChangeExisting = false;
	this.scaling = 1.0;
	this.hasFocus = false;
	this.isClosed = false;
	
	// LISTEN WITH A TIMER
	this.updateTimer;
	this.lastValue;
	
	// CREATE NEEDED CONTROLS
	this._private.createArea();
	this._private.createMarker();
	this._private.createLabel(this.label);
	
	if (!this.isCloseButton) {
		this._private.createFrame();
	}
	if (this.isComboBoxControl()) {
		this.object = object;
		this.property = property;
		this.newText = "";
		this.minValue = minValue;
		if (this.isAcceptedValues) {
			this.newText = object[property];
		}
		else {
			for (var index = 0; index < this.comboBoxList.length; index++) {
				var key = this.comboBoxList[index];
				var value = minValue[key];
				if (object[property] === value) {
					this.newText = key;
					break;
				}
			}
		}
		this.selectedFieldText = this.newText;
		this.textHelper.calculateLeftAlignText(this.newText);
		this._private.createComboBoxField();
		this._private.createComboBoxListFields();
		this._private.createComboBoxText();
		this._private.createComboBoxMarker();
		this._private.createComboBoxFrame();
	}
	else if (this.isElementFolder
	    && !this.isCloseButton) {
		this._private.createLabelMarker();
	}
	else if (this.isFunctionControl()) {
		this.onChangeCallback = object[property];
	}
	else if (this.isCheckBoxControl()) {
		this.object = object;
		this.property = property;
		this.minValue = minValue;
		this._private.createCheckBoxes();
	}
	else if (this.isTextControl()) {
		
		this.object = object;
		this.property = property;
		
		if (this.isPropertyNumber()) {
			this.minValue = minValue;
			this.maxValue = maxValue;
			this.newText = ''
			    + object[property];
			this._private.createValueSliderField();
			this.scaling = (object[property] - this.minValue)
			    / (this.maxValue - this.minValue);
			this._private.createValueSliderBar(this.scaling);
			this.selectedFieldText = this.newText;
			this.textHelper.calculateLeftAlignText(this.newText);
			this._private.createTextValue(object[property]);
		}
		else {
			this.newText = object[property];
			this.selectedFieldText = this.newText;
			this.textHelper.calculateLeftAlignText(this.newText);
			this._private.createTextValue(this.newText);
		}
		
		this._private.createValueTextField();
		this._private.createCursor();
	}
	
	this.listenInternal();
}

THREE.SimpleDatGuiControl.__internals = function(control) {
	
	this.control = control;
};

THREE.SimpleDatGuiControl.__internals.prototype.createArea = function() {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometry = new THREE.BoxGeometry($.AREA.x, $.AREA.y, $.AREA.z);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wArea = new THREE.Mesh(_geometry, _material);
	that.wArea.WebGLElement = that;
	that.wArea.updateRendering = function(index) {
		
		var x = $.AREA.x / 2;
		var y = -$.AREA.y
		    / 2 - $.AREA.y * index;
		var z = $.AREA.z / 2;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible()
		    && !that.isClosed;
		if (that.parent._private.selected === that
		    && (that.isCheckBoxControl()
		        || that.isFunctionControl() || that.isElementFolder)) {
			this.material.color.setHex($.COLOR_SELECTED);
		}
		else {
			this.material.color.setHex($.COLOR_BASE_CLOSE_BUTTON);
		}
	};
	that.parent.scene.add(that.wArea);
}

THREE.SimpleDatGuiControl.__internals.prototype.createTextValue = function(value) {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	if (that.isPropertyNumber()) {
		var newValue = (typeof value === "number") ? value : 0;
		var digits = (parseInt(newValue) == newValue) ? 0 : 1;
		value = newValue.toFixed(digits);
		if (value === "NaN") {
			return;
		}
	}
	
	if (typeof that.wTextValue !== "undefined") {
		that.parent.scene.remove(that.wTextValue);
	}
	
	var _fontshapes = THREE.FontUtils.generateShapes(that.textHelper.truncated, $.FONT_PARAM);
	var _geometry = new THREE.ShapeGeometry(_fontshapes);
	that.wTextValue = new THREE.Mesh(_geometry, new THREE.MeshBasicMaterial($.MATERIAL));
	that.wTextValue.updateRendering = function(index) {
		
		if (that.isPropertyNumber()) {
			var x = $.TAB_2.x
			    + that.textHelper.residiumX;
			var y = $.AREA.y
			    * (-0.5 - index) - $.LABEL_OFFSET_Y;
			var z = $.AREA.z
			    + $.DELTA_Z_ORDER * 2;
			internal.rotateAndTranslateElement(this, $, x, y, z);
			this.material.color.setHex(that.parent._private.focus === that ? $.COLOR_LABEL : $.COLOR_MARKER_NUMBER);
		}
		else {
			var x = $.TAB_1.x
			    + that.textHelper.residiumX;
			var y = $.AREA.y
			    * (-0.5 - index) - $.LABEL_OFFSET_Y;
			var z = $.AREA.z
			    + $.DELTA_Z_ORDER * 2;
			internal.rotateAndTranslateElement(this, $, x, y, z);
			this.material.color.setHex(that.parent._private.focus === that ? $.COLOR_LABEL : $.COLOR_TEXT);
		}
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible()
		    && that.isTextControl() && !that.isClosed;
	};
	that.parent.scene.add(that.wTextValue);
}

THREE.SimpleDatGuiControl.__internals.prototype.createValueTextField = function(event) {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var fieldSize = that.isPropertyNumber() ? $.NUMBER : $.TEXT;
	var _geometry = new THREE.BoxGeometry(fieldSize.x, fieldSize.y, fieldSize.z);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wValueTextField = new THREE.Mesh(_geometry, _material);
	that.wValueTextField.visible = false;
	that.wValueTextField.isTextValueField = false;
	that.wValueTextField.WebGLElement = that;
	that.wValueTextField.material.color.setHex($.COLOR_VALUE_FIELD);
	that.wValueTextField.updateRendering = function(index) {
		if (that.isPropertyNumber()) {
			var x = $.TAB_2.x
			    + $.NUMBER.x / 2;
			var y = $.AREA.y
			    * (-0.5 - index);
			var z = $.AREA.z
			    + $.DELTA_Z_ORDER;
			internal.rotateAndTranslateElement(this, $, x, y, z);
		}
		else {
			var x = $.TAB_1.x
			    + $.TEXT.x / 2;
			var y = $.AREA.y
			    * (-0.5 - index);
			var z = $.AREA.z
			    + $.DELTA_Z_ORDER;
			internal.rotateAndTranslateElement(this, $, x, y, z);
		}
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible()
		    && that.isTextControl() && !that.isClosed;
	};
	that.parent.scene.add(that.wValueTextField);
}

THREE.SimpleDatGuiControl.__internals.prototype.createValueSliderField = function() {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometry = new THREE.BoxGeometry($.SLIDER.x, $.SLIDER.y, $.SLIDER.z);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wValueSliderField = new THREE.Mesh(_geometry, _material);
	that.wValueSliderField.sliderType = "field";
	that.wValueSliderField.WebGLElement = that;
	that.wValueSliderField.material.color.setHex($.COLOR_VALUE_FIELD);
	that.wValueSliderField.updateRendering = function(index) {
		var x = $.TAB_1.x
		    + $.SLIDER.x / 2;
		var y = $.AREA.y
		    * (-0.5 - index);
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isTextControl()
		    && that.isPropertyNumber() && that.isVisible() && !that.isClosed;
	};
	that.parent.scene.add(that.wValueSliderField);
}

THREE.SimpleDatGuiControl.__internals.prototype.createValueSliderBar = function(scaling) {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	if (typeof that.wValueSliderBar !== "undefined") {
		that.parent.scene.remove(that.wValueSliderBar);
	}
	
	var _geometry = new THREE.BoxGeometry($.SLIDER.x
	    * scaling, $.SLIDER.y, $.SLIDER.z);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wValueSliderBar = new THREE.Mesh(_geometry, _material);
	that.wValueSliderBar.sliderType = "bar";
	that.wValueSliderBar.WebGLElement = that;
	that.wValueSliderBar.material.color.setHex($.COLOR_MARKER_NUMBER);
	that.wValueSliderBar.updateRendering = function(index) {
		var x = $.TAB_1.x
		    + $.SLIDER.x / 2 - $.SLIDER.x * (1 - that.scaling) / 2;
		var y = $.AREA.y
		    * (-0.5 - index);
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER * 2;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		var isSliderBarNeeded = (that.object[that.property] > that.minValue);
		this.visible = that.isTextControl()
		    && that.isPropertyNumber() && that.isVisible() && isSliderBarNeeded && !that.isClosed;
	};
	that.parent.scene.add(that.wValueSliderBar);
}

THREE.SimpleDatGuiControl.__internals.prototype.createCheckBoxes = function(event) {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	// CREATE CHECKBOX AREA
	var _geometry = new THREE.BoxGeometry($.CHECKBOX.x, $.CHECKBOX.y, $.CHECKBOX.z);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wBoxUnChecked = new THREE.Mesh(_geometry, _material);
	that.wBoxUnChecked.visible = false;
	that.wBoxUnChecked.updateRendering = function(index) {
		var x = $.TAB_1.x
		    + $.CHECKBOX.x / 2;
		var y = $.AREA.y
		    * (-0.5 - index);
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible()
		    && !that.isClosed;
	};
	that.parent.scene.add(that.wBoxUnChecked);
	
	// CREATE CHECKBOX MARKER
	var fontshapes = THREE.FontUtils.generateShapes("X", {
		size : 7 * $.SCALE
	});
	var _geometry = new THREE.ShapeGeometry(fontshapes);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wBoxChecked = new THREE.Mesh(_geometry, _material);
	that.wBoxChecked.visible = false;
	that.wBoxChecked.material.color.setHex($.COLOR_COMBOBOX_TEXT);
	that.wBoxChecked.updateRendering = function(index) {
		var x = $.TAB_1.x
		    + $.CHECKBOX.x / 2 - 3 * $.SCALE;
		var y = $.AREA.y
		    * (-0.5 - index) - 3.5 * $.SCALE;
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER * 3;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible()
		    && that.object[that.property] && !that.isClosed;
	};
	that.parent.scene.add(that.wBoxChecked);
}

THREE.SimpleDatGuiControl.__internals.prototype.createLabel = function(name) {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	if (typeof that.wLabel !== "undefined") {
		that.parent.scene.remove(that.wLabel);
	}
	
	var fontshapes = THREE.FontUtils.generateShapes(name, $.FONT_PARAM);
	var _geometry = new THREE.ShapeGeometry(fontshapes);
	that.wLabel = new THREE.Mesh(_geometry, new THREE.MeshBasicMaterial($.MATERIAL));
	that.wLabel.updateRendering = function(index) {
		var WEBGL_CLOSE_LABEL_OFFSET_X = 30 * $.SCALE;
		var LABEL_OFFSET_X = 10 * $.SCALE;
		var folderOffset = (that.isElementFolder) ? 8 * $.SCALE : 0;
		var x = ((that.isCloseButton) ? ($.AREA.x / 2 - WEBGL_CLOSE_LABEL_OFFSET_X) : (LABEL_OFFSET_X + folderOffset));
		var y = $.AREA.y
		    * (-0.5 - index) - $.LABEL_OFFSET_Y;
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible()
		    && !that.isClosed;
	};
	that.parent.scene.add(that.wLabel);
}

THREE.SimpleDatGuiControl.__internals.prototype.createLabelMarker = function() {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometry = new THREE.Geometry();
	var v1 = new THREE.Vector3(-2
	    * $.SCALE, 2 * $.SCALE, $.MARKER.z);
	var v3 = new THREE.Vector3(2 * $.SCALE, 2 * $.SCALE, $.MARKER.z);
	var v2 = new THREE.Vector3(2 * $.SCALE, -2
	    * $.SCALE, $.MARKER.z);
	_geometry.vertices.push(v1);
	_geometry.vertices.push(v2);
	_geometry.vertices.push(v3);
	_geometry.faces.push(new THREE.Face3(0, 1, 2));
	_geometry.computeFaceNormals();
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wLabelMarker = new THREE.Mesh(_geometry, _material);
	that.wLabelMarker.material.color.setHex($.COLOR_LABEL);
	that.wLabelMarker.updateRendering = function(index) {
		var x = 10 * $.SCALE;
		var y = -$.AREA.y
		    / 2 - $.AREA.y * index;
		var z = $.AREA.z
		    / 2 + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible()
		    && !that.isClosed;
		this.rotation.z += (that.folderIsHidden) ? -Math.PI / 4 * 3 : -Math.PI / 4;
	};
	that.parent.scene.add(that.wLabelMarker);
}

THREE.SimpleDatGuiControl.__internals.prototype.createMarker = function() {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometry = new THREE.BoxGeometry($.MARKER.x, $.MARKER.y, $.MARKER.z);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wMarker = new THREE.Mesh(_geometry, _material);
	
	if (that.isCheckBoxControl()) {
		that.wMarker.material.color.setHex($.COLOR_MARKER_CHECKBOX);
	}
	else if (that.isTextControl()) {
		that.wMarker.material.color.setHex($.COLOR_MARKER_TEXT);
	}
	else if (that.isComboBoxControl()) {
		that.wMarker.material.color.setHex(that.isAcceptedValues ? $.COLOR_MARKER_TEXT : $.COLOR_MARKER_NUMBER);
	}
	else if (that.isPropertyNumber()) {
		that.wMarker.material.color.setHex($.COLOR_MARKER_NUMBER);
	}
	else if (that.isFunctionControl()) {
		that.wMarker.material.color.setHex($.COLOR_MARKER_BUTTON);
	}
	else if (that.isPropertyNumber()) {
		that.wMarker.material.color.setHex($.COLOR_MARKER_NUMBER);
	}
	that.wMarker.updateRendering = function(index) {
		var x = $.MARKER.x
		    / 2 - 0.1 * $.SCALE;
		var y = -$.AREA.y
		    / 2 - $.AREA.y * index;
		var z = $.AREA.z
		    / 2 + $.DELTA_Z_ORDER;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible()
		    && !that.isClosed;
		if (that.isCloseButton) {
			var isSelected = (that.parent._private != null) ? that.parent._private.selected === that : false;
			that.wMarker.material.color.setHex((isSelected) ? $.COLOR_MARKER_CLOSE_SELECTED : $.COLOR_MARKER_CLOSE);
		}
	};
	that.parent.scene.add(that.wMarker);
}

THREE.SimpleDatGuiControl.__internals.prototype.createFrame = function() {
	
	var cubeGeometry2LineGeometry = function(input) {
		
		var _geometry = new THREE.Geometry();
		var vertices = _geometry.vertices;
		for (var i = 0; i < input.faces.length; i += 2) {
			var face1 = input.faces[i];
			var face2 = input.faces[i + 1];
			var c1 = input.vertices[face1.c].clone();
			var a1 = input.vertices[face1.a].clone();
			var a2 = input.vertices[face2.a].clone();
			var b2 = input.vertices[face2.b].clone();
			var c2 = input.vertices[face2.c].clone();
			vertices.push(c1, a1, a2, b2, b2, c2);
		}
		_geometry.computeLineDistances();
		return _geometry;
	}

	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometryBox = new THREE.BoxGeometry($.AREA.x, $.AREA.y, 0.1);
	var _geometry = cubeGeometry2LineGeometry(_geometryBox);
	that.wFrame = new THREE.Line(_geometry, new THREE.LineBasicMaterial($.MATERIAL));
	that.wFrame.material.color.setHex($.COLOR_BODER);
	that.wFrame.updateRendering = function(index) {
		var x = $.AREA.x / 2 - 0.1;
		var y = -$.AREA.y
		    / 2 - $.AREA.y * index;
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER * 2;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible()
		    && !that.isClosed;
	};
	that.parent.scene.add(that.wFrame);
}

THREE.SimpleDatGuiControl.__internals.prototype.createCursor = function() {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometry = new THREE.BoxGeometry(0.5 * $.SCALE, $.TEXT.y * 0.8, 0.1);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wCursor = new THREE.Mesh(_geometry, _material);
	that.wCursor.material.color.setHex($.COLOR_CURSOR);
	that.wCursor.updateRendering = function(index) {
		var possiblePositon = that.textHelper.possibleCursorPositons[that.textHelper.cursor
		    - that.textHelper.start];
		if (typeof possiblePositon !== "undefined") {
			var x = 0;
			if (that.isPropertyNumber()) {
				x = $.TAB_2.x
				    + that.textHelper.residiumX + possiblePositon.x + 0.25 * $.SCALE;
			}
			else {
				x = $.TAB_1.x
				    + that.textHelper.residiumX + possiblePositon.x + 0.25 * $.SCALE;
			}
			var y = $.AREA.y
			    * (-0.5 - index);
			var z = $.AREA.z
			    + $.DELTA_Z_ORDER * 2;
			internal.rotateAndTranslateElement(this, $, x, y, z);
			
			this.material.opacity = that.parent._private.opacityGui * 0.01;
			this.material.visible = that.isVisible()
			    && that.isTextControl() && (that.parent._private.focus === that) && !that.isClosed;
		}
		else {
			that.wCursor.material.visible = false;
		}
	};
	that.parent.scene.add(this.control.wCursor);
}

THREE.SimpleDatGuiControl.__internals.prototype.createComboBoxField = function(event) {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometry = new THREE.BoxGeometry($.TEXT.x, $.TEXT.y, $.TEXT.z);
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	_material.color.setHex($.COLOR_COMBOBOX_AREA);
	that.wComboBoxTextField = new THREE.Mesh(_geometry, _material);
	that.wComboBoxTextField.visible = false;
	that.wComboBoxTextField.WebGLElement = that;
	that.wComboBoxTextField.updateRendering = function(index) {
		var x = $.TAB_1.x
		    + $.TEXT.x / 2;
		var y = $.AREA.y
		    * (-0.5 - index);
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER * 3;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible()
		    && !that.isClosed;
	};
	that.parent.scene.add(that.wComboBoxTextField);
}

THREE.SimpleDatGuiControl.__internals.prototype.createComboBoxListFields = function(event) {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	that.wComboBoxListTexts = [];
	that.wComboBoxListFields = [];
	
	for (var filedIndex = 0; filedIndex < that.comboBoxList.length; filedIndex++) {
		
		var text = that.comboBoxList[filedIndex];
		
		// Background
		var _geometry = new THREE.BoxGeometry($.TEXT.x, $.TEXT.y, $.TEXT.z);
		var _material = new THREE.MeshBasicMaterial($.MATERIAL);
		_material.color.setHex($.COLOR_COMBOBOX_AREA);
		var wComboBoxListField = new THREE.Mesh(_geometry, _material);
		wComboBoxListField.visible = false;
		wComboBoxListField.WebGLElement = that;
		wComboBoxListField.text = text;
		wComboBoxListField.updateRendering = function(index, fIndex) {
			var x = $.TAB_1.x
			    + $.TEXT.x / 2;
			var y = $.AREA.y
			    * (-0.5 - index) - (1 + fIndex) * $.TEXT.y;
			var z = $.AREA.z
			    + $.DELTA_Z_ORDER * (that.isComboBoxExpanded() ? 5 : -1);
			internal.rotateAndTranslateElement(this, $, x, y, z);
			
			this.material.opacity = that.parent._private.opacityGui * 0.01;
			this.visible = that.isVisible()
			    && that.isComboBoxExpanded() && !that.isClosed;
			this.material.color
			    .setHex((that.selectedFieldText === that.comboBoxList[fIndex]) ? $.COLOR_COMBOBOX_AREA_SELECTED
			        : $.COLOR_COMBOBOX_AREA);
		};
		that.parent.scene.add(wComboBoxListField);
		that.wComboBoxListFields.push(wComboBoxListField);
		
		// Text
		var _fontshapes = THREE.FontUtils.generateShapes(text, $.FONT_PARAM);
		var _geometry = new THREE.ShapeGeometry(_fontshapes);
		var wComboBoxTextValue = new THREE.Mesh(_geometry, new THREE.MeshBasicMaterial($.MATERIAL));
		wComboBoxTextValue.material.color.setHex($.COLOR_COMBOBOX_TEXT);
		wComboBoxTextValue.updateRendering = function(index, filedIndex) {
			var x = $.TAB_1.x
			    + that.textHelper.residiumX;
			var y = $.AREA.y
			    * (-0.5 - index) - $.LABEL_OFFSET_Y - (1 + filedIndex) * $.TEXT.y;
			var z = $.AREA.z
			    + $.DELTA_Z_ORDER * (that.isComboBoxExpanded() ? 6 : -1);
			internal.rotateAndTranslateElement(this, $, x, y, z);
			
			this.material.opacity = that.parent._private.opacityGui * 0.01;
			this.visible = that.isVisible()
			    && that.isComboBoxExpanded() && !that.isClosed;
		};
		that.parent.scene.add(wComboBoxTextValue);
		that.wComboBoxListTexts.push(wComboBoxTextValue);
	}
	
}

THREE.SimpleDatGuiControl.__internals.prototype.createComboBoxText = function() {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	if (typeof that.wComboBoxText !== "undefined") {
		that.parent.scene.remove(that.wComboBoxText);
	}
	
	var _fontshapes = THREE.FontUtils.generateShapes(that.textHelper.truncated, $.FONT_PARAM);
	var _geometry = new THREE.ShapeGeometry(_fontshapes);
	that.wComboBoxText = new THREE.Mesh(_geometry, new THREE.MeshBasicMaterial($.MATERIAL));
	that.wComboBoxText.material.color.setHex($.COLOR_COMBOBOX_TEXT);
	that.wComboBoxText.updateRendering = function(index) {
		var x = $.TAB_1.x
		    + that.textHelper.residiumX;
		var y = $.AREA.y
		    * (-0.5 - index) - $.LABEL_OFFSET_Y;
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER * 4;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.visible = that.isVisible()
		    && !that.isClosed;
	};
	that.parent.scene.add(that.wComboBoxText);
}

THREE.SimpleDatGuiControl.__internals.prototype.createComboBoxMarker = function() {
	
	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometry = new THREE.Geometry();
	var v1 = new THREE.Vector3(-2
	    * $.SCALE, 2 * $.SCALE, $.AREA.z / 2);
	var v3 = new THREE.Vector3(2 * $.SCALE, 2 * $.SCALE, $.AREA.z / 2);
	var v2 = new THREE.Vector3(2 * $.SCALE, -2
	    * $.SCALE, $.AREA.z / 2);
	_geometry.vertices.push(v1);
	_geometry.vertices.push(v2);
	_geometry.vertices.push(v3);
	_geometry.faces.push(new THREE.Face3(0, 1, 2));
	_geometry.computeFaceNormals();
	var _material = new THREE.MeshBasicMaterial($.MATERIAL);
	that.wComboBoxMarker = new THREE.Mesh(_geometry, _material);
	that.wComboBoxMarker.material.color.setHex($.COLOR_COMBOBOX_ARROW);
	that.wComboBoxMarker.updateRendering = function(index) {
		var x = $.AREA.x
		    - 12 * $.SCALE;
		var y = -$.AREA.y
		    / 2 - $.AREA.y * index + 2 * $.SCALE;
		var z = $.AREA.z
		    / 2 + $.DELTA_Z_ORDER * 5;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible()
		    && !that.isClosed;
		this.rotation.z += -3
		    * Math.PI / 4;
	};
	that.parent.scene.add(that.wComboBoxMarker);
}

THREE.SimpleDatGuiControl.__internals.prototype.createComboBoxFrame = function() {
	
	var cubeGeometry2LineGeometry = function(input) {
		
		var _geometry = new THREE.Geometry();
		var vertices = _geometry.vertices;
		for (var i = 0; i < input.faces.length; i += 2) {
			var face1 = input.faces[i];
			var face2 = input.faces[i + 1];
			var c1 = input.vertices[face1.c].clone();
			var a1 = input.vertices[face1.a].clone();
			var a2 = input.vertices[face2.a].clone();
			var b2 = input.vertices[face2.b].clone();
			var c2 = input.vertices[face2.c].clone();
			vertices.push(c1, a1, a2, b2, b2, c2);
		}
		_geometry.computeLineDistances();
		return _geometry;
	}

	var internal = this;
	var that = this.control;
	var $ = that._options;
	
	var _geometryBox = new THREE.BoxGeometry($.TEXT.x, $.TEXT.y, 0.2);
	var _geometry = cubeGeometry2LineGeometry(_geometryBox);
	that.wComboBoxFrame = new THREE.Line(_geometry, new THREE.LineBasicMaterial($.MATERIAL));
	that.wComboBoxFrame.material.color.setHex($.COLOR_COMBOBOX_AREA_SELECTED_FRAME);
	that.wComboBoxFrame.updateRendering = function(index) {
		var x = $.TAB_1.x
		    + $.TEXT.x / 2;
		var y = $.AREA.y
		    * (-0.5 - index);
		var z = $.AREA.z
		    + $.DELTA_Z_ORDER * 5;
		internal.rotateAndTranslateElement(this, $, x, y, z);
		
		this.material.opacity = that.parent._private.opacityGui * 0.01;
		this.material.visible = that.isVisible()
		    && !that.isClosed && that.isComboBoxExpanded();
	};
	that.parent.scene.add(that.wComboBoxFrame);
}

THREE.SimpleDatGuiControl.__internals.prototype.rotateAndTranslateElement = function(element, $, x, y, z) {
	
	if (this.control.parent.automatic) {
		element.rotation.x = this.control.parent.camera.rotation._x;
		element.rotation.y = this.control.parent.camera.rotation._y;
		element.rotation.z = this.control.parent.camera.rotation._z;
		
		var vector = new THREE.Vector3($.POSITION.x
		    + x, $.POSITION.y
		    + y, $.POSITION.z
		    + z);
		vector.applyQuaternion($.QUATERION);
		
		element.position.x = vector.x;
		element.position.y = vector.y;
		element.position.z = vector.z;
	}
	else {
		element.rotation.x = $.ROTATION.x;
		element.rotation.y = $.ROTATION.y;
		element.rotation.z = $.ROTATION.z;
		
		element.position.x = $.POSITION.x
		    + x;
		element.position.y = $.POSITION.y
		    + y;
		element.position.z = $.POSITION.z
		    + z;
	}
}

THREE.SimpleDatGuiControl.prototype.updateRendering = function(index, isClosed) {
	
	var quaternion = new THREE.Quaternion();
	var euler = new THREE.Euler();
	euler.set(this.parent.camera.rotation._x, this.parent.camera.rotation._y, this.parent.camera.rotation._z, 'XYZ');
	quaternion.setFromEuler(euler);
	this._options.QUATERION = quaternion;
	
	this.isClosed = this.parent.hidden
	    || isClosed;
	this.wArea.updateRendering(index);
	this.wLabel.updateRendering(index);
	this.wMarker.updateRendering(index);
	
	if (!this.isCloseButton) {
		this.wFrame.updateRendering(index);
	}
	
	if (this.isElementFolder
	    && !this.isCloseButton) {
		this.wLabelMarker.updateRendering(index);
	}
	else if (this.isCheckBoxControl()) {
		this.wBoxChecked.updateRendering(index);
		this.wBoxUnChecked.updateRendering(index);
	}
	else if (this.isComboBoxControl()) {
		this.wComboBoxTextField.updateRendering(index);
		this.wComboBoxText.updateRendering(index);
		this.wComboBoxMarker.updateRendering(index);
		this.wComboBoxFrame.updateRendering(index);
		for (var i = 0; i < this.wComboBoxListFields.length; i++) {
			this.wComboBoxListTexts[i].updateRendering(index, i);
			this.wComboBoxListFields[i].updateRendering(index, i);
		}
	}
	else if (this.isTextControl()) {
		this.wValueTextField.updateRendering(index);
		this.wTextValue.updateRendering(index);
		this.wCursor.updateRendering(index);
		if (this.isPropertyNumber()) {
			this.wValueSliderField.updateRendering(index);
			this.wValueSliderBar.updateRendering(index);
		}
	}
}

THREE.SimpleDatGuiControl.prototype.onChange = function(value) {
	
	this.isOnChangeExisting = true;
	this.onChangeCallback = value;
	return this;
}

THREE.SimpleDatGuiControl.prototype.add = function(object, property, minValue, maxValue) {
	
	var element = new THREE.SimpleDatGuiControl(object, property, minValue, maxValue, this.parent, false, false,
	    this._options);
	this._private.children.push(element);
	return element;
}

THREE.SimpleDatGuiControl.prototype.name = function(value) {
	
	this.label = value;
	this._private.createLabel(this.label);
	return this;
}

THREE.SimpleDatGuiControl.prototype.executeCallback = function(event) {
	
	if (this.isFunctionControl()) {
		this.onChangeCallback(null);
	}
	else if (this.isElementFolder) {
		this.open();
	}
	else if (this.isOnChangeExisting) {
		if (this.isCheckBoxControl()) {
			this.onChangeCallback(this.object[this.property]);
		}
		else if (this.isTextControl()) {
			this.onChangeCallback(this.object[this.property]);
		}
		else if (this.isComboBoxControl()) {
			this.onChangeCallback(this.object[this.property]);
		}
	}
}

THREE.SimpleDatGuiControl.prototype.listen = function() {
	
	// console.warn('The listen method is depricated.');
	return this;
}

THREE.SimpleDatGuiControl.prototype.listenInternal = function() {
	
	var that = this;
	this.updateTimer = setInterval(function() {
		if (that.isTextControl()) {
			if (that.lastValue !== that.object[that.property]) {
				if (that.isPropertyNumber()) {
					var value = that.object[that.property];
					value = Math.min(Math.max(value, that.minValue), that.maxValue);
					var newValue = (typeof value === "number") ? value : 0;
					var digits = (parseInt(newValue) == newValue) ? 0 : 1;
					value = newValue.toFixed(digits);
					if (value === "NaN") {
						that.object[that.property] = (that.minValue + that.maxValue) / 2;
						value = that.object[that.property];
					}
					that.scaling = (value - that.minValue)
					    / (that.maxValue - that.minValue);
					that._private.createValueSliderBar(that.scaling);
					that.newText = ''
					    + value;
				}
				else {
					that.newText = that.object[that.property];
				}
				that.textHelper.calculateAlignTextLastCall(that.newText);
				that._private.createTextValue(that.textHelper.truncated);
			}
			that.lastValue = that.object[that.property];
		}
	}, 500);
	return this;
}

THREE.SimpleDatGuiControl.prototype.step = function(value) {
	
	this.step = value;
	return this;
}

THREE.SimpleDatGuiControl.prototype.open = function() {
	
	if (this.isElementFolder) {
		this.folderIsHidden = !this.folderIsHidden;
		this.updateChildrenHidden();
	}
	return this;
}

THREE.SimpleDatGuiControl.prototype.updateChildrenHidden = function() {
	
	this._private.children.forEach(function(entry) {
		entry.isElementHidden = !entry.isElementHidden;
	});
}

THREE.SimpleDatGuiControl.prototype.isCheckBoxControl = function() {
	
	return this.propertyType === 'boolean';
}

THREE.SimpleDatGuiControl.prototype.isTextControl = function() {
	
	return (this.propertyType === 'number' || this.propertyType === 'string')
	    && !this.isCombobox;
}

THREE.SimpleDatGuiControl.prototype.isComboBoxControl = function() {
	
	return this.isCombobox;
}

THREE.SimpleDatGuiControl.prototype.isPropertyNumber = function() {
	
	return this.propertyType === 'number';
}

THREE.SimpleDatGuiControl.prototype.isFunctionControl = function() {
	
	return this.propertyType === 'function';
}

THREE.SimpleDatGuiControl.prototype.isVisible = function() {
	
	return !this.isElementHidden;
}

THREE.SimpleDatGuiControl.prototype.isComboBoxExpanded = function() {
	
	return this === this.parent._private.activeComboBox;
}

THREE.SimpleDatGuiTextHelper = function(options) {
	
	this._options = options;
	this.start = 0;
	this.end = 0;
	this.cursor = 0;
	this.truncated = false;
	this.residiumX = 0.0;
	this.isLastCallLeft = false;
	this.isTruncated = false;
	this.possibleCursorPositons = [];
}

/**
 * This is a dirty workaround for the not always correct size of characters in
 * the font shapes. Replace all not working characters with similar size
 * characters.
 */
THREE.SimpleDatGuiTextHelper.prototype.createFontShapes = function(value) {
	
	var valueNew = value
	valueNew = valueNew.split(" ").join("]");
	valueNew = valueNew.split('"').join("°");
	valueNew = valueNew.split("%").join("W");
	valueNew = valueNew.split("!").join(",");
	valueNew = valueNew.split(":").join(",");
	valueNew = valueNew.split("|").join("2");
	valueNew = valueNew.split(";").join(",");
	valueNew = valueNew.split("?").join("s");
	valueNew = valueNew.split("ö").join("s");
	valueNew = valueNew.split("ä").join("s");
	valueNew = valueNew.split("ü").join("s");
	valueNew = valueNew.split("ß").join("s");
	valueNew = valueNew.split("i").join("I");
	valueNew = valueNew.split("j").join("l");
	valueNew = valueNew.split("k").join("h");
	return THREE.FontUtils.generateShapes(valueNew, {
		size : this._options.FONT
	});
}

THREE.SimpleDatGuiTextHelper.prototype.calculateRightAlignText = function(value) {
	
	// Start with the complete string
	this.isTruncated = false;
	this.truncated = value;
	this.residiumX = 0;
	this.end = value.length - 1;
	
	var fontshapesAll = this.createFontShapes(value);
	var size = this._options.TEXT.x;
	for (var i = fontshapesAll.length - 1; i > 1; i--) {
		var boundingBox2 = fontshapesAll[i].getBoundingBox();
		var boundingBox1 = fontshapesAll[i - 1].getBoundingBox();
		var charWidth = boundingBox2.maxX
		    - boundingBox1.maxX;
		size -= charWidth;
		if (size < 30
		    && !this.isTruncated) {
			this.isTruncated = true;
			this.start = i - 2;
			this.truncated = value.substring(this.start, this.end + 1);
		}
	}
	
	var fontshapesTruncated = this.createFontShapes(this.truncated);
	if (fontshapesTruncated.length > 0) {
		this.residiumX = this._options.TEXT.x
		    - fontshapesTruncated[fontshapesTruncated.length - 1].getBoundingBox().maxX;
	}
	else {
		this.residiumX = 0;
	}
	
	// ALL CURSOR POSITIONS
	this.possibleCursorPositons = [];
	this.possibleCursorPositons.push({
		x : 0
	});
	for (var i = 0; i < fontshapesTruncated.length; i++) {
		this.possibleCursorPositons.push({
			x : fontshapesTruncated[i].getBoundingBox().maxX
		});
	}
	
	this.isLastCallLeft = false;
	
	return this;
}

THREE.SimpleDatGuiTextHelper.prototype.calculateLeftAlignText = function(value) {
	
	// Start with the complete string
	this.isTruncated = false;
	this.truncated = value;
	this.residiumX = 5;
	this.end = 0;
	
	var fontshapesAll = this.createFontShapes(value);
	for (var i = 0; i < fontshapesAll.length - 1; i++) {
		var boundingBox1 = fontshapesAll[i].getBoundingBox();
		if ((this._options.TEXT.x - boundingBox1.maxX) <= this.residiumX
		    && !this.isTruncated) {
			this.isTruncated = true;
			this.end = i;
			this.truncated = value.substring(this.start, this.end);
		}
	}
	
	// ALL CURSOR POSITIONS
	var fontshapesTruncated = this.createFontShapes(this.truncated);
	this.possibleCursorPositons = [];
	this.possibleCursorPositons.push({
		x : 0
	});
	for (var i = 0; i < fontshapesTruncated.length; i++) {
		this.possibleCursorPositons.push({
			x : fontshapesTruncated[i].getBoundingBox().maxX
		});
	}
	
	this.isLastCallLeft = true;
	
	return this;
}

THREE.SimpleDatGuiTextHelper.prototype.calculateAlignTextLastCall = function(value) {
	
	if (!this.isTruncated) {
		return this.calculateLeftAlignText(value);
	}
	
	if (this.cursor <= this.start) {
		this.isLastCallLeft = true;
	}
	
	if (this.cursor > this.end) {
		this.isLastCallLeft = false;
	}
	
	if (this.isLastCallLeft) {
		return this.calculateLeftAlignText(value);
	}
	else {
		return this.calculateRightAlignText(value);
	}
}
