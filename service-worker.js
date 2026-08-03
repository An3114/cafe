// ========================================
// SERVICE WORKER - Mi Barista Imusa
// ========================================

const CACHE_NAME = 'imusa-barista-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/data.js',
    '/manifest.json',
    '/assets/img/coffee-bg.jpg',
    '/assets/icons/icon-72.png',
    '/assets/icons/icon-96.png',
    '/assets/icons/icon-128.png',
    '/assets/icons/icon-144.png',
    '/assets/icons/icon-152.png',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-384.png',
    '/assets/icons/icon-512.png'
];

// ========================================
// INSTALACIÓN
// ========================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// ========================================
// ACTIVACIÓN
// ========================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// ========================================
// ESTRATEGIA DE CACHE: Stale-While-Revalidate
// ========================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si tenemos cache, devolverlo y actualizar en background
                const fetchPromise = fetch(event.request)
                    .then((networkResponse) => {
                        // Actualizar cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        return networkResponse;
                    })
                    .catch(() => {
                        // Si falla la red y tenemos cache, devolver cache
                        // Si no hay cache, devolver error
                    });

                // Devolver la respuesta cacheada si existe, sino esperar la red
                return cachedResponse || fetchPromise;
            })
    );
});

// ========================================
// MANEJO DE NOTIFICACIONES
// ========================================
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const options = {
        body: data.body || 'Tu café está listo ☕',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || '☕ Mi Barista Imusa',
            options
        )
    );
});

// ========================================
// CLICK EN NOTIFICACIONES
// ========================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});
