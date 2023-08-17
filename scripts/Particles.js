/**
 * COMPENDIUM OF THE PARTICLES
 *
 * This file is broken up into ___ sections
 *      Initialization      - Describing the elements and making them very easily accessible
 *      Description         - Giving the particles their behaviours
 *      Classes             - Set up of the base particle class and the particles class which handles the particle pools
 *      Update Particles    - Function that controls how the particles are updated
 *
 *
 * As elements are very simple pixels that have a rudimentary understanding of their surroundings, particles are then
 * used for more complicated circumstances, like larger explosions than the set of adjacent particles and trees.
 *
 * PARTICLE ADDING TUTORIAL - Add new particles by first adding any new colors(elements) that will be used on the
 * canvas to the particleDictionary , then adding the init and Action to describe their behavior. Their behavior should
 * be more complicated than cellular automata rules so use the particle class for the storing of information and
 * describing how they operate.
 *
 */



const PAINTABLE_PARTICLE_COLORS = [FIRE, BRANCH, LEAF];

/**
 * Add new particles here
 */
const particleDictionary = {
	UNKNOWN_PARTICLE:{INIT: UNKNOWN_PARTICLE_INIT, action:UNKNOWN_PARTICLE_ACTION},
	C4_PARTICLE:{INIT: C4_PARTICLE_INIT, action: C4_PARTICLE_ACTION},
	METHANE_PARTICLE:{INIT: METHANE_INIT, action: METHANE_ACTION},
	TREE_PARTICLE:{INIT: TREE_PARTICLE_INIT, action: TREE_PARTICLE_ACTION}
}
Object.freeze(particleDictionary)

/**
 * Spins up the particles and the particle canvas
 */
function initParticles() {
	particles = new ParticleList(MAX_NUM_PARTICLES);

	// Set the width and height of the offscreenParticleCanvas
	offscreenParticleCanvas.width = width;
	offscreenParticleCanvas.height = height;
}

/**
 * Base particle that shouldn't really ever be used
 * @param particle
 * @constructor
 */
function UNKNOWN_PARTICLE_INIT(particle) {}
function UNKNOWN_PARTICLE_ACTION(particle) {
	throw "Unknown particle";
}

/**
 * Initiailizer for the C4 particles properties
 * @param particle
 * @constructor
 */
function C4_PARTICLE_INIT(particle) {
	particle.color = FIRE;

	const rand = Math.random() * 10000;
	if (rand < 9000) {
		particle.size = Math.random() * 10 + 3;
	} else if (rand < 9500) {
		particle.size = Math.random() * 32 + 3;
	} else if (rand < 9800) {
		particle.size = Math.random() * 64 + 3;
	} else {
		particle.size = Math.random() * 128 + 3;
	}
}

/**
 * Behavior for the C4 particle
 * @param particle
 * @param i Where the particle is in terms of the pool so we don't need to go searching for it
 * @constructor
 */
function C4_PARTICLE_ACTION(particle, i) {
	particle.drawCircle(particle.size);

	if (particle.actionIterations >= 3) {
		particle.size /= 3;
		if (particle.size <= 1) particles.makeParticleInactive(particle, i);
	}
}

/**
 * Initiailizer for the Methane particles properties
 * @param particle
 * @constructor
 */
function METHANE_INIT(particle){
	particle.color = FIRE
	particle.size = (random())/10 + 10
}

/**
 * Behavior for the Methane particle
 * @param particle
 * @param i Where the particle is in terms of the pool so we don't need to go searching for it
 * @constructor
 */
function METHANE_ACTION(particle, i){

	particle.drawCircle(particle.size)
	if (particle.actionIterations > 2) particles.makeParticleInactive(particle, i)
}

/**
 * Base class for the Tree particle system
 */
class TreeType {
	constructor() {
		throw "Should never actually instantiate this.";
	}
}

/**
 * Fairly normal looking tree
 */
class Tree0 extends TreeType {
	static lSystemRule = 'X->F[-X][+X]';

