const cacheName = "site-cache-v1";

const assets = [
    '/',
    '/index.html',
    'game.css',
    'game.js'
];

//install
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(cacheName)
            .then( cache => {
                console.log("Opened cache");
                cache.addAll(assets);
            })
    );
});

//activate
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys()
            .then( keys => {
                return Promise.all(keys
                    .filter(key => key !== cacheName)
                    .map(key => caches.delete(key))
                )
            })
    );
});

//fetch
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request)
            .then( response => {
                return response || fetch(e.request);
            })
    );
});