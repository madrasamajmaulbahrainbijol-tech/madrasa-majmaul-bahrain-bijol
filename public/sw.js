const CACHE_NAME = "mmbb-static-v1";
const APP_ASSETS = ["/pwa-icon.svg", "/mmbb-logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Only cache the public app icons. Never cache admin, student, auth, API,
// Supabase, or navigation responses because they may contain private data.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname !== "/pwa-icon.svg" && url.pathname !== "/mmbb-logo.svg") return;

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
