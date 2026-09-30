// sw.js - Service Worker para Radar Táctico MTB v3
const CACHE_NAME = 'mtb-radar-v3';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './zona_verde.mp3',
  './zona_amarilla.mp3',
  './zona_roja.mp3',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'
];

// 1. INSTALACIÓN: Precaching obligatorio de recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        for (const url of urlsToCache) {
          try {
            await cache.add(url);
            console.log(`[SW] Precacheado con éxito: ${url}`);
          } catch (err) {
            console.warn(`[SW] Aviso: No se pudo precachear ${url}:`, err);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// 2. ACTIVACIÓN: Limpieza de cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Purgando caché previa:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Estrategia de entrega rápida
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Audios MP3: Cache-First
  if (url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.match(event.request).then(cachedAudio => {
        return cachedAudio || fetch(event.request).then(networkResp => {
          if (networkResp && networkResp.status === 200) {
            const clone = networkResp.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return networkResp;
        });
      })
    );
    return;
  }

  // Resto de recursos (HTML, JS, CSS)
  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      return cachedResp || fetch(event.request).then(networkResp => {
        return networkResp;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
