const CACHE_NAME = 'app-cache-v5';
const BASE_URL = self.location.pathname.replace(/\/[^/]*$/, ''); // Dynamically get the base path
const PRECACHE_URLS = [
    `${BASE_URL}./`,
    `${BASE_URL}./index.html`,
    `${BASE_URL}./bundle.js`,
    `${BASE_URL}./manifest.json`,
    `${BASE_URL}./icons/icon-192x192.png`,
    `${BASE_URL}./icons/icon-512x512.png`,
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      // Add individually so one 404 doesn’t abort install
      await Promise.all(
        PRECACHE_URLS.map((u) =>
          cache.add(u).catch((err) => console.warn('Skip caching', u, err))
        )
      );
      self.skipWaiting();
    })());
  });

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })());
  });
  
  // Basic SPA handler: cache-first for assets, fallback index.html for navigations
  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.mode === 'navigate') {
      event.respondWith(
        caches.match('./index.html').then((r) => r || fetch(req))
      );
      return;
    }
    event.respondWith(
      caches.match(req).then((r) => r || fetch(req))
    );
  });