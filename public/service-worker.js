self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open('my-pwa-cache').then((cache) => {
            console.log('Service Worker: Caching files during installation');
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/styles/App.css',
                '/src/index.js',
                '/src/App.js',
                '/src/components/LoadComponent.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Fetching ', event.request.url);
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});