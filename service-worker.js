const CACHE = 'truckpilote-chauffeur-v65';

const APP_FILES = [
  './',
  './index.html',
  './feuille.html',
  './ma_journee.html',
  './frais.html',
  './historique.html',
  './recapitulatif.html',
  './profil.html',
  './manifest.json',
  './icon.svg',
  './assets/3d/dashboard-icons.svg',
  './assets/3d/ma-journee-bandeau.svg',
  './assets/3d/mytruck-mate-bandeau-quatre-camions.jpg',
  './assets/3d/ma-journee-bandeau-fourni.svg',
  './assets/3d/ma-journee-realiste.jpg',
  './assets/3d/mytruck-buttons-sprite.jpg',
  './assets/3d/ma-feuille-semaine-scania.jpg',
  './assets/3d/ma-feuille-semaine-3d.jpg',
  './assets/3d/mes-frais-maquette.webp',
  './assets/3d/mes-frais.svg',
  './assets/3d/historique-maquette.jpg',
  './assets/3d/historique-corrige.svg',
  './assets/3d/documents-fond.svg',
  './assets/3d/profil-fond.svg',
  './assets/3d/mes-frais-cadre.svg',
  './assets/3d/historique-approuve.svg',
  './assets/3d/sauvegardes-fond.svg',
  './assets/recap-reference-sprite.jpg',
  './assets/recap-bandeau-mytruck-mate.jpg',
  './assets/recap-hero.svg',
  './assets/recap-kilometres.svg',
  './assets/recap-conduite.svg',
  './assets/recap-amplitude.svg',
  './assets/recap-journees.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key =>
          key.startsWith('truckpilote-chauffeur-') && key !== CACHE
        ).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached =>
            cached || caches.match('./index.html')
          )
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});