	/** @nocollapse */
	static initTreeParticle(p, oldP) {
		// Apply L-system rule to generate initial state of the tree particle
		if (!p.treeState) {
			p.angle = -HALF_PI; // Initial angle (facing upward)
			p.treeState = this.applyLSystemRule('X', 4); // Start with 'X', and iterate 3 times
		}
	}

	// Helper function to apply L-system rule
	static applyLSystemRule(axiom, iterations) {
		let result = axiom;
		for (let i = 0; i < iterations; i++) {
			result = result.replaceAll('X', 'F[-X][+X]'); // Replace X with the new branching rule
		}
		return result;
	}
}

/**
 * Leaning tree from left to right
 */
class Tree1 extends TreeType {
	static lSystemRule = 'F=FF, X=F-[[X]+X]+F[+FX]-X'

	/** @ncollapse */
	// Apply L-system rule to generate initial state of the tree particle
	static initTreeParticle(p, oldP){
		if (!p.treeState){
			p.angle = -HALF_PI
			p.treeState = this.applyLSystemRule('X', 4)
			p.branchLength = 2
		}
	}

	// Helper function to apply L-system rule
	static applyLSystemRule(axiom, iterations) {
		let result = axiom;
		for (let i = 0; i < iterations; i++) {
			result = result.replaceAll('F', 'FF'); // Replace X with the new branching rule
			result = result.replaceAll('X', 'F-[[X]+X]+F[+FX]-X');
		}
		return result;
	}
}

/**
 * Kind of a jungly looking tree that 'swirls' around a central axis
 */
class Tree2 extends TreeType {
	static lSystemRule = 'F=F[+F]F[-F]F';

	/** @nocollapse */
	static initTreeParticle(p, oldP) {
		// Apply L-system rule to generate initial state of the tree particle
		if (!p.treeState) {
			p.angle = -HALF_PI; // Initial angle (facing upward)
			p.treeState = this.applyLSystemRule('F', 4); // Start with 'X', and iterate 3 times
			p.branchLength = 5
		}
	}

	// Helper function to apply L-system rule
	static applyLSystemRule(axiom, iterations) {
		let result = axiom;
		for (let i = 0; i < iterations; i++) {
			result = result.replaceAll('F', '[+F]F[-F]F'); // Replace X with the new branching rule
		}
		return result;
	}
}

const TREE_TYPES = [
	Tree0,
	Tree1,
	Tree2,
];

const NUM_TREE_TYPES = TREE_TYPES.length;

/**
 * Initializer for the Tree particles
 * @param particle
 * @constructor
 */
function TREE_PARTICLE_INIT(particle) {
	particle.color = BRANCH;
	particle.size = Math.floor(Math.random() * 4) + 2;

	particle.maxBranches = 1 + Math.round(Math.random() * 2);
	particle.angleStack = []; // Initialize angleStack array
	particle.positionStack = [];
	particle.branchLength = 10// Initialize positionStack array

	/* make it more likely to be a standard tree */
	if (random() < 62) {
		particle.treeType = 0;
	} else {
		particle.treeType = 1 + Math.floor(Math.random() * NUM_TREE_TYPES - 1);
	}

	particle.treeType = particle.treeType;
	particle.lSystemRule = TREE_TYPES[particle.treeType].lSystemRule;

	TREE_TYPES[particle.treeType].initTreeParticle(particle, null);
}

/**
 * Behavior of the tree particles
 * @param particle
 * @constructor
 */
