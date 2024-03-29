/**
 * Service workers scripting for some basic functions
 */


const CACHE_NAME = 'The-sand-trap';

const urlsToCache = [
	'/index.html',
	'/styles.css',
	'/manifest.json',
	'scripts/canvasConfig.js',
	'scripts/Cursor.js',
	'scripts/Elements.js',
	'scripts/GameEngine.js',
	'scripts/MenuElements.js',
	'scripts/Particles.js',
	'scripts/utilities.js'
];

/**
 * Caches everything on install
 */
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		})
	);
});

/**
 * Upon fetch request checks if there's already a cache, if not updates the sand trap cache
 */
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// If the request is found in the cache, return the cached response
			if (response) {
				return response;
			}

			// If the request is not found in the cache, fetch it from the network
			return fetch(event.request).then((fetchResponse) => {
				// Cache the fetched response for future requests
				return caches.open(CACHE_NAME).then((cache) => {
					cache.put(event.request, fetchResponse.clone());
					return fetchResponse;
				});
			});
		})
	);
});