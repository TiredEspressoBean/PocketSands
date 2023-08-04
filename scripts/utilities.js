//Set of utility functions

const TWO_PI = 2 * Math.PI;
const HALF_PI = Math.PI / 2;
const QUARTER_PI = Math.PI / 4;
const EIGHTH_PI = Math.PI / 8;
const SIXTH_PI = Math.PI/6
const TWELFTH_PI = Math.PI/12
const SIXTEENTH_PI = Math.PI / 16;
const EIGHTEENTH_PI = Math.PI / 18;

const __num_rand_ints = 8192;
const __rand_ints = new Uint8Array(__num_rand_ints);
let __next_rand = 0;
for (let i = 0; i < __num_rand_ints; i++) {
	__rand_ints[i] = Math.floor(Math.random() * 100);
}


/**
 * The __rand_ints array is populated with a set of random numbers, the random function returns a number from it that it
 * is currently placed on, and then steps forwards into the array.
 * @returns {number}
 */
function random() {
	const ret = __rand_ints[__next_rand];

	__next_rand++;
	if (__next_rand === __num_rand_ints) {
		__next_rand = 0
	}

	return ret;
}

function executeAndTime(func) {
	const start = performance.now()
	func()
	const end = performance.now()
	return end - start
}

function docOffset(elem, offsetProp) {
	let offset = 0;
	do {
		if (!Number.isNaN(elem[offsetProp])) {
			offset += elem[offsetProp];
		}
	} while ((elem = elem.offsetParent));
	return offset;
}