function TREE_PARTICLE_ACTION(particle) {
	// Use the current state of the tree particle, obtained from L-system rule
	let currentState = particle.treeState;
	if (currentState.length === 0) {
		// End of the tree, make the particle inactive and return
		particles.makeParticleInactive(particle);
		return;
	}
	if (currentState.length === 1 || currentState[1] === ']'){
		particle.color = LEAF
		particle.setColor(LEAF)
	}
	else {
		if(particle.color === LEAF){
			particle.color = BRANCH
			particle.setColor(BRANCH)
		}
	}

	// Get the current command (character) from the tree state
	const command = currentState.charAt(0);
	currentState = currentState.substring(1); // Move to the next symbol

	// Process the command
	if (command === 'F' || command === 'X') {
		// Move the particle forward (update the x and y positions based on branchLength and angle)

		offscreenParticleCtx.beginPath();
		offscreenParticleCtx.lineWidth = particle.size;
		offscreenParticleCtx.strokeStyle = particle.rgbaColor;
		offscreenParticleCtx.lineCap = "round";
		offscreenParticleCtx.moveTo(particle.x, particle.y);
		particle.x += particle.branchLength * Math.cos(particle.angle) * (particle.size/3);
		particle.y += particle.branchLength * Math.sin(particle.angle) * (particle.size/3);
		offscreenParticleCtx.lineTo(particle.x, particle.y);
		offscreenParticleCtx.stroke();
	} else if (command === '+') {
		// Turn right
		particle.angle += EIGHTH_PI; // You may use a different angle value depending on the specific L-system rules
	} else if (command === '-') {
		// Turn left
		particle.angle -= EIGHTH_PI; // You may use a different angle value depending on the specific L-system rules
	} else if (command === '[') {
		// Save the current angle and position on the stack
		particle.angleStack.push(particle.angle);
		particle.positionStack.push({ x: particle.x, y: particle.y });
	} else if (command === ']') {
		// Pop the angle and position from the stack to return to the previous branching point
		particle.angle = particle.angleStack.pop();
		const prevPosition = particle.positionStack.pop();
		particle.x = prevPosition.x;
		particle.y = prevPosition.y;
	}

	// Update the tree state for the next iteration
	particle.treeState = currentState;
}


/**
 * Base for the paritcle that is augmented during the particle init above
 */
class Particle {
	constructor() {
		this.type = "UNKNOWN_PARTICLE";
		this.initX = -1;
		this.initY = -1;
		this.x = -1;
		this.y = -1;
		this.i = -1;
		this.color = 0;
		this.rgbaColor = "rgba(0, 0, 0, 1)";
		this.velocity = 0;
		this.angle = 0;
		this.xVelocity = 0;
		this.yVelocity = 0;
		this.size = 1;
		this.actionIterations = 0;
		this.active = false;
		this.reinitialized = false;
	}

	/**
	 * Go back from hex color to the rgb value which the canvas api uses since we're doing circles and such instead
	 * of manipulating each pixel
	 * @param hexColor
	 */
	setColor(hexColor) {
		if (PAINTABLE_PARTICLE_COLORS.includes(hexColor)) {
			this.color = hexColor;

			const r = hexColor & 0xff;
			const g = (hexColor & 0xff00) >>> 8;
			const b = (hexColor & 0xff0000) >>> 16;
			this.rgbaColor = `rgba(${r},${g},${b}, 1)`;
		} else {
			console.log("Unpaintable particle color: " + hexColor);
		}
	}


	drawCircle(radius) {
		offscreenParticleCtx.beginPath();
		offscreenParticleCtx.lineWidth = 0;
		offscreenParticleCtx.fillStyle = this.rgbaColor;
		offscreenParticleCtx.arc(this.x, this.y, radius, 0, TWO_PI);
		offscreenParticleCtx.fill();
	}

}

/**
 * Pool based data structure that contains the pool of all possible particles and manipulates them.
 * Went with this structure so I'm not constantly making new objects, just recycling the ones I already made and have
 * a natural limiter to the amount of particles on the screen possible. Good method for dealing with javascript garbage
 * collection causing spikes in lag.
 */
class ParticleList {
	constructor(poolSize) {
		this.pool = new Array(poolSize);
		this.activeSize = 0;
		this.inactiveSize = poolSize;

		// Initialize the pool with particles
		for (let i = 0; i < poolSize; i++) {
			this.pool[i] = this.createParticle();
		}
	}

	createParticle() {
		return new Particle()
	}

	/**
	 * Finds the first inactive particle it can and returns it, while accounting internally the change made so we don't
	 * end up using more than is actually available
	 * @returns {any|null}
	 */
	getInactiveParticle() {
		if (this.inactiveSize === 0) return null;

		for (let i = 0; i < this.inactiveSize; i++) {
			const particle = this.pool[i];
			if (particle.type === "UNKNOWN_PARTICLE") {
				particle.active = true;
				this.activeSize++;
				this.inactiveSize--;
				return particle;
			}
		}

		return null; // If no UNKNOWN_PARTICLE is found, return null
	}

