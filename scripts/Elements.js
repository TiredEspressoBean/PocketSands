/**
 * COMPENDIUM OF THE ELEMENTS
 *
 * This file is broken up into 3 sections,
 *      Initialization      Describes the elements(color, name, etc.)
 *      Behaviors           Describes how the elements interact with the world
 *      Helpers             Functions that assist the functions in the behaviors section(like describing gravity)
 *
 * Each element is placed within the ElementDict array, with their name, color(Hexadecimal representation of ARGB),
 * name, their 'ACTION' which is the behavior function, and whether gases rise up through them. This dictionary is then
 * switched around after the color has been found for each element in hex, so the color code is the key for the
 * dictionary, and the behavior function is assigned to each name of the different elements as constants e.g.
 * const WALL = WALL_ACTION.
 *
 * ADDING ELEMENTS TUTORIAL - Add the new element to the ElementActionDict, then at the end of the behavior section add
 * their accompanying ACTION function. If you want to add the element to the menu, that is done in
 * MenuElements.js.
 */

/**
 * Takes RGB code and spits out ARGB code that the html canvas can use as the color
 * @param r Red
 * @param g Green
 * @param b Blue
 * @returns {*} ARGB code representing both the index of the dictionary and the color code.
 */
function inGameColors(r, g, b) {
	const alpha = 0xff000000;
	return alpha + (b << 16) + (g << 8) + r;
}

/**
 * Main elements directory containing the color, name, and what its function for behavior is.
 **/
//TODO Not 100% about gasPermeable, see about changing or removing
elementDict = {
	BACKGROUND: {color: inGameColors(0, 0, 0), name: "BACKGROUND", action: BACKGROUND_ACTION, gasPermeable: false},
	WALL: {color: inGameColors(127, 127, 127), name: "WALL", action: WALL_ACTION, gasPermeable: false},
	SAND: {color: inGameColors(223, 193, 99), name: "SAND", action: SAND_ACTION, gasPermeable: true},
	WATER: {color: inGameColors(35, 70, 180), name: "WATER", action: WATER_ACTION, gasPermeable: true},
	FIRE: {color: inGameColors(180, 5, 20), name: "FIRE", action: FIRE_ACTION, gasPermeable: true},
	FUSE: {color: inGameColors(90, 90, 90), name: "FUSE", action: FUSE_ACTION, gasPermeable: false},
	VINE: {color: inGameColors(20, 160, 0), name: "VINE", action: VINE_ACTION, gasPermeable: false},
	STEAM: {color: inGameColors(220, 220, 240), name: "STEAM", action: STEAM_ACTION, gasPermeable: false},
	SALT: {color: inGameColors(230, 220, 220), name: "SALT", action: SALT_ACTION, gasPermeable: false},
	SALT_WATER: {color: inGameColors(130, 145, 200), name: "SALT_WATER", action: SALT_WATER_ACTION, gasPermeable: false},
	OIL: {color: inGameColors(90, 45, 45), name: "OIL", action: OIL_ACTION, gasPermeable: false},
	SOIL: {color: inGameColors(115, 75, 50), name: "SOIL", action: SOIL_ACTION, gasPermeable: false},
	MUD: {color: inGameColors(75, 50, 25), name: "MUD", action: MUD_ACTION, gasPermeable: false},
	LAVA: {color: inGameColors(200, 30, 5), name: "LAVA", action: LAVA_ACTION, gasPermeable: true},
	C4: {color: inGameColors(185, 185, 150), name: "C4", action: C4_ACTION, gasPermeable: false},
	METHANE: {color: inGameColors(70, 70, 50), name: "METHANE", action: METHANE_ACTION, gasPermeable: false},
	PUMICE: {color: inGameColors(170, 165, 165), name: "PUMICE", action: PUMICE_ACTION, gasPermeable: true},
	GLASS: {color: inGameColors(230, 230, 250), name: "GLASS", action: GLASS_ACTION, gasPermeable: false},
	ACID: {color: inGameColors(60, 171, 72), name: "ACID", action: ACID_ACTION, gasPermeable: false},
	PRODUCER: {color: inGameColors(50, 115, 175), name: "PRODUCER", action: PRODUCER_ACTION, gasPermeable: false},
	ICE: {color: inGameColors(100, 150, 200), name: "ICE", action: ICE_ACTION, gasPermeable: false},
	SEED: {color: inGameColors(150, 150, 75), name: "SEED", action: SEED_ACTION, gasPermeable: true},
	LEAF: {color: inGameColors(58, 95, 11), name: "LEAF", action: LEAF_ACTION, gasPermeable: false},
	BRANCH: {color: inGameColors(85, 65, 35), name: "BRANCH", action: BRANCH_ACTION, gasPermeable: false}
}



