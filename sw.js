// Service Worker Script

const CACHE_NAME = 'my-site-cache-v1';
const OFFLINE_PAGE = '/index.html';

const urlsToCache = [
	OFFLINE_PAGE,
	'/styles.css',
	'/scripts/canvasConfig.js',
	'/scripts/utilities.js',
	'/scripts/Elements.js',
	'/scripts/MenuElements.js',
	'/scripts/game.js',
	'/scripts/Particles.js',
	'/scripts/Cursor.js',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => cache.addAll(urlsToCache))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				// If the request is in the cache, return the cached version
				if (response) {
					return response;
				}

				// If the request is not in the cache, fetch it from the network
				return fetch(event.request)
					.then((response) => {
						// If the response is valid, clone it and add it to the cache
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}

						const responseToCache = response.clone();
						caches.open(CACHE_NAME)
							.then((cache) => cache.put(event.request, responseToCache));

						return response;
					})
					.catch((error) => {
						// Fetch failed, handle the error here
						console.error('Fetch error:', error);
						// Return the offline page
						return caches.match(OFFLINE_PAGE);
					});
			})
	);
});
