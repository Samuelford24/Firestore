'use strict';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "index.html": "53aeaaccc3454cbc0c0ee998b6f52187",
"/": "53aeaaccc3454cbc0c0ee998b6f52187",
"main.dart.js": "30278e75cbdd43bdb2897ebfef919989",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "e31f816605da483ecabb9e7f4568867a",
"assets/LICENSE": "43deaed3f8e89dec0a9a8a5c53e5cb22",
"assets/AssetManifest.json": "6bbcf80c56da6e4d7ac75f346feb81ca",
"assets/FontManifest.json": "01700ba55b08a6141f33e168c4a6c22f",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/fonts/MaterialIcons-Regular.ttf": "56d3ffdef7a25659eab6a68a3fbfaf16",
"assets/assets/main_icon.jpg": "102d3532e213af007658f26bb07f5993",
"assets/assets/main_icon.png": "8614ef0ff1a50cf4aad67c8bdded7eb5",
"assets/assets/flutter-firebase-config.json": "03b6db1f4135ee879a222db03944e58c"
};

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheName) {
      return caches.delete(cacheName);
    }).then(function (_) {
      return caches.open(CACHE_NAME);
    }).then(function (cache) {
      return cache.addAll(Object.keys(RESOURCES));
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});