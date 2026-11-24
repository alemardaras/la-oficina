// Service worker de La Oficina: permite instalar la app y abrirla rápido.
// La página se pide siempre primero a la red (así cada cambio publicado llega enseguida);
// la copia guardada solo se usa sin conexión. Los datos de ESPN y la música no se guardan.
const CACHE = "laoficina-v1";
const BASE = ["./", "manifest.webmanifest", "iconos/icono-192.png", "iconos/icono-512.png", "iconos/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.endsWith(".mp3")) return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put("./", copia));
      return r;
    }).catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
