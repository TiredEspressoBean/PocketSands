/**
 * THE GAME ENGINE
 *
 * Here we are dealing with how the game is supposed to run/operate at an engine level.
 */



/**
 * The LRU cache is a map, where each behavior function for elements on the screen are stored for ease of access later.
 * By doing so this way we are able to decrease the lookup time for each element's behavior by a good margin, though
 * we aren't using it as it traditionally would be as generally there aren't enough elements to start kicking others
 * out of the cache.
 */

const LRUCacheSize = 100; // Set the LRU cache size as needed
const LRUCache = new Map(); // Use a Map to simulate the LRU cache

let lastElementAction = null;
let lastActionFunction = null;

let frameDebt = 0

/**
 * Starts up the initialization processes, making the canvas, kickstarting the other sets of codebases, and fills the
 * canvas with sand, good way to stress test performance for now.
 */
function init() {

	setFPS(BASE_FPS)

	initMenu()
	initCanvas()
	initCursors();
	initElements();
	initParticles();

	const len = renderImageData32.length
	for (let i = 0; i < len; i++) {
		renderImageData32[i] = SAND;
	}
}

/**
 * Digests the input of what FPS the player has set for the render FPS, and sets it globally.
 * @param fps -
 */
function setFPS(fps) {
	fpsSetting = fps
	if (fps > 0) msPerFrame = 1000.0 / fpsSetting
	else FPScounter(0)
}

/**
 * Canvas loop engine for the games interactions, goes through the entire canvas and calls respective functions based
 * on the hex color code of the canvas.
 */
function updateGame() {
	updateParticles();

	const direction = MAX_Y_IDX & 1;
	let i = MAX_IDX;

	//Start going backwards through the canvas from the Y coordinate
	for (let y = MAX_Y_IDX; y !== -1; y--) {
		const Y = y;
		//We start going left and right depending on which Y level we're at, bouncing back and forth depending on if
		//the Y is even or odd
		if ((Y & 1) === direction) {
			//Here we are going right to left, and making our X coordinate
			for (let x = MAX_X_IDX; x !== -1; x--) {
				let i = Y * width + x;
				const elem = renderImageData32[i];
				//Skipping the most common element that has literally nothing it does
				if (elem === BACKGROUND) {
					i--;
				} else {
					//Start using the LRU cache
					if (elem !== lastElementAction) {
						lastElementAction = elem;

						// Check if the action function exists in the cache
						if (LRUCache.has(elem)) {
							lastActionFunction = LRUCache.get(elem);
						} else {
							// If not in cache, get the action function from the elementActionDict
							lastActionFunction = elementActionDict[elem];
							// Add the action function to the cache
							if (LRUCache.size >= LRUCacheSize) {
								// If the cache is full, remove the least recently used entry
								const leastRecentlyUsed = LRUCache.keys().next().value;
								LRUCache.delete(leastRecentlyUsed);
							}
							LRUCache.set(elem, lastActionFunction);
						}
					}
					lastActionFunction(x, Y, i);
				}
			}
			i++;
		} else {
			for (let x = 0; x !== width; x++) {
				let i = Y * width + x;
				const elem = renderImageData32[i];

				if (elem === BACKGROUND) {
					i++;
				} else {
					if (elem !== lastElementAction) {
						lastElementAction = elem;

						// Check if the action function exists in the cache
						if (LRUCache.has(elem)) {
							lastActionFunction = LRUCache.get(elem);
						} else {
							// If not in cache, get the action function from the elementActionDict
							lastActionFunction = elementActionDict[elem];
							// Add the action function to the cache
							if (LRUCache.size >= LRUCacheSize) {
								// If the cache is full, remove the least recently used entry
								const leastRecentlyUsed = LRUCache.keys().next().value;
								LRUCache.delete(leastRecentlyUsed);
							}
							LRUCache.set(elem, lastActionFunction);
						}
					}
					lastActionFunction(x, Y, i);
				}
			}
			i--;
		}
		i -= width;
	}

	perfRecordFrame();
	frameDebt--;
}


/**
 * This function deals with just drawing each frame onto the model canvas, by clearing the previous context and
 * imposing the new image from renderImageArray.
 */
function draw() {
	renderContext.clearRect(0, 0, renderCanvas.width, renderCanvas.height);
	renderContext.putImageData(renderImageArray, 0, 0);

	// Scale and draw the renderCanvas to fit the modelCanvas for display
	modelContext.clearRect(0, 0, modelCanvas.width, modelCanvas.height);
	modelContext.drawImage(renderCanvas, 0, 0, modelCanvas.width, modelCanvas.height);
}

/**
 * Saving the game to saveImageData32
 */
function saveGame(){
	const xStop = MAX_IDX + 1
	for (let x = 0; x !== xStop; x++) saveImageData32[x] = renderImageData32[x]
	gameSaved = true
}

/**
 * Loading the game from the saveImageData32
 */
function loadGame(){
	if (!gameSaved) return

	particles.inactiveAll()
	
	const xStop = MAX_IDX + 1
	for (let x = 0; x !== xStop; x++) renderImageData32[x] = saveImageData32[x]
}

/**
 * Zips through the canvas setting all pixels to Background
 */
function clearCanvas(){
	particles.inactiveAll()

	const xStop = MAX_IDX + 1
	for (let x = 0; x !== xStop; x++) renderImageData32[x] = BACKGROUND
}

/**
 * Used in order to figure out the Frames per second, populating the refreshTimes array and using its length in order
 * to set the FPS. Adds timestamps to the array and if they are from more than 1 second ago removes them from the 0
 * index of the array(last in first out stack operation)
 */
function perfRecordFrame() {
	const now = performance.now();
	const oneSecondAgo = now - 1000;
	while (refreshTimes.length > 0 && refreshTimes[0] <= oneSecondAgo) {
		refreshTimes.shift();
	}
	refreshTimes.push(now);

	if (now - lastFPSLabelUpdate > 200) {
		FPScounter(refreshTimes.length);
		lastFPSLabelUpdate = now;
	}
}

/**
 * Main loop for the game that puts everything into motion
 * @param now
 */
//TODO document this fully and give updateGame a better JSdoc entry
function gameLoop(now) {
	window.requestAnimationFrame(gameLoop);
	if (lastLoop === 0) {
		lastLoop = now;
		return;
	}

	const animationInterval = now - lastLoop
	lastLoop = now

	if (fpsSetting > 0) frameDebt += animationInterval / msPerFrame

	frameDebt = Math.min(frameDebt, 5)

	updateUserStroke();

	if (frameDebt >= 1) {
		if (frameDebt < 2) {
			updateGame()
		} else {
			const updateTimeMS = executeAndTime(updateGame)

			const loopMisc = .5

			let timeRemainder = animationInterval - updateTimeMS - loopMisc
			while (timeRemainder > updateTimeMS && frameDebt >= 1) {
				updateGame()
				timeRemainder -= updateTimeMS
			}
		}
	}

	draw();
}

window.onload = function () {
	init();
	gameLoop(0);
}