const elementActionDict = {};

/**
 * Asserts to the window pointers for the elements and their colors. Question is then how can this be made easier?
 */
for (let i in elementDict) {
	window[elementDict[i]["name"]] = elementDict[i]["color"]
}


/**
 * Goes through the  elements and checks to make sure there aren't any that are duplicate colors as this can easily
 * break the game, and reorders the key/name for the elementDict to being the ARGB code
 */
function initElements() {
	for (let i in elementDict) {
		elementActionDict[elementDict[i].color] = elementDict[i].action;
		elementDict[elementDict[i]["color"]] = elementDict[i]
		delete elementDict[i]
	}
	Object.freeze(elementActionDict)
	const colors = {};
	for (let i in elementDict) {
		const color = elementDict[i]["color"];

		if (color in colors) throw "duplicate color";

		colors[color] = null;
	}
	Object.freeze(elementDict)
}


/**
 *  BEHAVIORS OF THE ELEMENTS - ALL 'ACTION' FUNCTIONS GO INTO THIS SECTION
 */


/**
 * Simple as can be, if it's called on something has gone Very Wrong
 * @param x
 * @param y
 * @param i
 * @constructor
 */
function BACKGROUND_ACTION(x, y, i) {
}

function WALL_ACTION(x, y, i) {
}

/**
 * Function that simulates the physics rules of sand.
 * @param x X coordinate
 * @param y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function SAND_ACTION(x, y, i) {
	if (y !== MAX_Y_IDX && uniformBelowAdjacent(x, y, i) !== SAND) {
		/**
		 * Don't iterate through when the materials are the same
		 */
		if (doDensitySink(x, y, i, WATER, true, 25)) ;
		if (doDensitySink(x, y, i, SALT_WATER, true, 25)) ;
		if (doDensitySink(x, y, i, OIL, true, 25)) ;
	}
	if (doGravity(x, y, i, true, 70)) ;
}

/**
 * Function for behavior of watere
 * @param x X coordinate
 * @param y Y coordinate
 * @param i Index within the array
 * @constructor
 */
function WATER_ACTION(x, y, i) {
	if (doGravity(x, y, i, true, 95)) ;
	if (doDensityLiquid(x, y, i, OIL, 70, 80)) ;
}

/**
 * Function for the behavior of fire
 * @param x X coordinate
 * @param y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function FIRE_ACTION(x, y, i) {

	let rand = random()

	if (rand < 75) {
		let waterLocation = bordering(x, y, i, WATER)
		if (waterLocation !== -1) {
			renderImageData32[i] = BACKGROUND
			renderImageData32[waterLocation] = STEAM
			return
		}
	}

	if (rand < 40) {
		const fuseLocation = borderingAdjacent(x, y, i, FUSE);
		if (fuseLocation !== -1) {
			renderImageData32[fuseLocation] = FIRE
			return
		}
	}
	if (rand < 50) {
		const plantLocation = borderingAdjacent(x, y, i, VINE)
		if (plantLocation !== -1) {
			renderImageData32[plantLocation] = FIRE
			return
		}
	}
	if (rand < 25) {
		const plantLocation = borderingAdjacent(x, y, i, SEED)
		if (plantLocation !== -1) {
			renderImageData32[plantLocation] = FIRE
			return
		}
	}
	if (rand < 25) {
		const plantLocation = borderingAdjacent(x, y, i, LEAF)
		if (plantLocation !== -1) {
			renderImageData32[plantLocation] = FIRE
			return
		}
	}
	if (rand < 25) {
		const plantLocation = borderingAdjacent(x, y, i, BRANCH)
		if (plantLocation !== -1) {
			renderImageData32[plantLocation] = FIRE
			return
		}
	}

	if (rand < 70) {
		const plantLocation = borderingAdjacent(x, y, i, ICE)
		if (plantLocation !== -1) {
			renderImageData32[plantLocation] = WATER
			return
		}
	}

	if (random() < 29) {
		renderImageData32[i] = BACKGROUND
	}

	if (rand < 39) {
		const riseLocation = above(y, i, BACKGROUND)
		if (riseLocation !== -1) {
			renderImageData32[riseLocation] = FIRE;
		}
	}

	if (rand < 10) {
		let sandLoc = borderingAdjacent(x, y, i, SAND)
		if (sandLoc !== -1) {
			renderImageData32[i] = GLASS
		}
	}
}

/**
 * Fuse behavior - This material is only affected by other materials
 * @param x X coordinate
 * @param y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function FUSE_ACTION(x, y, i) {

}

/**
 * Vine actions behavior, previously known as PLANT.
 * @param x X coordinate
 * @param y Y coordinate
 * @param i Index within the array
 * @constructor
 */
