const staticCacheName = 'restaurant-review-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(staticCacheName)
      .then(function(cache) {
        console.log('installing cache');
        return cache.addAll([
          '/',
          './index.html',
          './restaurant.html',
          './js/main.js',
          './js/restaurant_info.js',
          './img/w600_1.webp',
          './img/w600_2.webp',
          './img/w600_3.webp',
          './img/w600_4.webp',
          './img/w600_5.webp',
          './img/w600_6.webp',
          './img/w600_7.webp',
          './img/w600_8.webp',
          './img/w600_9.webp',
          './img/w600_10.webp',
          './img/map_placeholder.webp',
          './icons/burger512.png',
          './icons/comment.svg',
          './favicon.ico',
          './manifest.json'
        ]);
      })
      .catch(err => console.log(err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.filter(
            cName =>
              cName.startsWith('restaureant-review-') &&
              cName != staticCacheName
          )
        )
      )
      .then(cNames => cNames.map(cName => caches.delete(cName)))
      .catch(err => console.log(err))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .match(event.request, { ignoreSearch: true })
      .then(res => res || fetch(event.request))
      .catch(err => {
        console.log(err, event.request);
        return err;
      })
  );
});
