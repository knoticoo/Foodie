const redis = require('redis');
const { promisify } = require('util');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis connection refused');
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > this.retryAttempts) {
            return undefined;
          }
          return Math.min(options.attempt * this.retryDelay, 3000);
        }
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        console.log('Redis connection ended');
        this.isConnected = false;
      });

      // Promisify Redis methods for async/await
      this.get = promisify(this.client.get).bind(this.client);
      this.set = promisify(this.client.set).bind(this.client);
      this.del = promisify(this.client.del).bind(this.client);
      this.exists = promisify(this.client.exists).bind(this.client);
      this.expire = promisify(this.client.expire).bind(this.client);
      this.keys = promisify(this.client.keys).bind(this.client);
      this.flushdb = promisify(this.client.flushdb).bind(this.client);
      this.ping = promisify(this.client.ping).bind(this.client);

      // Test connection
      await this.ping();
      console.log('✅ Redis cache system initialized');

    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error.message);
      console.log('📝 Cache will work in memory fallback mode');
      this.setupFallback();
    }
  }

  setupFallback() {
    // In-memory fallback when Redis is not available
    this.fallbackCache = new Map();
    this.fallbackTimers = new Map();
    
    this.get = async (key) => {
      return this.fallbackCache.get(key) || null;
    };
    
    this.set = async (key, value, mode, ttl) => {
      this.fallbackCache.set(key, value);
      
      if (ttl) {
        // Clear existing timer
        if (this.fallbackTimers.has(key)) {
          clearTimeout(this.fallbackTimers.get(key));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
          this.fallbackCache.delete(key);
          this.fallbackTimers.delete(key);
        }, ttl * 1000);
        
        this.fallbackTimers.set(key, timer);
      }
      
      return 'OK';
    };
    
    this.del = async (key) => {
      const existed = this.fallbackCache.has(key);
      this.fallbackCache.delete(key);
      
      if (this.fallbackTimers.has(key)) {
        clearTimeout(this.fallbackTimers.get(key));
        this.fallbackTimers.delete(key);
      }
      
      return existed ? 1 : 0;
    };
    
    this.exists = async (key) => {
      return this.fallbackCache.has(key) ? 1 : 0;
    };
    
    this.keys = async (pattern) => {
      const keys = Array.from(this.fallbackCache.keys());
      if (pattern === '*') return keys;
      
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return keys.filter(key => regex.test(key));
    };
    
    this.flushdb = async () => {
      this.fallbackCache.clear();
      this.fallbackTimers.forEach(timer => clearTimeout(timer));
      this.fallbackTimers.clear();
      return 'OK';
    };
  }

  // Cache key generators
  generateKey(type, ...identifiers) {
    const prefix = process.env.CACHE_PREFIX || 'virtuves_maksla';
    return `${prefix}:${type}:${identifiers.join(':')}`;
  }

  // Generic cache methods
  async cacheGet(key) {
    try {
      const cached = await this.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async cacheSet(key, data, ttl = this.defaultTTL) {
    try {
      await this.set(key, JSON.stringify(data), 'EX', ttl);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async cacheDelete(key) {
    try {
      await this.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Recipe-specific cache methods
  async getRecipe(id) {
    const key = this.generateKey('recipe', id);
    return await this.cacheGet(key);
  }

  async setRecipe(id, recipe, ttl = 7200) { // 2 hours for individual recipes
    const key = this.generateKey('recipe', id);
    return await this.cacheSet(key, recipe, ttl);
  }

  async deleteRecipe(id) {
    const key = this.generateKey('recipe', id);
    return await this.cacheDelete(key);
  }

  async getRecipesList(page = 1, limit = 20, filters = {}) {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('recipes_list', page, limit, filterKey);
    return await this.cacheGet(key);
  }

  async setRecipesList(page, limit, filters, recipes, ttl = 1800) { // 30 minutes for lists
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('recipes_list', page, limit, filterKey);
    return await this.cacheSet(key, recipes, ttl);
  }

  async invalidateRecipesList() {
    try {
      const keys = await this.keys(this.generateKey('recipes_list', '*'));
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.del(key)));
      }
      return true;
    } catch (error) {
      console.error('Error invalidating recipes list:', error);
      return false;
    }
  }

  // Search cache methods
  async getSearchResults(query, filters = {}) {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('search', Buffer.from(query).toString('base64'), filterKey);
    return await this.cacheGet(key);
  }

  async setSearchResults(query, filters, results, ttl = 1800) {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('search', Buffer.from(query).toString('base64'), filterKey);
    return await this.cacheSet(key, results, ttl);
  }

  // User-specific cache methods
  async getUserFavorites(userId) {
    const key = this.generateKey('user_favorites', userId);
    return await this.cacheGet(key);
  }

  async setUserFavorites(userId, favorites, ttl = 3600) {
    const key = this.generateKey('user_favorites', userId);
    return await this.cacheSet(key, favorites, ttl);
  }

  async invalidateUserFavorites(userId) {
    const key = this.generateKey('user_favorites', userId);
    return await this.cacheDelete(key);
  }

  // Category cache methods
  async getCategories() {
    const key = this.generateKey('categories');
    return await this.cacheGet(key);
  }

  async setCategories(categories, ttl = 86400) { // 24 hours for categories
    const key = this.generateKey('categories');
    return await this.cacheSet(key, categories, ttl);
  }

  // Popular recipes cache
  async getPopularRecipes(timeframe = 'week') {
    const key = this.generateKey('popular_recipes', timeframe);
    return await this.cacheGet(key);
  }

  async setPopularRecipes(timeframe, recipes, ttl = 3600) {
    const key = this.generateKey('popular_recipes', timeframe);
    return await this.cacheSet(key, recipes, ttl);
  }

  // Statistics cache
  async getStats(type) {
    const key = this.generateKey('stats', type);
    return await this.cacheGet(key);
  }

  async setStats(type, stats, ttl = 1800) {
    const key = this.generateKey('stats', type);
    return await this.cacheSet(key, stats, ttl);
  }

  // Cache invalidation methods
  async invalidateRecipe(id) {
    await this.deleteRecipe(id);
    await this.invalidateRecipesList();
    await this.invalidateStats();
  }

  async invalidateStats() {
    try {
      const keys = await this.keys(this.generateKey('stats', '*'));
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.del(key)));
      }
      return true;
    } catch (error) {
      console.error('Error invalidating stats:', error);
      return false;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      if (this.isConnected) {
        await this.ping();
        return { status: 'healthy', type: 'redis' };
      } else {
        return { status: 'healthy', type: 'memory_fallback' };
      }
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Cache statistics
  async getInfo() {
    try {
      if (this.isConnected && this.client.info) {
        const info = await promisify(this.client.info).bind(this.client)();
        return { type: 'redis', info };
      } else {
        return {
          type: 'memory_fallback',
          entries: this.fallbackCache ? this.fallbackCache.size : 0
        };
      }
    } catch (error) {
      return { type: 'error', error: error.message };
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Express middleware for caching responses
const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      const query = JSON.stringify(req.query);
      cacheKey = cacheManager.generateKey('middleware', req.path, Buffer.from(query).toString('base64'));
    }

    try {
      // Try to get from cache
      const cached = await cacheManager.cacheGet(cacheKey);
      if (cached) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return res.json(cached);
      }

      // Cache miss - continue to route handler
      console.log(`❌ Cache miss: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheManager.cacheSet(cacheKey, data, ttl).catch(error => {
            console.error('Failed to cache response:', error);
          });
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without caching
    }
  };
};

// Cache warming functions
const warmCache = async () => {
  console.log('🔥 Starting cache warming...');
  
  try {
    // Import database connection
    const { pool } = require('../config/database');
    
    // Warm popular recipes
    const popularQuery = `
      SELECT r.*, AVG(rr.rating) as average_rating, COUNT(f.id) as favorite_count
      FROM recipes r
      LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
      LEFT JOIN favorites f ON r.id = f.recipe_id
      WHERE r.is_approved = true
      GROUP BY r.id
      ORDER BY favorite_count DESC, average_rating DESC
      LIMIT 20
    `;
    const popularResult = await pool.query(popularQuery);
    await cacheManager.setPopularRecipes('week', popularResult.rows);
    
    // Warm categories
    const categoriesQuery = `
      SELECT category, COUNT(*) as recipe_count
      FROM recipes
      WHERE is_approved = true AND category IS NOT NULL
      GROUP BY category
      ORDER BY recipe_count DESC
    `;
    const categoriesResult = await pool.query(categoriesQuery);
    await cacheManager.setCategories(categoriesResult.rows);
    
    // Warm basic stats
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM recipes WHERE is_approved = true) as total_recipes,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
        (SELECT AVG(rating) FROM recipe_ratings) as average_rating,
        (SELECT COUNT(*) FROM recipe_comments WHERE is_approved = true) as total_comments
    `;
    const statsResult = await pool.query(statsQuery);
    await cacheManager.setStats('general', statsResult.rows[0]);
    
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
};

module.exports = {
  cacheManager,
  cacheMiddleware,
  warmCache,
  
  // Helper functions for route handlers
  recipeCache: {
    get: (id) => cacheManager.getRecipe(id),
    set: (id, recipe) => cacheManager.setRecipe(id, recipe),
    delete: (id) => cacheManager.invalidateRecipe(id)
  },
  
  searchCache: {
    get: (query, filters) => cacheManager.getSearchResults(query, filters),
    set: (query, filters, results) => cacheManager.setSearchResults(query, filters, results)
  },
  
  userCache: {
    getFavorites: (userId) => cacheManager.getUserFavorites(userId),
    setFavorites: (userId, favorites) => cacheManager.setUserFavorites(userId, favorites),
    invalidateFavorites: (userId) => cacheManager.invalidateUserFavorites(userId)
  }
};