function VINE_ACTION(x, y, i) {
	if (random() >= 20) doGrow(x, y, i, WATER, 15)

	/**
	 * This set of if/else chooses how and if the vines will spread. If it finds that there is a pixel of background
	 * within the cardinal directions and corners relative to itself it'll try to spread. First checking if there's any
	 * wall or soil around upon which to spread, and if that is not true then it'll check if there's less than 4
	 * neighboring vine pixels and more than 5 background pixels, so basically only ever true if there's 3 Vine neighbors
	 * and the rest are BACKGROUND pixels.
	 */
	if (random() <= 3) {
		if (borderingAdjacent(x, y, i, BACKGROUND) !== -1) {
			if (countPixelsOfTypeAround(WALL, x, y, i) > 0 || countPixelsOfTypeAround(SOIL, x, y, i) > 0) {
				const upSpread = aboveAdjacent(x, y, i, BACKGROUND)
				const downSpread = belowAdjacent(x, y, i, BACKGROUND)
				let spread = __pickRandValid(upSpread, downSpread)
				const sideSpread = adjacent(x, y, i, BACKGROUND)
				spread = __pickRandValid(spread, sideSpread)
				renderImageData32[spread] = VINE
			} else {
				if (countPixelsOfTypeAround(VINE, x, y, i) < 4 || countPixelsOfTypeAround(BACKGROUND, x, y, i) > 5) {
					if (countPixelsOfTypeAround(FIRE, x, y, i) < 1) {
						const sideSpread = adjacent(x, y, i, BACKGROUND)
						const upSpread = aboveAdjacent(x, y, i, BACKGROUND)
						const downSpread = belowAdjacent(x, y, i, BACKGROUND)
						let spread = __pickRandValid(upSpread, sideSpread)
						spread = __pickRandValid(spread, downSpread)
						renderImageData32[spread] = VINE
					}
				}
			}
		}
	}
}

/**
 * Function for how steam operates.
 * @param x X coordinate
 * @param y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function STEAM_ACTION(x, y, i) {
	/**
	 * Try and rise
	 */
	if (doDensityGas(x, y, i, 50)) return
	if (doRise(x, y, i, 40, 20)) return

	if (random() <= 25) {
		if (bordering(x, y, i, WATER) !== -1) {
			renderImageData32[i] = WATER
		}
	}
	if (random() <= 1) {
		if (countPixelsOfTypeAround(BACKGROUND, x, y, i) === 0) {
			renderImageData32[i] = WATER
		}
	}

	/**
	 * Condensing back into Water or disappearing
	 */
	if (random() <= 35) {
		if (above(y, i, BACKGROUND) === -1 && below(y, i, BACKGROUND) !== -1) {
			if (random() >= 80) {
				renderImageData32[i] = WATER
			} else {
				renderImageData32[i] = BACKGROUND
			}
		}
	}
	if (random() <= 1) {
		if (bordering(x, y, i, STEAM) !== -1) {
			renderImageData32[i] = WATER
		}
	}
}

function SALT_ACTION(x, Y, i) {
	if (doGravity(x, Y, i, true, 90)) ;
	if (doTransform(x, Y, i, WATER, SALT_WATER, 90)) ;
	if (doDensitySink(x, Y, i, SALT_WATER, true, 70)) ;
	if (doDensitySink(x, Y, i, OIL, true, 70)) ;
}

function SALT_WATER_ACTION(x, Y, i) {
	if (doGravity(x, Y, i, true, 70)) ;
	if (doDensityLiquid(x, Y, i, WATER, 60, 40)) ;
	if (doDensityLiquid(x, Y, i, OIL, 60, 40)) ;
}

function OIL_ACTION(x, Y, i) {
	if (doGravity(x, Y, i, true, 90)) ;
	if (random() < 50) {
		if (bordering(x, Y, i, FIRE) !== -1) {
			burnBorders(x, Y, i)
		}
	}
}

