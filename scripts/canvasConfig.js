let height
let width
let screen_scale

let renderWidth
let renderHeight

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

function initCanvas() {
	let widthPercentage = 1;
	let heightPercentage = 0.95;

	width = Math.floor(innerWidth * widthPercentage);

// Get the height of the Controls div
	let MainMenuDiv = document.getElementById("MainMenu");
	let controlsHeight = MainMenuDiv.clientHeight;

	height = Math.floor((window.innerHeight  - controlsHeight) * heightPercentage);

	const targetPixelsForMobile = 250000; // Adjust this value to your desired target pixels for mobile
	screen_scale = calculateScreenScale(targetPixelsForMobile);

	const screenPixels = 1;
	const renderWidth = width * screenPixels;
	const renderHeight = height * screenPixels;

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

	saveImageData32 = new Uint32Array(renderImageData32.length);

	MAX_X_IDX = width - 1;
	MAX_Y_IDX = height - 1;
	MAX_IDX = width * height - 1;
}

let gameSaved = false
let importedImage = null

const MAX_FPS = 180
const BASE_FPS = 60

function isMobileDevice() {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function calculateScreenScale(targetPixels) {
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;
	const totalPixels = screenWidth * screenHeight;

	// Calculate the screen_scale based on the target number of pixels
	const screen_scale = isMobileDevice() ? Math.sqrt(targetPixels / totalPixels) : 1;

	return screen_scale;
}

let fpsSetting;
let msPerFrame;
let lastLoop = 0
let lastFPSLabelUpdate = 0;
const refreshTimes = [];

MAX_NUM_PARTICLES = 8000
