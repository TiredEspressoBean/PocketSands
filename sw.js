self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('my-cache').then((cache) => {
			return cache.addAll([
				'index.html',
				//'/icon-72x72.png',
				// Add more files to cache here
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