function SOIL_ACTION(x, Y, i) {
	if (doGravity(x, Y, i, false, 99)) ;

	if (Y !== MAX_Y_IDX && uniformBelowAdjacent(x, Y, i) !== SOIL) {
		if (doDensitySink(x, Y, i, WATER, false, 90)) ;
		if (doDensitySink(x, Y, i, SALT_WATER, false, 90)) ;
		if (doDensitySink(x, Y, i, OIL, false, 90)) ;
	}

	if (random() < 20) {
		waterLocation = bordering(x, Y, i, WATER)
		if (waterLocation !== -1) {
			renderImageData32[i] = MUD
		}
	}
}

/**
 * Mud behavior function
 * @param x X coordinate
 * @param Y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function MUD_ACTION(x, Y, i) {

	//If not wet become dirt
	if (random() < 5) {
		if (bordering(x, Y, i, WATER) === -1) renderImageData32[i] = SOIL
	}

	if (Y !== MAX_Y_IDX && uniformBelowAdjacent(x, Y, i) !== MUD) {
		if (doDensitySink(x, Y, i, WATER, true, 90)) ;
		if (doDensitySink(x, Y, i, SALT_WATER, true, 90)) ;
		if (doDensitySink(x, Y, i, OIL, true, 90)) ;

	}
	if (doGravity(x, Y, i, true, 90)) ;

}

/**
 * Lava behavior function.
 * @param x X coordinate
 * @param Y Y coordinate
 * @param i Index within the canvas array.
 * @constructor
 */
//TODO: This + acid could use a 'burnAdjacent' function.
function LAVA_ACTION(x, Y, i) {

	const LAVA_IMMUNE = [BACKGROUND, LAVA, FIRE, WATER, SALT_WATER, STEAM, PUMICE, GLASS]
	const up = Y !== 0 ? i - width : -1
	const down = Y !== MAX_Y_IDX ? i + width : -1
	const left = x !== 0 ? i - 1 : -1
	const right = x !== MAX_X_IDX ? i + 1 : -1


	BURN_RANGE = [up, down, left, right]

	//Wall becomes lava
	if (random() < 1) {
		const wallLocation = borderingAdjacent(x, Y, i, WALL)
		if (wallLocation !== -1) {
			renderImageData32[wallLocation] = LAVA
		}
	}
	//Water becomes steam and lava becomes pumice
	const waterLocation = bordering(x, Y, i, WATER) || bordering(x, Y, i, SALT_WATER)
	if (waterLocation !== -1) {
		renderImageData32[waterLocation] = STEAM
		renderImageData32[i] = PUMICE
	}
	//Checks for burnable elements, and if there is one, burns
	if (random() < 25) {
		BURN_RANGE.forEach((burnLocation) => {
			if (!(LAVA_IMMUNE).includes(renderImageData32[burnLocation]) && burnLocation !== -1) {
				renderImageData32[burnLocation] = FIRE
			}
		})
	}

	if (random() < 6 && up !== -1) {
		if (renderImageData32[up] === BACKGROUND) renderImageData32[up] = FIRE
	}


	if (random() < 10) {
		sandLoc = borderingAdjacent(x, Y, i, SAND)
		if (sandLoc !== -1) {
			renderImageData32[i] = GLASS
		}
	}


	if (doGravity(x, Y, i, true, 90)) ;
}

/**
 * C4 behaviors function. Does the big boom.
 * @param x X coordinate
 * @param Y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function C4_ACTION(x, Y, i) {
	if (random() < 60 && bordering(x, Y, i, FIRE) !== -1) {
		if (!particles.addActiveParticle("C4_PARTICLE", x, Y, i)) {
			renderImageData32[i] = FIRE
		}
		return
	}
}

/**
 * Methane behaviors function. Makes circly boom particles.
 * @param x X coordinate
 * @param Y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function METHANE_ACTION(x, Y, i) {
	if (random() < 20 && bordering(x, Y, i, FIRE) !== -1) {
		if (!particles.addActiveParticle("METHANE_PARTICLE", x, Y, i)) {
			renderImageData32[i] = FIRE;
		}
		return
	}

	if (doRise(x, Y, i, 25, 75)) ;
	if (doDensityGas(x, Y, i, 50)) ;
}

/**
 * Glass behavior
 * @param x X coordinate
 * @param Y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function GLASS_ACTION(x, Y, i) {
}

/**
 * Pumice behaviors
 * @param x X Coordinate
 * @param Y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function PUMICE_ACTION(x, Y, i) {
	/**
	 * Try and sink in everything that is fluid
	 */
	if (Y !== MAX_Y_IDX && uniformBelowAdjacent(x, Y, i) !== PUMICE) {
		if (doDensitySink(x, Y, i, WATER, false, 95)) ;
		if (doDensitySink(x, Y, i, OIL, false, 95)) ;
		if (doDensitySink(x, Y, i, SALT_WATER, false, 95)) ;
		if (doDensitySink(x, Y, i, LAVA, false, 15)) ;
	}
	if (doGravity(x, Y, i, false, 99)) ;
}

