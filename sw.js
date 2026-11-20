// Học Tiếng Trung — Hán Ngữ Studio Service Worker (v13.1)
const CACHE_NAME = 'htq-studio-v13.1';
const SHELL_PRECACHE = [
  '/',
  '/hoc/',
  '/on-tap/',
  '/tra-chu/',
  '/site.webmanifest',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_PRECACHE).catch(() => {})).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (!req || req.method !== 'GET') return;
  let url;
  try {
    url = new URL(req.url);
  } catch (_) {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/v1/') ||
    url.pathname.startsWith('/v2/') ||
    url.pathname.startsWith('/monitoring') ||
    url.search.includes('_rsc=')
  ) {
    return;
  }

  // Stale-While-Revalidate for JSON datasets so they stay fast AND receive data fixes
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) => {
          const networkFetch = fetch(req).then((res) => {
            if (res && res.ok) {
              const ct = res.headers.get('content-type') || '';
              if (!url.pathname.endsWith('.json') || !ct.includes('text/html')) {
                cache.put(req, res.clone()).catch(() => {});
              }
            }
            return res;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // Cache-First for hashed Next static assets
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }

  // Network-First for runtime JS and HTML documents so updates deploy immediately
  if (req.mode === 'navigate' || url.pathname === '/xiehanzi-runtime.js' || url.pathname === '/site.webmanifest' || url.pathname === '/manifest.webmanifest') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('/')))
    );
  }
});
