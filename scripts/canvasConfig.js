let height
let width
let screen_scale

let modelCanvas
let modelContext

let renderCanvas
let renderContext
let renderImageArray
let renderImageData32

let playerInteractionCanvas
let playerInteractionContext

let offscreenParticleCanvas
let offscreenParticleCtx

let saveImageData32

let MAX_X_IDX
let MAX_Y_IDX
let MAX_IDX

let gameSaved = false

const MAX_FPS = 180
const BASE_FPS = 60

let fpsSetting;
let msPerFrame;
let lastLoop = 0
let lastFPSLabelUpdate = 0;
const refreshTimes = [];

MAX_NUM_PARTICLES = 8000

/**
 * Makes the modelCanvas on the screen fill out the whole screen and sets the additional canvases width and height of
 * their relative proportions, reducing the size for mobile devices because they have a lot more pixels relative to the
 * capability of the CPU.
 */
function initCanvas() {
	let widthPercentage = 1;
	let heightPercentage = 0.95;

	width = Math.floor(innerWidth * widthPercentage);

	// Get the height of the Controls div
	let MainMenuDiv = document.getElementById("MainMenu");
	let controlsHeight = MainMenuDiv.clientHeight;

	height = Math.floor((window.innerHeight  - controlsHeight) * heightPercentage);

	// If mobile device go ahead and limit the amount of pixels to a quarter of a million rather than the millions that
	// it would generally produce especially for apple devices.
	const targetPixelsForMobile = 250000;
	screen_scale = calculateScreenScale(targetPixelsForMobile);

	const screenPixels = 1;
	const renderWidth = width * screenPixels;
	const renderHeight = height * screenPixels;

	// Set the canvases starting with the modelCanvas and then changing width and height depending on the proportion
	// of the canvas on screen and everything else
	modelCanvas = document.getElementById("gameCanvas");
	modelCanvas.width = renderWidth;
	modelCanvas.height = renderHeight;
	modelCanvas.style.width = width + "px";
	modelCanvas.style.height = height + "px";
	modelContext = modelCanvas.getContext("2d", {alpha: false});

	width = Math.floor(screen_scale * width)
	height = Math.floor(screen_scale * height)

	renderCanvas = document.createElement("canvas");
	renderCanvas.width = width;
	renderCanvas.height = height;
	renderContext = renderCanvas.getContext("2d", {alpha: false});
	renderImageArray = renderContext.createImageData(width, height);
	renderImageData32 = new Uint32Array(renderImageArray.data.buffer);

	playerInteractionCanvas = document.createElement("canvas");
	playerInteractionCanvas.width = width;
	playerInteractionCanvas.height = height;
	playerInteractionContext = playerInteractionCanvas.getContext("2d", {alpha: false, willReadFrequently: true});

	offscreenParticleCanvas = document.createElement("canvas");
	offscreenParticleCtx = offscreenParticleCanvas.getContext("2d", {alpha: false});

	//Set up the save data as the correct type
	saveImageData32 = new Uint32Array(renderImageData32.length);

	//Set up the constraints of the relative x/y coordinate plane that is the canvases
	MAX_X_IDX = width - 1;
	MAX_Y_IDX = height - 1;
	MAX_IDX = width * height - 1;
}

function isMobileDevice() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * We calculate the ratio here to always have about a quarter of a million pixels for mobile devices.
 * @param targetPixels Amount of pixels we're going to be targeting for
 * @returns {number|number} Ratio to describe the amount of reduction necessary in order to achieve target
 */
function calculateScreenScale(targetPixels) {
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;
	const totalPixels = screenWidth * screenHeight;

	// Calculate the screen_scale based on the target number of pixels
	const screen_scale = isMobileDevice() ? Math.sqrt(targetPixels / totalPixels) : 1;

	return screen_scale;
}