/**
 * Behavior for the behavior of acid.
 * @param x
 * @param Y
 * @param i
 * @constructor
 */
//TODO Make this work in a way that is nicer on the eyes
function ACID_ACTION(x, Y, i) {
	const ACID_IMMUNE = [GLASS, BACKGROUND, FIRE, LAVA, ACID]
	const up = Y !== 0 ? i - width : -1
	const down = Y !== MAX_Y_IDX ? i + width : -1
	const left = x !== 0 ? i - 1 : -1
	const right = x !== MAX_X_IDX ? i + 1 : -1


	BURN_RANGE = [up, down, left, right]

	if (doGravity(x, Y, i, true, 60)) ;
	if (doDensitySink(x, Y, i, WATER, true, 10)) ;
	if (doDensitySink(x, Y, i, OIL, true, 10)) ;
	if (doDensitySink(x, Y, i, SALT_WATER, true, 10)) ;
	if (doDensitySink(x, Y, i, LAVA, true, 10)) ;
	if (random() < 25) {
		BURN_RANGE.forEach((burnLocation) => {
			if (!(ACID_IMMUNE).includes(renderImageData32[burnLocation]) && burnLocation !== -1) {
				renderImageData32[burnLocation] = BACKGROUND
			}
		})
	}
}

/**
 * Producer functions like the spout mechanic but as an element, it multiplies any pixel that is touching it.
 * @param x X coordinate
 * @param Y Y coordinate
 * @param i Index within the canvas array
 * @constructor
 */
function PRODUCER_ACTION(x, Y, i) {
	const prod_neighbors = countPixelsOfTypeAround(PRODUCER, x, Y, i)
	if (prod_neighbors < 8) {
		const backgroundLocation = borderingAdjacent(x, Y, i, BACKGROUND)
		if (backgroundLocation === -1) return;
		else {
			const otherElements = [PRODUCER, BACKGROUND]
			const locations = findPixelsOfNotTypeAround([otherElements], x, Y, i)
			if (locations.length !== 0) {
				const randomElement = locations[Math.floor(Math.random() * locations.length)]
				if (renderImageData32[randomElement] !== PRODUCER && renderImageData32[randomElement] !== BACKGROUND) {
					renderImageData32[backgroundLocation] = renderImageData32[randomElement]
				}
			}
		}
	}
}

/**
 * Ice behavior function, if touching salt or salt water then it melts, if touching water then it replaces that
 * water pixel with itself. ((Perhaps have a checker for background that has like 1% chance of it melting again?))
 * @param x
 * @param y
 * @param i
 * @constructor
 */
function ICE_ACTION(x, y, i) {
	const saltLoc = bordering(x, y, i, SALT)
	if (saltLoc !== -1) {
		renderImageData32[i] = WATER
	}
	const saltwaterLoc = bordering(x, y, i, SALT_WATER)
	if (saltwaterLoc !== -1) {
		renderImageData32[i] = WATER
	}
	if (random() >= 20) doGrow(x, y, i, WATER, 15)
}

/**
 * Seed action behavior, because seed particles are so many we reduce the likelyhood of a tree being made.
 * @param x
 * @param y
 * @param i
 * @constructor
 */
function SEED_ACTION(x, y, i) {
	if (doGravity(x, y, i, true, 75)) ;
	const mudLoc = borderingAdjacent(x, y, i, SOIL)
	if (mudLoc !== -1) {
		if (random() > 98) {
				if (!particles.addActiveParticle("TREE_PARTICLE", x, y, i)) {
					renderImageData32[i] = BRANCH
				}
		} else {
			renderImageData32[i] = BACKGROUND
		}
	}
}

/**
 * Leaves for Tree particles
 * @param x
 * @param y
 * @param i
 * @constructor
 */
function LEAF_ACTION(x, y, i) {

}

/**
 * Branches for Tree particles
 * @param x
 * @param y
 * @param i
 * @constructor
 */
function BRANCH_ACTION(x, y, i) {
}

/**
 *      HELPER FUNCTIONS - ALL HELPER FUNCTIONS GO HERE
 */

/**
 * Checks to see if both elements are valid (not -1), and returns one of them at a 50% change. If only one is valid that
 * one is sent.
 * @param a Element a
 * @param b Element b
 * @returns Elements a or b
 */