	/**
	 * Creates a 'new' particle based on the properties described in the respective init
	 * @param type
	 * @param x X coordinate
	 * @param y Y coorindate
	 * @param i Index in the pool
	 * @returns {*|null}
	 */
	addActiveParticle(type, x, y, i) {
		const particle = this.getInactiveParticle();
		if (!particle) return null;

		//Set the base properties of the particle
		particle.type = type;
		particle.initX = x;
		particle.initY = y;
		particle.x = x;
		particle.y = y;
		particle.i = i;
		particle.reinitialized = false;
		particle.actionIterations = 0;

		// Call the particle initializer
		particleDictionary[type]["INIT"](particle);

		// Set particle color properties
		particle.setColor(particle.color);

		// Return the particle
		return particle;
	}

	/**
	 * Makes the particle no longer of the specified type that it was and augments the respective sizes of the lists
	 * for internal accounting
	 * @param particle
	 * @param i
	 */
	makeParticleInactive(particle, i) {
		particle.active = false;
		particle.type = "UNKNOWN_PARTICLE";

		// Move the particle to the inactive pool
		particles.pool[i] = particle;
		particles.activeSize--;
		particles.inactiveSize++;
	}

	/**
	 * Zooms through the whole array and makes everything inactive
	 */
	inactiveAll(){
		this.pool.forEach(function(particle){
			if (particle.active === true){
				particle.active = false;
				particle.type = "UNKNOWN_PARTICLE";

				particles.activeSize--;
				particles.inactiveSize++;
			}
		})
	}
}

let particles = new ParticleList(MAX_NUM_PARTICLES)

/**
 * Function that goes through the particle pool, calls their actions, and puts the actions onto the modelCanvas.
 */
function updateParticles() {
	if (particles.activeSize === 0) return;
	const canvasWidth = offscreenParticleCanvas.width;
	const canvasHeight = offscreenParticleCanvas.height;

	/* reset the particle canvas */
	offscreenParticleCtx.beginPath();
	offscreenParticleCtx.fillStyle = "rgba(0, 0, 0, 1)";
	offscreenParticleCtx.rect(0, 0, canvasWidth, canvasHeight);
	offscreenParticleCtx.fill();

	const particleSize = particles.pool.length;
	let activeSizeIterable = particles.activeSize

	// We go through the whole pool which is of relatively modest size and decrement the activeSizeIterable and stop
	// once we have gone through each particle
	for (let i = 0; i < particleSize; i++) {
		if (activeSizeIterable !== 0) {
			const particle = particles.pool[i];
			if (particle.type !== "UNKNOWN_PARTICLE") {
				particle.actionIterations++;
				particleDictionary[particle.type]["action"](particle, i);

				// Add the following check to limit branches for TREE_PARTICLE
				if (particle.type === "TREE_PARTICLE" && particle.branches >= particle.maxBranches) {
					particles.makeParticleInactive(particle, i);
				}
				activeSizeIterable--
			}
		}
	}

	//Start moving the particle image Data to the modelCanvas
	const particleImageData = offscreenParticleCtx.getImageData(
		0,
		0,
		canvasWidth,
		canvasHeight
	);
	const particleImageData32 = new Uint32Array(particleImageData.data.buffer);
	let x, y;
	let yOffset = 0;
	const aliasingSearchDistance = 3;
	//Go through the canvas pixel by pixel and if not background aka all black then place the pixel on the modelCanvas
	for (y = 0; y !== canvasHeight; y++) {
		for (x = 0; x !== canvasWidth; x++) {
			const i = x + yOffset;
			const particleColor = particleImageData32[i];

			//If background continue
			if (particleColor === 0xff000000) continue;
			if (PAINTABLE_PARTICLE_COLORS.includes(particleColor)) {
				renderImageData32[i] = particleColor;
				continue;
			}
		}
		yOffset += canvasWidth;
	}
}
