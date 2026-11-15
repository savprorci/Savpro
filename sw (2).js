/* SAV PRO CI : service worker (PWA)
   - Coquille de l'appli en cache pour un démarrage rapide et un mode hors ligne.
   - Pages : réseau d'abord (toujours la dernière version en ligne), cache en secours.
   - Photos et polices : cache d'abord / mise à jour en arrière-plan.
   - Données Supabase (catalogue, comptes, 2FA, ventes, journal) : jamais mises en cache. */
const VERSION = "savpro-v1";
const SHELL = VERSION + "-shell";
const MEDIA = VERSION + "-media";
const MAX_MEDIA = 200;
const PRECACHE = ["./", "index.html", "admin.html", "config.js", "offline.html", "manifest.webmanifest",
                  "icons/icon-192.png", "icons/icon-512.png", "icons/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(SHELL).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });

async function trim(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map(k => c.delete(k)));
}

async function networkFirst(req, fallbackUrl) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (fallbackUrl) { const f = await cache.match(fallbackUrl); if (f) return f; }
    return new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function staleWhileRevalidate(req, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => {
    if (res && (res.ok || res.type === "opaque")) { cache.put(req, res.clone()); if (max) trim(cacheName, max); }
    return res;
  }).catch(() => null);
  return hit || (await net) || new Response("", { status: 504 });
}

async function cacheFirst(req, cacheName, max) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) { cache.put(req, res.clone()); if (max) trim(cacheName, max); }
    return res;
  } catch (err) { return new Response("", { status: 504 }); }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    if (url.pathname.includes("/storage/v1/object/public/")) { e.respondWith(staleWhileRevalidate(req, MEDIA, MAX_MEDIA)); return; }
    if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") { e.respondWith(staleWhileRevalidate(req, MEDIA, MAX_MEDIA)); return; }
    return;                                   /* API Supabase, authentification, etc. : réseau uniquement */
  }

  if (req.mode === "navigate") { e.respondWith(networkFirst(req, "offline.html")); return; }
  if (url.pathname.includes("/assets/img/")) { e.respondWith(cacheFirst(req, MEDIA, MAX_MEDIA)); return; }
  if (url.pathname.endsWith("/sw.js")) return;
  if (/\.(js|css|json|webmanifest)$/.test(url.pathname)) { e.respondWith(networkFirst(req)); return; }
  e.respondWith(staleWhileRevalidate(req, SHELL));
});
