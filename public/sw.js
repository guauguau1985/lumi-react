// public/sw.js

const CACHE_NAME = "lumi-cache-v1";

// Archivos mínimos que queremos tener cacheados de entrada
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
];

// Instalación: precache de core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: limpieza de caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Estrategia de fetch:
// - Navegación (HTML): network-first con fallback a offline.html
// - Otros (JS/CSS/img): cache-first con fallback a red
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET
  if (request.method !== "GET") return;

  const isHtml =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isHtml) {
    // HTML → intenta red, si falla → offline.html
    event.respondWith(
      fetch(request).catch(() => caches.match("./offline.html"))
    );
  } else {
    // Assets → cache first
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
  }
});
