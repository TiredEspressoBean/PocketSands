const PEN_SIZES = [0, 2, 4, 8, 16, 32, 64];
const DEFAULT_PEN_IDX = 6;
let SELECTED_ELEM
let PENSIZE = PEN_SIZES[DEFAULT_PEN_IDX];
let OVERWRITE_ENABLED;

/**
 * If you wish to add new elements to the elements menu then you'll do so here. Elements placed onto the menu in order
 * from left to right.
 */
const menuItems = [
	"WALL", "SAND", "WATER", "FIRE",
	"FUSE", "VINE", "SALT", "OIL",
	"SOIL", "LAVA", "C4", "METHANE",
	"ACID", "ICE", "SEED", "PRODUCER",
	"BACKGROUND"
];

const menuLabel = {};

/**
 * Adds the elements before the elementDict is updated in initElement so that the key for it is the color
 */
for (const elemType of menuItems) {
	if (!(elemType in menuLabel)) {
		const name = elementDict[elemType]["name"]
		const color = elementDict[elemType]["color"]
		menuLabel[name] = color;
	}
}

/**
 * We set up the menu and populate it with elements that are allowed on the element menu.
 */
function initMenu() {

	SELECTED_ELEM = SAND

	const elementMenu = document.getElementById("elementMenu")

	//We go through the menuItems array and assign each a button
	for (let i = 0; i < menuItems.length; i++) {
		const button = document.createElement("input");
		elementMenu.appendChild(button);

		button.type = "button";
		button.className = "elementButton";

		const elemType = menuItems[i];
		button.value = elemType;

		button.id = menuLabel[elemType];

		//Generally we'll have the button labeled with what's in the menuLabel array except for Background, it's named
		//eraser instead.
		if (button.value === "BACKGROUND") {
			button.value = "ERASER";
		}

		// Get the 32-bit unsigned integer color from menuLabel[elemType]
		const colorInt = menuLabel[elemType];

		// Extract the RGBA components from the 32-bit integer
		let r = colorInt & 0xff;
		let g = (colorInt >> 8) & 0xff;
		let b = (colorInt >> 16) & 0xff;
		const a = 255;

		if ((r + g + b) > 610 && (r + g + b)<710){
			if ((r+g+b)<666){
				r = r - 70
				b = b - 70
				g = g - 70
			} else {
				r = r + 30
				b = b + 30
				g = g + 30
			}
		}

		// Create the RGBA color string in CSS format
		const colorString = `rgba(${r}, ${g}, ${b}, ${a / 255})`;

		// Set the background color of the button
		button.style.color = colorString;

		button.addEventListener("click", function () {
			document
				.getElementById(SELECTED_ELEM.toString())
				.classList.remove("selectedElementButton");
			button.classList.add("selectedElementButton");
			SELECTED_ELEM = parseInt(button.id, 10);
		});
	}

	document.getElementById(SELECTED_ELEM.toString()).click();

	//Overwriting toggle function
	const eraserCheck = document.getElementById("eraserCheck")
	eraserCheck.checked = OVERWRITE_ENABLED
	eraserCheck.addEventListener("click", function () {
		OVERWRITE_ENABLED = eraserCheck.checked
	})

	//Slider for the speed of the frames and how often the gameloop is being called up
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
	})}

/**
 * Called to update the FPS calculated
 * @param fps Current 'refreshing' times, how often the gameloop is being called essentially per second
 * @constructor
 */
function FPScounter(fps) {
	document.getElementById("FPScounter").innerText = "FPS: " + fps;
}