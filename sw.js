/* Vatapá do Manel · app instalável. Sempre busca a versão nova na internet; o guardado só serve se estiver sem sinal. */
const CACHE = "vdm-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // banco, Mercado Pago, fontes: sempre direto
  if (url.pathname.endsWith("estoque.txt")) return;           // estoque nunca vem do guardado
  e.respondWith(
    fetch(req).then((r) => {
      if (r.ok && (req.mode === "navigate" || /\.(png|jpg|webmanifest)$/.test(url.pathname))) {
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(req, copia));
      }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((r) => r || caches.match(url.pathname.startsWith("/painel") ? "/painel/" : "/")))
  );
});
