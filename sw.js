self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Basit fetch handler - PWA kriteri için gerekli
  e.respondWith(fetch(e.request));
});
