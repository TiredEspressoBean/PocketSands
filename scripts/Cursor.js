/**
 * Touch and Mouse based events controller
 *
 * These functions provide the set of event based handlers controlling the mouse and touch interactions on the game
 * canvas, ensuring consistent behavior in the circumstances of both mobile and traditional desktop based usage.
 */


const CURSORS = []

/**
 * Helper function to calculate relative coordinates for drawing a stroke on the canvas.
 *
 * @param {number} x1 - First x coordinate of the stroke.
 * @param {number} x2 - Second x coordinate of the stroke.
 * @param {number} y1 - First y coordinate of the stroke.
 * @param {number} y2 - Second y coordinate of the stroke.
 * @param {number} strokeBuffer - Size of the stroke buffer around the stroke.
 *
 * @returns {Object} - An object containing the relative coordinates and translations.
 * @property {number} x_translate - Translation in the x direction.
 * @property {number} y_translate - Translation in the y direction.
 * @property {number} y1_relative - Relative y coordinate of the first point.
 * @property {number} x2_relative - Relative x coordinate of the second point.
 * @property {number} x1_relative - Relative x coordinate of the first point.
 * @property {number} y2_relative - Relative y coordinate of the second point.
 */
function getRelativeCoords(x1, x2, y1, y2, strokeBuffer) {
	const x_translate = x1 - strokeBuffer;
	const y_translate = Math.min(y1, y2) - strokeBuffer;
	const x1_relative = x1 - x_translate;
	const y1_relative = y1 - y_translate;
	const x2_relative = x2 - x_translate;
	const y2_relative = y2 - y_translate;
	return {x_translate, y_translate, x1_relative, y1_relative, x2_relative, y2_relative};
}

/**
 * Transfers the stroke from the offscreen canvas to the main canvas.
 * @param {Uint32Array} strokeImageData32 - Image data of the stroke in the offscreen canvas.
 * @param {number} userStroke_width - Width of the user stroke.
 * @param {number} userStroke_height - Height of the user stroke.
 * @param {number} x_translate - X translation to position the stroke on the main canvas.
 * @param {number} y_translate - Y translation to position the stroke on the main canvas.
 * @param {boolean} overwrite - Indicates if the stroke should overwrite existing pixels on the main canvas.
 * @param {number} color - Color of the stroke to be transferred.
 */
function transferStroke(strokeImageData32, userStroke_width, userStroke_height,
                        x_translate, y_translate, overwrite, color) {

	for (let y = 0; y < userStroke_height; y++) {
		const y_absolute = y + y_translate;
		if (y_absolute < 0 || y_absolute >= height) continue;

		const offset_absolute = y_absolute * width;
		const offset_relative = y * userStroke_width;

		for (let x = 0; x < userStroke_width; x++) {
			const x_absolute = x + x_translate;
			if (x_absolute < 0 || x_absolute >= width) continue;

			const absIdx = x_absolute + offset_absolute;
			const pixelColor = strokeImageData32[x + offset_relative];

			if (pixelColor !== 0xff000000) {
				// Apply the stroke color to the main canvas for non-transparent pixels in the strokeImageData.
				if (overwrite || renderImageData32[absIdx] === BACKGROUND) {
					// If using the eraser (background color), set the main canvas pixel to the background color directly.
					renderImageData32[absIdx] = color;
				} else if (color === BACKGROUND) {
					renderImageData32[absIdx] = color
				}
			}
		}
	}
}

/** Helper function to calculate the slope of a line
 * @param {number} dy Delta of Y
 * @param {number} dx Delta of X
 * @returns {number} Slope
 */
function calculateSlope(dy, dx) {
	// Prevent division by zero for horizontal lines
	if (dy === 0) dy = 0.001;
	// Prevent division by zero for vertical lines
	if (dx === 0) dx = 0.001;

	return dy / dx;
}

