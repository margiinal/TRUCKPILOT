const CACHE = 'truckpilote-chauffeur-v132';

const APP_FILES = [
  './',
  './index.html',
  './mytruck_mate_header.jpg',
  './mytruck_mate_header.png',
  './assets/3d/recap-cockpit.webp',
  './assets/3d/recapitulatif-vignette.svg',
  './assets/3d/recap-cockpit.svg',
  './feuille.html',
  './ma_journee.html',
  './detail_journee.html',
  './frais.html',
  './historique.html',
  './assets/fiche-entete-app.svg',
  './assets/fiche-entete-impression.svg',
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
  './assets/recap-kilometres-mytruck-mate.png',
  './assets/recap-conduite.svg',
  './assets/recap-conduite-mytruck-mate.png',
  './assets/recap-amplitude.svg',
  './assets/recap-amplitude-mytruck-mate.png',
  './assets/recap-journees.svg',
  './assets/recap-journees-mytruck-mate.png',
  './assets/recap-activite-periode-mytruck-mate.png'
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