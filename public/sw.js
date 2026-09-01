const CACHE = 'tilt-tag-v1';
const SHELL = [
  '/', '/demo', '/assets/observatory-768.webp', '/assets/observatory-1280.webp',
  '/fonts/atkinson-400.woff2', '/fonts/atkinson-700.woff2', '/fonts/fraunces-600.woff2',
  '/favicon.svg', '/apple-touch-icon.png', '/site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const indexResponse = await fetch('/');
    const markup = await indexResponse.clone().text();
    const builtAssets = [...markup.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    if (event.request.mode === 'navigate') return (await caches.match('/demo', { ignoreVary: true })) || caches.match('/', { ignoreVary: true });
    return new Response('This file is unavailable offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }));
});