/** Helper function for clamping a position on the canvas
 * @param {number} value To be clamped
 * @param {number} min Min size
 * @param {number} max Max size
 * @returns {number} Post clamping down value
 */
function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

//TODO: Spend a while going through all of this again
/**
 * Main cursor class handling the coordinates and state information for interacting with a canvas
 * @class
 */
class Cursor {
	/**
	 * Cursor object
	 * @constructor
	 * @param canvas
	 */
	constructor(canvas) {
		this.x = 0
		this.y = 0
		this.prev_x = 0
		this.prev_y = 0

		this.documentX = 0
		this.documentY = 0

		this.isDown = false
		this.inCanvas = false
		this.canvas = canvas
	}

	/**
	 * Confines the cursors state to affection within the canvas boundaries
	 * @static
	 * @param {number[]} innerCoords Start Position
	 * @param {number[]} outerCoords End Position
	 * @returns {number[]} Updated outer coordinates confined within the canvas
	 */
	static confineToCanvasRegion(innerCoords, outerCoords) {
		const [x1, y1] = innerCoords;
		let [x2, y2] = outerCoords;

		// Calculate the differences in x and y coordinates
		const dy = y1 - y2;
		const dx = x1 - x2;

		// Calculate the slope of the line connecting the two coordinates
		const slope = calculateSlope(dy, dx);

		// Calculate the y-intercept of the line
		const y_intercept = y1 - slope * x1;

		// Constants for canvas boundaries
		const MIN_X = 0;
		const MIN_Y = 0;
		const MAX_X = MAX_X_IDX;
		const MAX_Y = MAX_Y_IDX;

		// Check for intersection with the left border
		if (x2 < MIN_X) {
			x2 = MIN_X;
			y2 = slope * MIN_X + y_intercept;
		}

		// Check for intersection with the right border
		if (x2 > MAX_X) {
			x2 = MAX_X;
			y2 = slope * MAX_X + y_intercept;
		}

		// Check for intersection with the top border
		if (y2 < MIN_Y) {
			y2 = MIN_Y;
			x2 = (MIN_Y - y_intercept) / (slope || 0.001);
		}

		// Check for intersection with the bottom border
		if (y2 > MAX_Y) {
			y2 = MAX_Y;
			x2 = (MAX_Y - y_intercept) / (slope || 0.001);
		}

		// Round the coordinates to the nearest integer
		const roundedX = Math.floor(x2);
		const roundedY = Math.floor(y2);

		// Clamp the coordinates to ensure they are within the canvas boundaries
		const clampedX = clamp(roundedX, MIN_X, MAX_X);
		const clampedY = clamp(roundedY, MIN_Y, MAX_Y);

		// Return the updated outer coordinates
		return [clampedX, clampedY];
	}

	/** Sets the cursor state when the mouse button is pressed down within the canvas area.
	 * @param {number} x x coordinate
	 * @param {number} y y coordinate
	 */
	canvasCursorDown(x, y) {
		this.isDown = true;
		this.inCanvas = true;

		this.prev_x = x;
		this.x = x;
		this.prev_y = y;
		this.y = y;
	}

	/** Updates the cursor position when the mouse is moved within the canvas area while the mouse button is pressed down.
	 * @param {function} getPos Function for finding the current cursor position
	 */
	canvasCursorMove(getPos) {
		if (!this.isDown) return;

		const pos = getPos();

		this.x = pos[0];
		this.y = pos[1];
	}

	// Sets the cursor state when the mouse enters the canvas area while the mouse button is pressed down.
	/**
	 * Sets cursor state when the cursor enters the canvas area while pressed down
	 * @param {function} getInnerCoords Function for the inner coordinates
	 * @param {function} getOuterCoords Function for the outer corrdinates
	 */
	canvasCursorEnter(getInnerCoords, getOuterCoords) {
		this.inCanvas = true;

		if (!this.isDown) return;

		const innerCoords = getInnerCoords(this);
		const outerCoords = getOuterCoords(this);

		Cursor.confineToCanvasRegion(innerCoords, outerCoords);

		this.prev_x = outerCoords[0];
		this.prev_y = outerCoords[1];
		this.x = innerCoords[0];
		this.y = innerCoords[1];
	}

