const CACHE_NAME = "presset-v4";

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
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)));
      await self.clients.claim();
    })()
  );
});

/**
 * Estratégia:
 * - Navegação (index.html / requests mode=navigate): NETWORK FIRST
 *   (para sempre atualizar a página e não ficar preso no login antigo / versões antigas)
 * - Demais arquivos: STALE-WHILE-REVALIDATE
 *   (mostra rápido pelo cache, mas atualiza em background)
 */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Navegação: sempre tenta rede primeiro
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match("/APP-PRESSET/index.html"))
    );
    return;
  }

  // Assets: cache rápido, atualiza em background
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});



