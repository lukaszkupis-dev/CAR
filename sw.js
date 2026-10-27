// C.A.R. – service worker. Przy każdej nowej wersji zmień numer w CACHE.
const CACHE = 'car-2.9.0';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Strona: najpierw sieć (świeża wersja), bez sieci z pamięci
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Pozostałe pliki: najpierw pamięć
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
