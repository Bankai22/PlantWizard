const CACHE_NAME = 'plant-explorer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Or the bundled JS file if known, e.g., /dist/bundle.js
  '/App.tsx',
  '/components/SearchBar.tsx',
  '/components/PlantInfoCard.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/ErrorDisplay.tsx',
  '/components/AttributionDisplay.tsx',
  '/components/UserImageDisplay.tsx',
  '/components/Icons.tsx',
  '/services/geminiService.ts',
  '/constants.ts',
  '/types.ts',
  // Tailwind CSS is via CDN, browser handles its caching.
  // Google Fonts are via CDN, browser handles their caching.
  // React/ReactDOM are via esm.sh CDN.
  // Placeholder for app icons, these should be actual paths to your icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs, but don't block install if some fail (e.g. dev server paths vs prod)
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(new Request(url, { mode: 'no-cors' })) // Use no-cors for opaque responses from CDNs if direct caching
              .then(response => {
                if (response.status === 200 || response.type === 'opaque') {
                  return cache.put(url, response);
                }
                console.warn('Skipping caching for (status ' + response.status + '): ' + url);
                return Promise.resolve(); // Don't fail the whole caching
              })
              .catch(err => {
                console.warn('Failed to fetch and cache on install: ' + url, err);
                return Promise.resolve(); // Don't fail the whole caching
              });
          })
        ).then(() => {
           console.log('All specified resources attempted to be cached.');
        });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 && networkResponse.type !== 'opaque') {
              // For opaque responses (no-cors), we can't check status, so cache them if they exist
              if (networkResponse.type === 'opaque' && networkResponse.url.startsWith('http')) {
                 // Don't cache if not a valid response
              } else {
                return networkResponse;
              }
            }
            
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            // Only cache GET requests and from http/https protocols
            if (event.request.method === 'GET' && (event.request.url.startsWith('http') || event.request.url.startsWith('chrome-extension'))) {
                 caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          // You could return a custom offline page here if you have one
          // For now, just rethrow to indicate failure
          throw error;
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
