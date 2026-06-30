/* Honest Need — minimal service worker.
 *
 * Its primary job is to make the app installable (Chrome/Edge only fire the
 * `beforeinstallprompt` event for a page controlled by a service worker that
 * has a fetch handler). We deliberately keep caching conservative — a stale
 * precache on a fast-moving app causes more harm than good — so this is a
 * pass-through network handler with an offline-safe navigation fallback.
 */

const VERSION = 'hn-sw-v1';

self.addEventListener('install', () => {
  // Activate immediately so installability is detected on first visit.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET; let the browser deal with everything else.
  if (request.method !== 'GET') return;

  // Network-first; if offline on a navigation, fall back to the cached root.
  event.respondWith(
    fetch(request).catch(async () => {
      if (request.mode === 'navigate') {
        const cache = await caches.open(VERSION);
        const cached = await cache.match('/');
        if (cached) return cached;
      }
      return Response.error();
    })
  );
});