	/** Sets the cursor state when the mouse leaves the canvas area while the mouse button is pressed down.
	 * @param {function} getOuterCoords
	 */
	canvasCursorLeave(getOuterCoords) {
		this.inCanvas = false;

		if (!this.isDown) return;

		const outerCoords = getOuterCoords(this);
		Cursor.confineToCanvasRegion(
			[this.prev_x, this.prev_y],
			outerCoords
		);

		this.x = outerCoords[0];
		this.y = outerCoords[1];
	}

	/** Updates the cursor position when the mouse is moved outside the canvas area while the mouse button is pressed down.
	 * @param {function} getPos Function for finding the position of the cursor
	 */
	documentCursorMove(getPos) {
		if (!this.isDown) return;
		if (this.inCanvas) return;

		const pos = getPos();
		this.documentX = pos[0];
		this.documentY = pos[1];
	}

	/** Sets the cursor state when the mouse button is released.
	 */
	documentCursorUp() {
		this.isDown = false;
	}

	/** Sets the cursor state when the mouse button is pressed down outside the canvas area.
	 * @param {MouseEvent} e The mouse event containing the click coordinates
	 * @param {function} getPos Function for finding the current cursor position
	 */
	documentCursorDown(e, getPos) {
		if (e.target === modelCanvas) return;
		if (this.isDown) return;

		this.isDown = true;
		this.inCanvas = false;

		this.prev_x = this.x;
		this.prev_y = this.y;

		const pos = getPos(this);
		this.documentX = pos[0];
		this.documentY = pos[1];
	}

	documentVisibilityChange(e) {
	}

	/**
	 * Draws a stroke on the canvas based on the current cursor position and previous position.
	 * This function is called when the user is drawing on the canvas.
	 */
	drawStroke() {
		// If the mouse is not down or there's no cursor movement, return early.
		if (!this.isDown || (!this.inCanvas && this.prev_x === this.x && this.prev_y === this.y)) return;

		const color = SELECTED_ELEM;
		const overwrite = OVERWRITE_ENABLED || color === 0x00000000;

		// Convert the color to a string in RGBA format for canvas rendering.
		let colorString;
		if (color !== 0xff000000) {
			const r = color & 0xff;
			const g = (color & 0xff00) >>> 8;
			const b = (color & 0xff0000) >>> 16;
			const alpha = overwrite ? 1 : 1; // If overwriting, make stroke fully opaque, otherwise retain transparency.
			colorString = `rgba(${r},${g},${b},${alpha})`;
		} else {
			// Use "rgba(1, 0, 0, 1)" when eraser (background color) is selected.
			colorString = "rgba(1, 0, 0, 1)";
		}

		// (x1, y1) represents the leftmost coordinate of the stroke.
		const x1 = Math.min(this.prev_x, this.x);
		const x2 = Math.max(this.prev_x, this.x);
		const y1 = this.prev_x <= this.x ? this.prev_y : this.y;
		const y2 = this.prev_x <= this.x ? this.y : this.prev_y;

		// Store the current cursor position as the previous position for the next draw.
		this.prev_x = this.x;
		this.prev_y = this.y;

		// Calculate the buffer space around the stroke to avoid edge artifacts.
		const strokeBuffer = Math.ceil((PENSIZE / 2) * screen_scale);
		const { x_translate, y_translate, x1_relative, y1_relative, x2_relative, y2_relative } =
			getRelativeCoords(x1, x2, y1, y2, strokeBuffer);

		// Initialize the offscreen canvas only if it needs to be resized.
		const userStroke_width = x2_relative + Math.ceil(PENSIZE * screen_scale) + 2;
		const userStroke_height = Math.max(y1_relative, y2_relative) + Math.ceil(PENSIZE * screen_scale) + 2;
		if (playerInteractionCanvas.width < userStroke_width || playerInteractionCanvas.height < userStroke_height) {
			playerInteractionCanvas.width = userStroke_width;
			playerInteractionCanvas.height = userStroke_height;
		}

		// Clear the offscreen canvas and draw the stroke on it.
		playerInteractionContext.clearRect(0, 0, playerInteractionCanvas.width, playerInteractionCanvas.height);

		if (x1_relative === x2_relative && y1_relative === y2_relative) {
			// Special case: draw a circle if the start and end points are the same.
			playerInteractionContext.beginPath();
			playerInteractionContext.lineWidth = 0;
			playerInteractionContext.fillStyle = colorString;
			playerInteractionContext.arc(x1_relative, y1_relative, Math.ceil(PENSIZE * screen_scale) / 2, 0, TWO_PI);
			playerInteractionContext.fill();
		} else {
			// Draw a line on the offscreen canvas.
			playerInteractionContext.lineWidth = Math.ceil(PENSIZE * screen_scale);
			playerInteractionContext.strokeStyle = colorString;
			playerInteractionContext.lineCap = "round";
			playerInteractionContext.beginPath();
			playerInteractionContext.moveTo(x1_relative, y1_relative);
			playerInteractionContext.lineTo(x2_relative, y2_relative);
			playerInteractionContext.stroke();
		}

		// Get the image data of the stroke from the offscreen canvas.
		const strokeImageData = playerInteractionContext.getImageData(0, 0, userStroke_width, userStroke_height);
		const strokeImageData32 = new Uint32Array(strokeImageData.data.buffer);

		// Transfer the stroke from the offscreen canvas to the main canvas.
		transferStroke(strokeImageData32, userStroke_width, userStroke_height, x_translate, y_translate, overwrite, color);
	}

}

