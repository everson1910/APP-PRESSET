const CACHE_NAME = "presset-v3";

const FILES_TO_CACHE = [
  "/APP-PRESSET/",
  "/APP-PRESSET/index.html",
  "/APP-PRESSET/style.css",
  "/APP-PRESSET/app.js",
  "/APP-PRESSET/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests.
  if (event.request.method !== "GET") return;

  // For navigation (HTML), prefer the network so updates show up immediately.
  const isNavigate =
    event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").includes("text/html");

  if (isNavigate) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For other assets, use stale-while-revalidate:
  // serve from cache if available, while updating in the background.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
