const CACHE_NAME = 'tk-kasse-v3';
const BASE = '/tambourkorps-kasse/';

// Nur die statischen Shell-Dateien precachen
const APP_SHELL = [
  BASE + 'manifest.json',
  BASE + 'icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(APP_SHELL).catch(err => console.warn('[SW] shell cache fail:', err)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('api.github.com')) return;
  if (e.request.url.includes('fonts.googleapis.com')) return;
  if (e.request.url.includes('fonts.gstatic.com')) return;

  const url = new URL(e.request.url);

  // Gehashte Vite-Assets (/assets/index-XYZ.js) → Cache First (unveränderlich)
  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML + alle anderen Dateien → Network First, Cache als Fallback
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(c => c.put(e.request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(e.request).then(cached => cached ?? caches.match(BASE)))
  );
});