function __pickRandValid(a, b) {
	if (a !== -1 && b !== -1) {
		return random() < 50 ? a : b;
	} else if (a !== -1) {
		return a;
	} else {
		return b;
	}
}

/**
 * What material is immediately below the element being queried. If at the end of the index, return negative one. If the
 * below spot is if the material it is heavier then, return its position. Else return -1.
 * @param y y coordinate
 * @param i Element position on the canvas that is being queried
 * @param type Element that the one being queried is heavier than
 * @returns {number|*} If conditions are met, return element below else return -1
 */
function below(y, i, type) {
	const belowSpot = i + width;
	return y === MAX_Y_IDX ? -1 : (renderImageData32[belowSpot] === type ? belowSpot : -1);
}

/**
 * Much like below but the array searches through the ones to the left and right of the element below if the below spot
 * already has the element that it is querying in it.
 * @param x x coordinate
 * @param y y coordinate
 * @param i Position in the canvas array
 * @param type Element that the one being queried is heavier than
 * @returns {number|*}
 */
function belowAdjacent(x, y, i, type) {
	if (y === MAX_Y_IDX) return -1;

	const belowSpot = i + width;

	if (renderImageData32[belowSpot] === type) return belowSpot;

	const belowLeftSpot = belowSpot - 1;
	const belowLeftMatch =
		x !== 0 && renderImageData32[belowLeftSpot] === type ? belowLeftSpot : -1;

	const belowRightSpot = belowSpot + 1;
	const belowRightMatch =
		x !== MAX_X_IDX && renderImageData32[belowRightSpot] === type
			? belowRightSpot
			: -1;

	return __pickRandValid(belowLeftMatch, belowRightMatch);
}


/**
 *  If the element above the one being queried is of the type that has been passed(lighter than) return the element.
 *  Needs testing with an element.
 * @param y
 * @param i
 * @param type
 * @returns {number|number}
 */
function above(y, i, type) {
	if (y === 0) return -1

	const aboveSpot = i - width
	return (renderImageData32[aboveSpot] === type) ? aboveSpot : -1
}

/**
 * If elements are of the specified type to either the right or left of the element being queried return their position.
 * Else, return -1.
 * @param x x coordinate
 * @param i Position in the element array
 * @param type Type of element being searched for
 * @returns {*} Either left to the pixel being queried or the right of it randomly if both match, else one or the other
 */
function adjacent(x, i, type) {
	const leftSpot = i - 1;
	const rightSpot = i + 1;

	const leftMatch =
		x !== 0 && renderImageData32[leftSpot] === type ? leftSpot : -1;
	const rightMatch =
		x !== MAX_X_IDX && renderImageData32[rightSpot] === type ? rightSpot : -1;

	return __pickRandValid(leftMatch, rightMatch);
}

/**
 * Searches through the elements below the one being queried, if they are the same return the element(by dict key/color)
 * queried, return -1
 * @param x x coordinate
 * @param y y coordinate
 * @param i Position in the canvas array
 * @returns {number} Position of element that does not match or -1
 */
function uniformBelowAdjacent(x, y, i) {
	if (y === MAX_Y_IDX) return -1;

	const belowIndex = i + width;
	const belowElem = renderImageData32[belowIndex];

	if (x !== 0 && renderImageData32[belowIndex - 1] !== belowElem) return -1;

	if (x !== MAX_X_IDX && renderImageData32[belowIndex + 1] !== belowElem) return -1;

	return belowElem;
}

function bordering(x, y, i, type) {
	if (y === MAX_Y_IDX) {
		return -1; // No valid below positions at maximum y-coordinate
	}

	let loc = below(y, i, type);

	if (loc !== -1) {
		return loc; // Found a valid below position, no need to check other positions
	}

	loc = adjacent(x, i, type);

	if (loc !== -1) {
		return loc; // Found a valid adjacent position
	}

	if (y !== 0) {
		loc = above(y, i, type);
	}

	return loc; // Return the above position if found, or -1 if none of the positions are valid
}


/**
 * Searches through adjacent pixels for elements of the passed type, and if found returns its location
 * @param x x coordinate
 * @param y y coordinate
 * @param i Position in the array
 * @param type Type being searched for
 * @returns {number} Either location if successful or -1 if not successful
 */
function borderingAdjacent(x, y, i, type) {
	let loc = -1;

	if (y !== MAX_Y_IDX) {
		loc = belowAdjacent(x, y, i, type);
	}

	if (loc === -1) {
		loc = adjacent(x, i, type);
	}

	if (loc === -1 && y !== 0) {
		loc = aboveAdjacent(x, y, i, type);
	}

	return loc;
}

