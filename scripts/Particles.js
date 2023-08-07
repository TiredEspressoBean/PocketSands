const particleDictionary = {
	UNKNOWN_PARTICLE:{INIT: UNKNOWN_PARTICLE_INIT, action:UNKNOWN_PARTICLE_ACTION},
	C4_PARTICLE:{INIT: C4_PARTICLE_INIT, action: C4_PARTICLE_ACTION},
	METHANE_PARTICLE:{INIT: METHANE_INIT, action: METHANE_ACTION},
	TREE_PARTICLE:{INIT: TREE_PARTICLE_INIT, action: TREE_PARTICLE_ACTION}
}
Object.freeze(particleDictionary)

function UNKNOWN_PARTICLE_INIT(particle) {}
function UNKNOWN_PARTICLE_ACTION(particle) {
	throw "Unknown particle";
}

function C4_PARTICLE_INIT(particleProperties) {
	particleProperties.color = FIRE;

	const rand = Math.random() * 10000;
	if (rand < 9000) {
		particleProperties.size = Math.random() * 10 + 3;
	} else if (rand < 9500) {
		particleProperties.size = Math.random() * 32 + 3;
	} else if (rand < 9800) {
		particleProperties.size = Math.random() * 64 + 3;
	} else {
		particleProperties.size = Math.random() * 128 + 3;
	}
}

function C4_PARTICLE_ACTION(particle, i) {
	particle.drawCircle(particle.size);

	if (particle.actionIterations >= 3) {
		particle.size /= 3;
		if (particle.size <= 1) particles.makeParticleInactive(particle, i);
	}
}

function METHANE_INIT(particleProperties, i){
	particleProperties.color = FIRE
	particleProperties.size = (random())/10 + 10
}

function METHANE_ACTION(particle, i){

	particle.drawCircle(particle.size)
	if (particle.actionIterations > 2) particles.makeParticleInactive(particle, i)
}

class TreeType {
	constructor() {
		throw "Should never actually instantiate this.";
	}

	/** @nocollapse */
	static initTreeParticle(p, oldP) {}

	/** @nocollapse */
	static branchAngles(treeParticle) {
		throw "Branch angles not implemented.";
	}

	/** @nocollapse */
	static branchSpacingFactor(treeParticle) {
		throw "Branch spacing factor not implemented.";
	}
}

/* Standard tree */
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

class Tree1 extends TreeType {
	static lSystemRule = 'F=FF, X=F-[[X]+X]+F[+FX]-X'

	/** @ncollapse */
	static initTreeParticle(p, oldP){
		if (!p.treeState){
			p.angle = -HALF_PI
			p.treeState = this.applyLSystemRule('X', 4)
			p.branchLength = 2
		}
	}
	static applyLSystemRule(axiom, iterations) {
		let result = axiom;
		for (let i = 0; i < iterations; i++) {
			result = result.replaceAll('F', 'FF'); // Replace X with the new branching rule
			result = result.replaceAll('X', 'F-[[X]+X]+F[+FX]-X');
		}
		return result;
	}
}

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

	setRandomColor(whitelist) {
		const colorIdx = Math.floor(Math.random() * whitelist.length);
		this.setColor(whitelist[colorIdx]);
	}

	offCanvas() {
		const x = this.x;
		const y = this.y;
		return x < 0 || x > MAX_X_IDX || y < 0 || y > MAX_Y_IDX;
	}

	setVelocity(velocity, angle) {
		this.velocity = velocity;
		this.angle = angle;
		this.xVelocity = velocity * Math.cos(angle);
		this.yVelocity = velocity * Math.sin(angle);
	}

	aboutToHit() {
		const radius = this.size / 2;
		const theta = Math.atan2(this.yVelocity, this.xVelocity);
		const xPrime = this.x + Math.cos(theta) * radius;
		const yPrime = this.y + Math.sin(theta) * radius;
		const idx = Math.round(xPrime) + Math.round(yPrime) * width;

		if (idx < 0 || idx > MAX_IDX) return BACKGROUND;

		return renderImageData32[idx];
	}

	drawCircle(radius) {
		offscreenParticleCtx.beginPath();
		offscreenParticleCtx.lineWidth = 0;
		offscreenParticleCtx.fillStyle = this.rgbaColor;
		offscreenParticleCtx.arc(this.x, this.y, radius, 0, TWO_PI);
		offscreenParticleCtx.fill();
	}

}

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

	addActiveParticle(type, x, y, i) {
		const particle = this.getInactiveParticle();
		if (!particle) return null;

		// Create an object to hold particle properties
		const particleProperties = {
			color: 0,
			size: 0,
			velocity: 0,
			angle: 0,
			xVelocity: 0,
			yVelocity: 0,
			generation: 0,
			branchSpacing: 0,
			maxBranches: 0,
			nextBranch: 0,
			branches: 0,
			treeType: 0,
			angleStack: [],
		};

		particleProperties.type = type;
		particleProperties.initX = x;
		particleProperties.initY = y;
		particleProperties.x = x;
		particleProperties.y = y;
		particleProperties.i = i;

		// Call the particle initializer
		particleDictionary[type]["INIT"](particleProperties);

		// Set particle properties
		particle.reinitialized = false;
		particle.actionIterations = 0;
		particle.type = type;
		particle.setColor(particleProperties.color);
		particle.size = particleProperties.size;
		particle.velocity = particleProperties.velocity;
		particle.angle = particleProperties.angle;
		particle.xVelocity = particleProperties.xVelocity;
		particle.yVelocity = particleProperties.yVelocity;
		particle.generation = particleProperties.generation;
		particle.branchSpacing = particleProperties.branchSpacing;
		particle.maxBranches = particleProperties.maxBranches;
		particle.nextBranch = particleProperties.nextBranch;
		particle.branches = particleProperties.branches;
		particle.treeType = particleProperties.treeType;
		particle.treeState = particleProperties.treeState
		particle.angleStack = particleProperties.angleStack;
		particle.positionStack = particleProperties.positionStack
		particle.initX = particleProperties.initX;
		particle.initY = particleProperties.initY;
		particle.x = particleProperties.x;
		particle.y = particleProperties.y;
		particle.i = particleProperties.i;
		particle.branchLength = particleProperties.branchLength

		// Return the particle
		return particle;
	}


	makeParticleInactive(particle, i) {
		particle.active = false;
		particle.type = "UNKNOWN_PARTICLE";

		// Move the particle to the inactive pool
		particles.pool[i] = particle;
		particles.activeSize--;
		particles.inactiveSize++;
	}

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

