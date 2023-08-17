/**
 * Series of utility functions necessary for the game functions from a base mathematical perspective, so we aren't
 * calculating them over and over again. Mainly just for the use of random and calculating performance.
 */

const TWO_PI = 2 * Math.PI;
const HALF_PI = Math.PI / 2;
const EIGHTH_PI = Math.PI / 8;

const num_rand_ints = 8192;
const rand_ints = new Uint8Array(num_rand_ints);
let next_rand = 0;

/**
 * Run through and populate the array with as many random integers from 1-100 as it can handle
 */
for (let i = 0; i < num_rand_ints; i++) {
	rand_ints[i] = Math.floor(Math.random() * 100);
}

/**
 * The rand_ints array is populated with a set of random numbers, the random function returns a number from it that it
 * is currently placed on, and then steps forwards into the array.
 * @returns {number}
 */
function random() {
	const ret = rand_ints[next_rand];

	next_rand++;
	if (next_rand === num_rand_ints) {
		next_rand = 0
	}

	return ret;
}

/**
 * Records the amount of time that functions take, called when there's frame debt occurring to try and redo more updates
 * in the same frame and catch up to where it needs to be
 * @param func
 * @returns {number}
 */
function executeAndTime(func) {
	const start = performance.now()
	func()
	const end = performance.now()
	return end - start
}