/** Represents a mouse cursor with additional functionality for drawing
 * @extends Cursor
 */
class Mouse extends Cursor {
	/**
	 * Create a new Mouse instance
	 * @param {HTMLCanvasElement} canvas The canvas element associated with the mouse
	 */
	constructor(canvas) {
		super(canvas);

		this.shiftStartX = 0;
		this.shiftStartY = 0;
		this.shiftPressed = false;
		this.lineDirection = Mouse.NO_DIRECTION; /* for use with shift key */
	}

	/**
	 * Gets the mouse position relative to the canvas
	 * @param {MouseEvent} e The mouse event
	 * @param {boolean} withinCanvas Whether the mouse even is in the canvas
	 * @param {HTMLCanvasElement} canvas The canvase element
	 * @returns {number[]} An array containing the x and y coordinates of the mouse position
	 * @static
	 */
	static getMousePos(e, withinCanvas, canvas) {
		let x, y;

		if (withinCanvas) {
			x = e.offsetX/screen_scale;
			y = e.offsetY/screen_scale;

			// Ensure the mouse coordinates are within the canvas boundaries
			x = Math.max(0, Math.min(x, canvas.width));
			y = Math.max(0, Math.min(y, canvas.height));
		} else {
			x = e.pageX - docOffset(canvas, 'offsetLeft');
			y = e.pageY - docOffset(canvas, 'offsetTop');
		}

		return [Math.round(x), Math.round(y)];
	}


	/**
	 * Handles the mouse down event on the canvas
	 * @param e The mouse event
	 */
	canvasMouseDown(e) {
		const mousePos = Mouse.getMousePos(e, true, this.canvas);

		if (this.shiftPressed && !e.shiftKey) this.shiftPressed = false;

		if (this.shiftPressed) {
			this.shiftStartX = mousePos[0];
			this.shiftStartY = mousePos[1];
			this.lineDirection = Mouse.NO_DIRECTION;
		}

		super.canvasCursorDown(mousePos[0], mousePos[1])
	}