const PAINTABLE_PARTICLE_COLORS = [FIRE, BRANCH, LEAF];

function initParticles() {
	particles = new ParticleList(MAX_NUM_PARTICLES);

	// Set the width and height of the offscreenParticleCanvas
	offscreenParticleCanvas.width = width;
	offscreenParticleCanvas.height = height;
}

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

	for (let i = 0; i < particleSize; i++) {
		const particle = particles.pool[i];
		if (particle.type !== "UNKNOWN_PARTICLE") {
			particle.actionIterations++;
			particleDictionary[particle.type]["action"](particle, i);

			// Add the following check to limit branches for TREE_PARTICLE
			if (particle.type === "TREE_PARTICLE" && particle.branches >= particle.maxBranches) {
				particles.makeParticleInactive(particle, i);
			}
		}
	}

	/* move particle draw state to main canvas */
	const particleImageData = offscreenParticleCtx.getImageData(
		0,
		0,
		canvasWidth,
		canvasHeight
	);
	const particleImageData32 = new Uint32Array(particleImageData.data.buffer);
	let x, y;
	let __yOffset = 0;
	const aliasingSearchDistance = 3;
	for (y = 0; y !== canvasHeight; y++) {
		const yOffset = __yOffset; /* optimization: make const copy */
		for (x = 0; x !== canvasWidth; x++) {
			const i = x + yOffset;
			const particleColor = particleImageData32[i];

			if (particleColor === 0xff000000) continue;
			if (PAINTABLE_PARTICLE_COLORS.includes(particleColor)) {
				renderImageData32[i] = particleColor;
				continue;
			} else {
				let searchColor;
				if (x - aliasingSearchDistance >= 0) {
					searchColor = particleImageData32[i - aliasingSearchDistance];
					if (PAINTABLE_PARTICLE_COLORS.includes(particleColor)) {
						renderImageData32[i] = searchColor;
						continue;
					}
				}
				if (x + aliasingSearchDistance <= MAX_X_IDX) {
					searchColor = particleImageData32[i + aliasingSearchDistance];
					if (PAINTABLE_PARTICLE_COLORS.includes(particleColor)) {
						renderImageData32[i] = searchColor;
						continue;
					}
				}
				if (y - aliasingSearchDistance >= 0) {
					searchColor = particleImageData32[i - aliasingSearchDistance * width];
					if (PAINTABLE_PARTICLE_COLORS.includes(particleColor)) {
						renderImageData32[i] = searchColor;
						continue;
					}
				}
				if (y + aliasingSearchDistance <= MAX_Y_IDX) {
					searchColor = particleImageData32[i + aliasingSearchDistance * width];
					if (PAINTABLE_PARTICLE_COLORS.includes(particleColor)) {
						renderImageData32[i] = searchColor;
						continue;
					}
				}
			}
		}
		__yOffset += canvasWidth;
	}
}
