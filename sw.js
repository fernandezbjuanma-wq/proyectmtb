// sw.js - Service Worker para Radar Táctico MTB v9 (Diseño V2 Verde Táctico + Mapas Offline)
const CACHE_NAME = 'mtb-radar-v9';
const TILE_CACHE_NAME = 'mtb-map-tiles-v1';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Vuelta_ciclística_por_la_mañana.gpx',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js'
];

const TILE_HOSTS = [
  'tile.openstreetmap.org',
  'tile-cyclosm.openstreetmap.fr',
  'server.arcgisonline.com',
  'tile.opentopomap.org',
  'basemaps.cartocdn.com'
];

function esUrlDeTileMapa(urlObj) {
  return TILE_HOSTS.some(host => urlObj.hostname.includes(host));
}

// 1. INSTALACIÓN: Precaching obligatorio de recursos base y track GPX de referencia
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

// 2. ACTIVACIÓN: Limpieza de cachés antiguas preservando los mapas offline descargados
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME && name !== TILE_CACHE_NAME) {
            console.log('[SW] Purgando caché previa:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Estrategia Cache-First para Tiles de Mapas Offline y App Shell
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // A) TILES DE MAPAS (OpenStreetMap / Esri / Topo / Carto): Cache-First persistente
  if (esUrlDeTileMapa(url)) {
    event.respondWith(
      caches.open(TILE_CACHE_NAME).then(async tileCache => {
        const cachedTile = await tileCache.match(event.request, { ignoreSearch: true });
        if (cachedTile) {
          return cachedTile;
        }
        try {
          const networkResp = await fetch(event.request);
          if (networkResp && (networkResp.status === 200 || networkResp.type === 'opaque')) {
            tileCache.put(event.request, networkResp.clone());
          }
          return networkResp;
        } catch (err) {
          // Tile SVG táctico oscuro de respaldo cuando no hay señal en el cerro
          const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="#141821"/>
            <path d="M 0 64 L 256 64 M 0 128 L 256 128 M 0 192 L 256 192 M 64 0 L 64 256 M 128 0 L 128 256 M 192 0 L 192 256" stroke="#1e2533" stroke-width="1"/>
            <text x="128" y="128" fill="#3b4758" font-family="sans-serif" font-size="10" text-anchor="middle">MODO MONTAÑA OFFLINE</text>
          </svg>`;
          return new Response(svgFallback, {
            status: 200,
            headers: { 'Content-Type': 'image/svg+xml' }
          });
        }
      })
    );
    return;
  }

  // B) Resto de recursos de la App (HTML, JS, CSS, GPX)
  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      return cachedResp || fetch(event.request).then(networkResp => {
        if (networkResp && networkResp.status === 200 && url.origin === self.location.origin) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return networkResp;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
