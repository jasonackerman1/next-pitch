var CACHE_NAME = 'heads-up-cache-v8';
var NETWORK_FIRST_FILES = ['./', './index.html', './css/style.css', './js/app.js', './js/state.js', './js/gist.js', './js/data.js', './js/iq.js', './js/iq-content.js', './manifest.json'];

var SHELL_FILES = NETWORK_FIRST_FILES.concat([
  './icons/icon-180.png',
  './icons/icon-512.png',
  './icons/icon-192.png',
  './img/logo.png',
  './img/skip/head-happy.png',
  './img/skip/head-confident.png',
  './img/skip/head-wink.png',
  './img/skip/head-determined.png',
  './img/skip/head-focused.png',
  './img/skip/head-surprised.png',
  './img/skip/head-laughing.png',
  './img/skip/head-gameface.png',
  './img/skip/head-thinking.png',
  './img/skip/head-excited.png',
  './img/skip/head-suspicious.png',
  './img/skip/head-cool.png',
  './img/skip/pose-batting.png',
  './img/skip/pose-pitching.png',
  './img/skip/pose-fielding.png',
  './img/skip/pose-running.png',
  './img/skip/pose-throwing.png',
  './img/skip/pose-coaching.png',
  './fonts/barlow-500.woff2',
  './fonts/barlow-600.woff2',
  './fonts/barlow-700.woff2',
  './fonts/barlow-condensed-700.woff2',
  './fonts/barlow-condensed-800.woff2',
  './fonts/barlow-condensed-900.woff2',
  './fonts/barlow-condensed-800i.woff2',
  './fonts/barlow-condensed-900i.woff2'
]);

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        SHELL_FILES.map(function (url) {
          // no-store forces a real network hit for the precache — cache.add() alone can be
          // silently satisfied by the browser's own HTTP cache (same gap as the fetch handler
          // below), which would defeat "always precache the current version".
          return cache.add(new Request(url, { cache: 'no-store' })).catch(function (err) {
            console.warn('Heads Up SW: could not precache', url, err);
          });
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

function isNetworkFirst(url) {
  var path = new URL(url).pathname;
  return NETWORK_FIRST_FILES.some(function (f) {
    var name = f.replace(/^\.\//, '');
    return name === '' ? path.slice(-1) === '/' : path.slice(-name.length) === name;
  });
}

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);
  // Never intercept the GitHub Gist API or YouTube embeds — those always need a real
  // network round-trip and shouldn't be cached or offline-substituted.
  if (url.origin !== self.location.origin) return;

  var networkFirst = isNetworkFirst(event.request.url);

  if (networkFirst) {
    event.respondWith(
      fetch(event.request.url, { cache: 'no-store' })
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () { return caches.match(event.request); })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networkFetch = fetch(event.request.url, { cache: 'no-store' })
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () { return cached; });

      return cached || networkFetch;
    })
  );
});