/**
 * Searches through the pixels above the element being queried for an element of the matching type, if found return it
 * @param x x coordinate
 * @param y y coordinate
 * @param i Position in the canvas array
 * @param type Element being searched for
 * @returns {number|*}
 */
function aboveAdjacent(x, y, i, type) {
	if (y === 0) return -1;

	const aboveSpot = i - width;
	if (renderImageData32[aboveSpot] === type) return aboveSpot;

	const aboveLeftSpot = aboveSpot - 1;
	const aboveLeftMatch =
		x !== 0 && renderImageData32[aboveLeftSpot] === type ? aboveLeftSpot : -1;

	const aboveRightSpot = aboveSpot + 1;
	const aboveRightMatch =
		x !== MAX_X_IDX && renderImageData32[aboveRightSpot] === type ? aboveRightSpot : -1;

	return __pickRandValid(aboveLeftMatch, aboveRightMatch);
}


/**
 * Function for the simulation of gravity.
 * @param x X coordinate
 * @param y Y coordinate
 * @param i Position in the array
 * @param fallAdjacent Boolean, whether the material disperses in the air
 * @param chance How light the material is in the 'air', lower is lighter
 * @returns {boolean}
 */
function doGravity(x, y, i, fallAdjacent, chance) {
	if (random() < chance) {
		if (y === MAX_Y_IDX) {
			renderImageData32[i] = BACKGROUND;
			return true;
		}

		let newI;

		if (fallAdjacent) {
			newI = belowAdjacent(x, y, i, BACKGROUND);
			if (newI === -1) newI = adjacent(x, i, BACKGROUND);
		} else {
			newI = below(y, i, BACKGROUND);
		}

		if (newI !== -1) {
			renderImageData32[newI] = renderImageData32[i];
			renderImageData32[i] = BACKGROUND;
			return true;
		}
	}

	return false;
}


/**
 * Function that simulates the process of an element sinking down through another ala, sand through water.
 * @param x X coordinate.
 * @param y Y coordinate.
 * @param i Max amount of pixels in the canvas
 * @param heavierThan What material it is heavier than.
 * @param sinkAdjacent Whether the material will disperse through another.
 * @param chance The likelihood that an element will disperse through another.
 * @returns {boolean}
 */
function doDensitySink(x, y, i, heavierThan, sinkAdjacent, chance) {
	if (random() >= chance) return false;

	let newI = (sinkAdjacent ? belowAdjacent(x, y, i, heavierThan) : below(y, i, heavierThan));

	if (newI === -1) return false;

	const temp = renderImageData32[i];
	renderImageData32[i] = renderImageData32[newI];
	renderImageData32[newI] = temp;
	return true;
}

/**
 * Simulates growth by changing a random pixel around itself if the pixel is of the same type as the element passed
 * @param x x coordinate
 * @param y y coordinate
 * @param i Position in the canvas array
 * @param type Element that may be replaced (Water replaced by Plant)
 * @param chance Likelihood of this occurring
 * @returns {boolean}
 */
function doGrow(x, y, i, type, chance) {
	if (random() >= chance) return false

	const spread = borderingAdjacent(x, y, i, type)
	if (spread === -1) return false

	renderImageData32[spread] = renderImageData32[i]
}

function doDensityGas(x, y, i, chance) {
	if (random() >= chance) return false;

	if (y === 0) return false;

	const gasElem = renderImageData32[i];

	const aboveSpot = i - width;
	const aboveLeft = aboveSpot - 1;
	const aboveRight = aboveSpot + 1;
	const aboveElem = renderImageData32[aboveSpot];
	if (gasPermeable(aboveElem)) swapSpot = aboveSpot;
	else {
		const aboveLeftElem = x !== 0 ? renderImageData32[aboveLeft] : -1;
		const aboveRightElem = x !== MAX_X_IDX ? renderImageData32[aboveRight] : -1;
		let swapAboveLeft = -1;
		let swapAboveRight = -1;

		if (aboveLeftElem !== aboveElem && gasPermeable(aboveLeftElem)) {
			swapAboveLeft = aboveLeft;
		}

		if (aboveRightElem !== aboveElem) {
			if (swapAboveLeft !== -1 && aboveLeftElem === aboveRightElem)
				swapAboveRight = aboveRight;
			else if (gasPermeable(aboveRightElem)) swapAboveRight = aboveRight;
		}

		swapSpot = __pickRandValid(swapAboveLeft, swapAboveRight);
	}

	if (swapSpot === -1 && x !== 0 && x !== MAX_X_IDX && y !== MAX_Y_IDX) {
		const leftElem = renderImageData32[i - 1];
		if (gasPermeable(leftElem) && renderImageData32[i - 1 + width] !== gasElem) {
			swapSpot = i - 1;
		} else {
			const rightElem = renderImageData32[i + 1];
			if (gasPermeable(rightElem) && renderImageData32[i + 1 + width] !== gasElem) {
				swapSpot = i + 1;
			}
		}
	}

	if (swapSpot === -1) return false;

	renderImageData32[i] = renderImageData32[swapSpot];
	renderImageData32[swapSpot] = gasElem;
	return true;
}

