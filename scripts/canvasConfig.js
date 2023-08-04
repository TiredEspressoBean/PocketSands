widthPercentage = .95
heightPercentage = .7

let width = Math.floor(innerWidth * widthPercentage);
let height = Math.floor(innerHeight * heightPercentage);


const MAX_FPS = 300
const BASE_FPS = 300

const screenPixels = window.devicePixelRatio;
const renderWidth = screenPixels * width;
const renderHeight = screenPixels * height;

const modelCanvas = document.getElementById("gameCanvas");
modelCanvas.width = renderWidth;
modelCanvas.height = renderHeight;
modelCanvas.style.width = width + "px";
modelCanvas.style.height = height + "px";
const modelContext = modelCanvas.getContext("2d", {alpha: false});

const renderCanvas = document.createElement("canvas");
renderCanvas.width = width;
renderCanvas.height = height;
const renderContext = renderCanvas.getContext("2d", {alpha: false});
const renderImageArray = renderContext.createImageData(width, height);
const renderImageData32 = new Uint32Array(renderImageArray.data.buffer);

const saveImageData32 = new Uint32Array(renderImageData32.length);
let gameSaved = false
let importedImage = null

const MAX_X_IDX = width - 1;
const MAX_Y_IDX = height - 1;
const MAX_IDX = width * height - 1;

let fpsSetting;
let msPerFrame;
let lastLoop = 0
let lastFPSLabelUpdate = 0;
const refreshTimes = [];

MAX_NUM_PARTICLES = 8000
