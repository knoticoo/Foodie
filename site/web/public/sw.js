// Service Worker for Virtuves Māksla PWA
const CACHE_NAME = 'virtuves-maksla-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const RECIPES_CACHE = 'recipes-v1';
const IMAGES_CACHE = 'images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/images/logo.png',
  '/images/recipe-placeholder.jpg',
  '/offline.html',
];

// API endpoints to cache
const CACHE_STRATEGIES = {
  recipes: {
    pattern: /\/api\/recipes/,
    strategy: 'networkFirst',
    maxAge: 1000 * 60 * 30, // 30 minutes
    maxEntries: 100,
  },
  images: {
    pattern: /\.(jpg|jpeg|png|webp|avif|svg)$/,
    strategy: 'cacheFirst',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    maxEntries: 200,
  },
  static: {
    pattern: /\.(css|js|woff2?|ttf|eot)$/,
    strategy: 'cacheFirst',
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    maxEntries: 100,
  },
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== RECIPES_CACHE &&
                cacheName !== IMAGES_CACHE
              );
            })
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(handleRequest(request));
});

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/recipes')) {
    return handleRecipeRequest(request);
  } else if (isImageRequest(request)) {
    return handleImageRequest(request);
  } else if (isStaticAsset(request)) {
    return handleStaticRequest(request);
  } else if (isNavigationRequest(request)) {
    return handleNavigationRequest(request);
  } else {
    return handleDynamicRequest(request);
  }
}

// Recipe API requests - Network First with fallback
async function handleRecipeRequest(request) {
  const cache = await caches.open(RECIPES_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('📱 Network failed, trying cache for:', request.url);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for recipe requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Šī recepte nav pieejama bezsaistē',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Image requests - Cache First
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGES_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache for future use
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('🖼️ Image failed to load:', request.url);
    
    // Return placeholder image
    return caches.match('/images/recipe-placeholder.jpg');
  }
}

// Static assets - Cache First
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('📄 Static asset failed:', request.url);
    throw error;
  }
}

// Navigation requests - Network First with offline fallback
async function handleNavigationRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('🌐 Navigation offline, showing cached version');
    
    // Try cached version
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    return caches.match('/offline.html');
  }
}

// Dynamic requests - Network First
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Limit cache size
      limitCacheSize(DYNAMIC_CACHE, 50);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Helper functions
function isImageRequest(request) {
  return CACHE_STRATEGIES.images.pattern.test(request.url);
}

function isStaticAsset(request) {
  return CACHE_STRATEGIES.static.pattern.test(request.url);
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'recipe-favorite') {
    event.waitUntil(syncFavorites());
  } else if (event.tag === 'recipe-rating') {
    event.waitUntil(syncRatings());
  } else if (event.tag === 'offline-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Sync offline favorites
async function syncFavorites() {
  try {
    const favorites = await getStoredActions('favorites');
    
    for (const favorite of favorites) {
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(favorite),
        });
        
        // Remove from offline storage after successful sync
        await removeStoredAction('favorites', favorite.id);
      } catch (error) {
        console.log('Failed to sync favorite:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Sync offline ratings
async function syncRatings() {
  try {
    const ratings = await getStoredActions('ratings');
    
    for (const rating of ratings) {
      try {
        await fetch('/api/ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rating),
        });
        
        await removeStoredAction('ratings', rating.id);
      } catch (error) {
        console.log('Failed to sync rating:', error);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Sync offline analytics
async function syncAnalytics() {
  try {
    const events = await getStoredActions('analytics');
    
    for (const event of events) {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
        
        await removeStoredAction('analytics', event.id);
      } catch (error) {
        console.log('Failed to sync analytics event:', error);
      }
    }
  } catch (error) {
    console.log('Analytics sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
async function getStoredActions(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineActions', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

async function removeStoredAction(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineActions', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: 'Jaunā recepte ir pieejama!',
    icon: '/images/logo-192.png',
    badge: '/images/badge-72.png',
    data: {
      url: '/recipes',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'view',
        title: 'Skatīt recepti',
        icon: '/images/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Aizvērt',
        icon: '/images/close-icon.png',
      },
    ],
    requireInteraction: true,
    tag: 'new-recipe',
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Virtuves Māksla', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Default action or 'view' action
  const url = action === 'view' ? data.url : '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to focus existing tab
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_RECIPE':
      cacheRecipe(payload);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Cache specific recipe
async function cacheRecipe(recipe) {
  const cache = await caches.open(RECIPES_CACHE);
  const recipeUrl = `/api/recipes/${recipe.id}`;
  
  // Cache recipe data
  await cache.put(
    recipeUrl,
    new Response(JSON.stringify(recipe), {
      headers: { 'Content-Type': 'application/json' },
    })
  );
  
  // Cache recipe image if available
  if (recipe.image) {
    try {
      const imageResponse = await fetch(recipe.image);
      if (imageResponse.ok) {
        const imageCache = await caches.open(IMAGES_CACHE);
        await imageCache.put(recipe.image, imageResponse);
      }
    } catch (error) {
      console.log('Failed to cache recipe image:', error);
    }
  }
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ All caches cleared');
}

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

console.log('🎯 Service Worker loaded successfully');