// Bump this on any change to this file or PRECACHE_URLS — it's what
// invalidates old caches in `activate` below. It does NOT gate whether
// browsers detect the update at all (they diff sw.js by bytes regardless
// of this string); it only controls old-cache cleanup.
const CACHE_VERSION = "v2";
const STATIC_CACHE = `roora-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API routes (including authenticated media/file streaming) are never
  // cached — always hit the network so data, auth, and moderation state
  // stay correct.
  if (url.pathname.startsWith("/api/")) return;

  // Page navigations: network-first so guests always see fresh content
  // when online; fall back to the offline shell when the network fails.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Hashed static assets and app icons: cache-first, since their URLs
  // change whenever their content does.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
  }
});