	/**
	 * Hands the mouse move event
	 * @param e The mouse event
	 */
	canvasMouseMove(e) {
		const canvas = this.canvas
		const getPos = function () {
			return Mouse.getMousePos(e, true, canvas)
		}

		super.canvasCursorMove(getPos)
	}

	/**
	 * Handles the mouse event for the mouse moving into the canvas
	 * @param e The mouse event
	 */
	canvasMouseEnter(e) {
		const canvas = this.canvas;
		const getInnerPos = function (self) {
			return Mouse.getMousePos(e, true, canvas);
		};
		const getOuterPos = function (self) {
			return [self.documentX, self.documentY];
		};

		super.canvasCursorEnter(getInnerPos, getOuterPos);

		if (this.isDown && this.shiftPressed && this.lineDirection === Mouse.NO_DIRECTION) {
			this.shiftStartX = this.prev_x;
			this.shiftStartY = this.prev_y;
		}
	}

	/**
	 * Handles the mouse leaving the canvas event
	 * @param e The mouse event
	 */
	canvasMouseLeave(e) {
		const canvas = this.canvas;
		const getOuterPos = function (self) {
			return Mouse.getMousePos(e, false, canvas);
		};

		super.canvasCursorLeave(getOuterPos);
	}

	/**
	 * @param e
	 */
	documentMouseMove(e) {
		if (e.target === modelCanvas) return;

		const canvas = this.canvas;
		const getPos = function () {
			return Mouse.getMousePos(e, false, canvas);
		};

		super.documentCursorMove(getPos);
	}

	/**
	 * Handles the mouse up event
	 */
	documentMouseUp() {

		this.lineDirection = Mouse.NO_DIRECTION;

		super.documentCursorUp();
	}

	/**
	 * Handles the 'mousedown' event outside the canvas area.
	 * @param {MouseEvent} e - The mouse event.
	 */
	documentMouseDown(e) {

		if (e.target === modelCanvas) return;

		const canvas = this.canvas;
		const getPos = function () {
			return Mouse.getMousePos(e, false, canvas);
		};

		if (this.shiftPressed && !e.shiftKey) this.shiftPressed = false;

		if (this.shiftPressed) this.lineDirection = Mouse.NO_DIRECTION;

		super.documentCursorDown(e, getPos);
	}

	/**
	 * Handles the shift key down event for straight lines
	 * @param e The mouse event
	 */
	documentKeyDown(e) {
		if (!e.shiftKey) return;

		if (this.shiftPressed) return;

		this.shiftPressed = true;
		this.lineDirection = Mouse.NO_DIRECTION;

		if (!this.isDown) return;

		if (!this.inCanvas) return;

		this.shiftStartX = this.x;
		this.shiftStartY = this.y;
	}

	/**
	 * Handles the key up event for shift
	 * @param e Shift key up mouse event
	 */
	documentKeyUp(e) {
		if (!e.shiftKey && this.shiftPressed) this.shiftPressed = false;
	}

	/**
	 * Handles pausing the program when not in view
	 * @param e Visibility change mouse event
	 */
	documentVisibilityChange(e) {
		const visibilityState = document.visibilityState;
		if (visibilityState == "hidden") {
			this.documentMouseUp(null);
			this.shiftPressed = false;
		}

		super.documentVisibilityChange(e);
	}

	/**
	 * Super function passing to the base class
	 */
	drawStroke() {
		/* alters prevX, prevY, x, and y to handle drawing in straight lines */

		super.drawStroke();
	}
}

/**
 * Touch interface controls
 */
class TouchCursor extends Cursor {
	constructor(canvas) {
		super(canvas);
	}

	/**
	 * Start point for touch controls
	 * @param e Touch event start
	 * @returns {boolean}
	 */
	canvasTouchStart(e) {
		const pos = TouchCursor.getTouchPos(e);

		if (!pos) return;

		super.canvasCursorDown(pos[0], pos[1]);

		/* prevent scrolling */
		e.preventDefault();

		return false;
	}

