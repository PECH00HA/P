// Pasha POS — offline cache (GitHub Pages). Bump CACHE when you upload a new index.html.
const CACHE = 'pasha-pos-v6';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (/firebaseio\.com|identitytoolkit|securetoken|wa\.me/.test(u.hostname + u.pathname)) return;
  if (r.mode === 'navigate') {            // HTML: network first, cache fallback
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html') || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => {   // libs / fonts: cache first, refresh in background
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)); } return res; }).catch(() => m);
    return m || net;
  }));
});
