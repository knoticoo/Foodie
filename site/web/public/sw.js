// Service Worker for Virtuves Māksla PWA
const CACHE_NAME = 'virtuves-maksla-v1.2';
const STATIC_CACHE_NAME = 'virtuves-maksla-static-v1.2';
const DYNAMIC_CACHE_NAME = 'virtuves-maksla-dynamic-v1.2';
const API_CACHE_NAME = 'virtuves-maksla-api-v1.2';

// URLs to cache on install
const STATIC_URLS = [
  '/',
  '/recipes',
  '/favorites',
  '/profile',
  '/login',
  '/register',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/recipes',
  '/api/auth/me',
  '/api/user/favorites'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets (images, CSS, JS)
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      url.pathname.startsWith('/static/') ||
      url.pathname.startsWith('/icons/')) {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Handle API requests - Network first, cache as fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      // Cache successful responses for GET requests
      if (request.method === 'GET') {
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for specific endpoints
    if (url.pathname === '/api/recipes') {
      return new Response(JSON.stringify({
        recipes: [],
        message: 'Offline mode - nav pieejama interneta savienojuma'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle static assets - Cache first
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Handle navigation requests - Network first with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return cached index page as fallback for SPA routing
    const indexPage = await caches.match('/');
    if (indexPage) {
      return indexPage;
    }
    
    // Final fallback - minimal offline page
    return new Response(`
      <!DOCTYPE html>
      <html lang="lv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Virtuves Māksla - Offline</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
          }
          h1 { margin: 0 0 20px 0; font-size: 2rem; }
          p { margin: 0 0 20px 0; line-height: 1.6; }
          button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
          }
          button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🍳 Virtuves Māksla</h1>
          <p>Atvainojiet, šobrīd nav pieejama interneta savienojuma. Lūdzu, pārbaudiet savienojumu un mēģiniet vēlreiz.</p>
          <button onclick="location.reload()">Mēģināt vēlreiz</button>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for forms
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-recipe') {
    event.waitUntil(syncRecipeSubmissions());
  }
  
  if (event.tag === 'background-sync-comment') {
    event.waitUntil(syncCommentSubmissions());
  }
});

// Sync recipe submissions when back online
async function syncRecipeSubmissions() {
  try {
    const cache = await caches.open('pending-submissions');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('submit-recipe')) {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('[SW] Synced recipe submission');
        } catch (error) {
          console.log('[SW] Failed to sync recipe submission:', error);
        }
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// Sync comment submissions when back online
async function syncCommentSubmissions() {
  try {
    const cache = await caches.open('pending-submissions');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('comments')) {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('[SW] Synced comment submission');
        } catch (error) {
          console.log('[SW] Failed to sync comment submission:', error);
        }
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Jaunums Virtuves Mākslā!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Apskatīt',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Aizvērt'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Virtuves Māksla', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Share target handling
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share-recipe' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const title = formData.get('title') || '';
  const description = formData.get('description') || '';
  const url = formData.get('url') || '';
  const image = formData.get('image');
  
  // Redirect to submit page with shared data
  const params = new URLSearchParams({
    title,
    description,
    url
  });
  
  return Response.redirect(`/submit?${params.toString()}`, 302);
}

console.log('[SW] Service worker loaded successfully');