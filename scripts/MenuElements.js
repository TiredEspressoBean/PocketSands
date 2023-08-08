const ELEMENTS_PER_ROW = 4
const PEN_SIZES = [0, 2, 4, 8, 16, 32, 64];
const DEFAULT_PEN_IDX = 6;
let SELECTED_ELEM
let PENSIZE = PEN_SIZES[DEFAULT_PEN_IDX];
let OVERWRITE_ENABLED;


const menuItems = [
	"WALL", "SAND", "WATER", "FIRE",
	"FUSE", "VINE", "SALT", "OIL",
	"SOIL", "LAVA", "C4", "METHANE",
	"ACID", "ICE", "SEED", "PRODUCER",
	"BACKGROUND"
];

const menuLabel = {};

for (const elemType of menuItems) {
	if (!(elemType in menuLabel)) {
		const name = elementDict[elemType]["name"]
		const color = elementDict[elemType]["color"]
		menuLabel[name] = color;
	}
}


function initMenu() {

	SELECTED_ELEM = SAND

	let gameWrapper = document.getElementById("gameDiv");

	const menu = document.getElementById("Menu")


	const elementMenu = document.getElementById("elementMenu")

	const rows = Math.ceil(menuItems.length / ELEMENTS_PER_ROW);

	let elementIndex = 0;
	let i, k;

	for (let i = 0; i < menuItems.length; i++) {
		const button = document.createElement("input");
		elementMenu.appendChild(button);

		button.type = "button";
		button.className = "elementButton";

		const elemType = menuItems[i];
		button.value = elemType;

		button.id = menuLabel[elemType];

		if (button.value === "BACKGROUND") {
			button.value = "ERASER";
		}

		// Get the 32-bit unsigned integer color from menuLabel[elemType]
		const colorInt = menuLabel[elemType];

		// Extract the RGBA components from the 32-bit integer
		const r = colorInt & 0xff;
		const g = (colorInt >> 8) & 0xff;
		const b = (colorInt >> 16) & 0xff;
		const a = (colorInt >> 24) & 0xff;

		// Create the RGBA color string in CSS format
		const colorString = `rgba(${r}, ${g}, ${b}, ${a / 255})`;

		// Set the background color of the button
		button.style.backgroundColor = colorString;

		const isDarker = r + g + b < 384

		button.style.color = isDarker ? "white" : "black";

		button.addEventListener("click", function () {
			document
				.getElementById(SELECTED_ELEM.toString())
				.classList.remove("selectedElementButton");
			button.classList.add("selectedElementButton");
			SELECTED_ELEM = parseInt(button.id, 10);
		});
	}

	document.getElementById(SELECTED_ELEM.toString()).click();

	const eraserCheck = document.getElementById("eraserCheck")
	eraserCheck.checked = OVERWRITE_ENABLED
	eraserCheck.addEventListener("click", function () {
		OVERWRITE_ENABLED = eraserCheck.checked
	})

	const FPSslider = document.getElementById("FPSslider")
	FPSslider.min = 0
	FPSslider.max = MAX_FPS
	FPSslider.value = BASE_FPS
	FPSslider.addEventListener("input", function () {
		setFPS(parseInt(FPSslider.value, 10))
	})
	const saveButton = document.getElementById("saveButton")
	saveButton.onclick = saveGame

	const loadButton = document.getElementById("loadButton")
	loadButton.onclick = loadGame

	const clearButton = document.getElementById("clearButton")
	clearButton.onclick = clearCanvas

	const penSize = document.getElementById("penSize")
	penSize.value = PENSIZE
	penSize.addEventListener("input", function () {
		PENSIZE = parseInt(penSize.value, 10)
	})

	function replaceCanvasWithImage(canvas, imageSrc) {
		const ctx = canvas.getContext("2d");

		// When the image is loaded, replace the canvas content with the new image
		const image = new Image();
		image.onload = function () {
			// Clear the canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw the new image on the canvas (replacing the previous content)
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		};
		image.src = imageSrc;
	}

	//
	// function handleImageImport(file) {
	// 	const reader = new FileReader();
	//
	// 	// When the image file is loaded, call the function to handle the image
	// 	reader.onload = function(event) {
	// 		const imageSrc = event.target.result;
	//
	// 		// Create a new canvas to load the image
	// 		const tempCanvas = document.createElement("canvas");
	// 		tempCanvas.width = width;
	// 		tempCanvas.height = height;
	//
	// 		// Replace the temporary canvas content with the new image
	// 		const ctx = tempCanvas.getContext("2d");
	// 		const image = new Image();
	// 		image.onload = function() {
	// 			ctx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
	//
	// 			// Get the image data from the temporary canvas
	// 			const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
	//
	// 			// Copy the image data to the game state
	// 			renderImageArray.data.set(imageData.data);
	// 			renderImageData32.set(new Uint32Array(imageData.data.buffer));
	//
	// 			// Clear the game canvas
	// 			const gameCanvas = modelCanvas
	// 			const gameContext = gameCanvas.getContext("2d");
	// 			gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	//
	// 			// Draw the new game state on the canvas
	// 			gameContext.putImageData(renderImageArray, 0, 0);
	// 		};
	// 		image.src = imageSrc;
	// 	};
	//
	// 	// Read the image file as a data URL
	// 	reader.readAsDataURL(file);
	// }
	//
	// // Handle file input change event
	// const importInput = document.getElementById("importButton");
	// importInput.addEventListener("change", function(event) {
	// 	const file = event.target.files[0];
	// 	if (file && file.type.match("image/png")) {
	// 		handleImageImport(file);
	// 	}
	// });

}

function FPScounter(fps) {
	document.getElementById("FPScounter").innerText = "FPS: " + fps;
}