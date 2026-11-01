/**
 * P14 service worker — cache-first for this tool's shell.
 * Only this tool's cache names are retired on activate.
 */
const CACHE_NAME = "p14-news-timeline-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./favicon.svg",
  "./app.js",
  "./pm-metrics.js",
  "./manifest.json",
  "../shared/design-tokens.css",
  "../shared/modern-styles.css",
  "../shared/tool-chrome.css",
  "../shared/releases/v2.6/loader.js",
  "../shared/dark-toggle.js"
];

// Install: Pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {
        // Silently skip missing optional files
        return Promise.allSettled(
          CORE_ASSETS.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && (k === "journalism-tool-v1" || k.startsWith("p14-news-timeline-")))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Cache-First for same-origin, Network-First for external
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin API calls
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cache, but also update in background (stale-while-revalidate)
        const fetchPromise = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
