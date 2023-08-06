self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('my-cache').then((cache) => {
			return Promise.all([
				fetch('/index.html').then((response) => cache.put('/index.html', response)),
				fetch('/manifest.json').then((response) => cache.put('/manifest.json', response)),
				// Add more fetch requests for other resources here
			]);
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});