function gasPermeable(elem) {
	/* optimize for common case */
	if (elem !== -1) return elementDict[elem]["gasPermeable"]
}

function doRise(x, y, i, chance, adjacentChance) {
	let newI = -1;

	if (random() < chance) {
		if (y === 0) {
			renderImageData32[i] = BACKGROUND;
			return true;
		} else {
			newI = aboveAdjacent(x, y, i, BACKGROUND);
		}
	}

	if (newI === -1 && random() < adjacentChance)
		newI = adjacent(x, i, BACKGROUND);

	if (newI !== -1) {
		renderImageData32[newI] = renderImageData32[i];
		renderImageData32[i] = BACKGROUND;
		return true;
	}

	return false;
}

function doTransform(x, Y, i, type, transformInto, transformChance) {
	if (random() <= transformChance) {
		const transformLocation = bordering(x, Y, i, type)
		if (transformLocation !== -1) {
			renderImageData32[i] = transformInto
			renderImageData32[transformLocation] = transformInto
		}
	}
}

function doDensityLiquid(x, Y, i, heavierThan, sinkChance, equalizeChance) {
	let ret = -1

	if (random() < sinkChance) ret = belowAdjacent(x, Y, i, heavierThan)

	if (ret === -1 && random() < equalizeChance) {
		ret = adjacent(x, i, heavierThan)
	}

	if (ret === -1) return false

	renderImageData32[ret] = renderImageData32[i]
	renderImageData32[i] = heavierThan
	return true
}

function burnBorders(x, y, i) {
	if (y !== 0) renderImageData32[i - width] = FIRE
	if (x !== 0) renderImageData32[i - 1] = FIRE
	if (x !== MAX_X_IDX) renderImageData32[i + 1] = FIRE
}

function countPixelsOfTypeAround(type, x, y, i) {
	function isOfType(idx, elemType) {
		return renderImageData32[idx] === elemType;
	}

	let count = 0;

	// Check the pixels above and below
	if (y > 0) {
		if (isOfType(i - width, type)) count++; // Above
		if (x > 0 && isOfType(i - width - 1, type)) count++; // Above left
		if (x < width - 1 && isOfType(i - width + 1, type)) count++; // Above right
	}
	if (y < MAX_Y_IDX - 1) {
		if (isOfType(i + width, type)) count++; // Below
		if (x > 0 && isOfType(i + width - 1, type)) count++; // Below left
		if (x < width - 1 && isOfType(i + width + 1, type)) count++; // Below right
	}

	// Check the pixels to the left and right
	if (x > 0 && isOfType(i - 1, type)) count++; // Left
	if (x < width - 1 && isOfType(i + 1, type)) count++; // Right

	return count;
}

function findPixelsOfNotTypeAround([types], x, y, i) {
	function isOfType(idx, elemTypes) {
		for (let j in elemTypes) {
			if (renderImageData32[idx] === elemTypes[j]) {
				return true
			}
		}
		return false
	}

	let locations = [];

	// Check the pixels above and below
	if (y > 0) {
		if (!isOfType(i - width, types)) locations.push(i); // Above
		if (x > 0 && !isOfType(i - width - 1, types)) locations.push(i - width - 1); // Above left
		if (x < width - 1 && !isOfType(i - width + 1, types)) locations.push(i - width + 1); // Above right
	}
	if (y < MAX_Y_IDX - 1) {
		if (!isOfType(i + width, types)) locations.push(i + width); // Below
		if (x > 0 && !isOfType(i + width - 1, types)) locations.push(i + width + 1); // Below left
		if (x < width - 1 && !isOfType(i + width + 1, types)) locations.push(i + width + 1); // Below right
	}

	// Check the pixels to the left and right
	if (x > 0 && !isOfType(i - 1, types)) locations.push(i - 1) // Left
	if (x < width - 1 && !isOfType(i + 1, types)) locations.push(i + 1); // Right

	return locations;
}