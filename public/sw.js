// Runtime cache of same-origin GET responses (pages, Inertia data, built
// assets) so navigating within already-visited parts of the app still works
// when the connection drops, instead of the page going blank.
//
// Bump this on meaningful service-worker changes to force old caches out.
const CACHE_NAME = 'dps-erp-runtime-v2';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.add('/offline.html'))
            .catch(() => {})
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    // Inertia page visits are same-origin fetch() calls, not browser
    // navigations (mode stays "cors"/"same-origin"), but they represent a
    // real page transition whose data must be fresh -- e.g. the redirect
    // Inertia follows right after a form POST, to re-fetch the list that
    // POST just changed. Treating them as stale-while-revalidate served
    // pre-existing cached list data instead of the record just created,
    // making saves look like they silently failed until a hard reload.
    if (request.mode === 'navigate' || request.headers.get('X-Inertia')) {
        event.respondWith(networkFirst(request));
        return;
    }

    event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await cache.match(request);
        return cached || cache.match('/offline.html') || Response.error();
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkFetch = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => undefined);

    return cached || (await networkFetch) || Response.error();
}
