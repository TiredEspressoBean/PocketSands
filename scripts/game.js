const LRUCacheSize = 100; // Set the LRU cache size as needed
const LRUCache = new Map(); // Use a Map to simulate the LRU cache

let lastElementAction = null;
let lastActionFunction = null;

let count = 0

//TODO Reformat all of this nonsense, in a way that makes more sense

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
 * Main loop engine for the game. Will need to document quite heavily. Basic is it goes from bottom to top of the array
 * for the game itself.
 */
//TODO Make this more my own and see about maybe redoing the nonsense where I used least significant bits
function updateGame() {
	updateParticles();

	const direction = MAX_Y_IDX & 1;
	let i = MAX_IDX;

	for (let y = MAX_Y_IDX; y !== -1; y--) {
		const Y = y;
		if ((Y & 1) === direction) {
			for (let x = MAX_X_IDX; x !== -1; x--) {
				let i = Y * width + x;
				const elem = renderImageData32[i];

				if (elem === BACKGROUND) {
					i--;
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
 *
 */
function draw() {
	// Clear the renderCanvas
	renderContext.clearRect(0, 0, renderCanvas.width, renderCanvas.height);

	// Your logic to update renderImageData32 based on the game state goes here

	// After updating renderImageData32, put the updated data onto the renderCanvas
	renderContext.putImageData(renderImageArray, 0, 0);

	// Scale and draw the renderCanvas to fit the modelCanvas for display
	modelContext.clearRect(0, 0, modelCanvas.width, modelCanvas.height);
	modelContext.drawImage(renderCanvas, 0, 0, modelCanvas.width, modelCanvas.height);
}

function saveGame(){
	const xStop = MAX_IDX + 1
	for (let x = 0; x !== xStop; x++) saveImageData32[x] = renderImageData32[x]
	gameSaved = true
}

function loadGame(){
	if (!gameSaved) return

	particles.inactiveAll()
	
	const xStop = MAX_IDX + 1
	for (let x = 0; x !== xStop; x++) renderImageData32[x] = saveImageData32[x]
}

function clearCanvas(){
	particles.inactiveAll()

	const xStop = MAX_IDX + 1
	for (let x = 0; x !== xStop; x++) renderImageData32[x] = BACKGROUND
}

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

			const loopMisc = 3.5

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