	/**
	 * End of touch events
	 * @param e Touch event end
	 * @returns {boolean}
	 */
	canvasTouchEnd(e) {
		super.documentCursorUp();

		/* prevent scrolling */
		e.preventDefault();

		return false;
	}

	/**
	 * Movement of touch cursor on the canvas
	 * @param e Touch positions between start and end
	 * @returns {boolean}
	 */
	canvasTouchMove(e) {
		const pos = TouchCursor.getTouchPos(e);

		if (!pos) return;

		const getPos = function () {
			return pos;
		};

		super.canvasCursorMove(getPos);

		/* prevent scrolling */
		e.preventDefault();

		return false;
	}

	/**
	 * Calculates the positions of the touch events in order to draw onto the canvas.
	 * @param e Touch event
	 * @returns {number[]|null} X Y coordinates relative to the page
	 */
	static getTouchPos(e) {
		if (!e.touches) return null;

		const touch = e.touches[0];
		if (!touch) return null;

		// Get the canvas element
		const canvas = document.getElementById("gameCanvas");
		const rect = canvas.getBoundingClientRect();

		//Calculate the relative positions first by subtracting from the touch events x/y the offset relative
		const touchX = touch.clientX - rect.left;
		const touchY = touch.clientY - rect.top;

		//Then calculating based on the scale difference between the modelCanvas and the other canvases
		let x = Math.round(touchX * screen_scale);
		let y = Math.round(touchY * screen_scale);

		if (x < 0) x = 0;
		else if (x >= modelCanvas.width) x = modelCanvas.width - 1;

		if (y < 0) y = 0;
		else if (y >= modelCanvas.height) y = modelCanvas.height - 1;

		return [x, y];
	}


}

/**
 * Hooks up the touch and moused based event interfaces
 */
function initCursors() {

	const mouseCursor = new Mouse(modelCanvas)
	const touchCursor = new TouchCursor(modelCanvas);

	modelCanvas.onmousedown = function (e) {
		mouseCursor.canvasMouseDown(e);
	};
	modelCanvas.onmousemove = function (e) {
		mouseCursor.canvasMouseMove(e);
	};
	modelCanvas.onmouseleave = function (e) {
		mouseCursor.canvasMouseLeave(e);
	};
	modelCanvas.onmouseenter = function (e) {
		mouseCursor.canvasMouseEnter(e);
	};
	document.onmouseup = function () {
		mouseCursor.documentMouseUp();
	};
	document.onmousedown = function (e) {
		mouseCursor.documentMouseDown(e);
	};
	document.onmousemove = function (e) {
		mouseCursor.documentMouseMove(e);
	};
	document.onvisibilitychange = function (e) {
		mouseCursor.documentVisibilityChange(e);
	};

	modelCanvas.addEventListener("touchstart", function (e) {
		touchCursor.canvasTouchStart(e);
	});
	modelCanvas.addEventListener("touchend", function (e) {
		touchCursor.canvasTouchEnd(e);
	});
	modelCanvas.addEventListener("touchmove", function (e) {
		touchCursor.canvasTouchMove(e);
	});

	CURSORS.push(mouseCursor);
	CURSORS.push(touchCursor);
	Object.freeze(CURSORS);
}

/**
 * For all within the Cursors array draw the strokes that are populated
 */
function updateUserStroke() {
	const numCursors = CURSORS.length
	for (let i = 0; i !== numCursors; i++) {
		CURSORS[i].drawStroke()
	}
}

/**
 * Accumulates the offsets to calculate position relative to the parent canvas element
 * @param elem
 * @param offsetProp
 * @returns {number} Calculated offset
 */
function docOffset(elem, offsetProp) {
	let offset = 0;
	while (elem) {
		if (!Number.isNaN(elem[offsetProp])) {
			offset += elem[offsetProp];
		}
		elem = elem.offsetParent;
	}
	return offset;
}
