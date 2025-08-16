import { createClient, RedisClientType } from 'redis';
import { Request, Response, NextFunction } from 'express';

interface CacheFilters {
  sortBy?: 'new' | 'top';
  category?: string;
  difficulty?: string;
  [key: string]: any;
}

class CacheManager {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private defaultTTL: number = 3600; // 1 hour
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;
  private fallbackCache?: Map<string, any>;
  private fallbackTimers?: Map<string, NodeJS.Timeout>;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD || undefined,
        database: parseInt(process.env.REDIS_DB || '0'),
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

      await this.client.connect();
      await this.client.ping();
      console.log('✅ Redis cache system initialized');

    } catch (error: any) {
      console.error('❌ Failed to connect to Redis:', error.message);
      console.log('📝 Cache will work in memory fallback mode');
      this.setupFallback();
    }
  }

  private setupFallback(): void {
    this.fallbackCache = new Map();
    this.fallbackTimers = new Map();
  }

  private generateKey(type: string, ...identifiers: (string | number)[]): string {
    const prefix = process.env.CACHE_PREFIX || 'virtuves_maksla';
    return `${prefix}:${type}:${identifiers.join(':')}`;
  }

  async cacheGet(key: string): Promise<any> {
    try {
      if (this.isConnected && this.client) {
        const cached = await this.client.get(key);
        return cached ? JSON.parse(cached) : null;
      } else if (this.fallbackCache) {
        return this.fallbackCache.get(key) || null;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async cacheSet(key: string, data: any, ttl: number = this.defaultTTL): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttl, JSON.stringify(data));
        return true;
      } else if (this.fallbackCache && this.fallbackTimers) {
        this.fallbackCache.set(key, data);
        
        if (this.fallbackTimers.has(key)) {
          clearTimeout(this.fallbackTimers.get(key)!);
        }
        
        const timer = setTimeout(() => {
          this.fallbackCache?.delete(key);
          this.fallbackTimers?.delete(key);
        }, ttl * 1000);
        
        this.fallbackTimers.set(key, timer);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async cacheDelete(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
        return true;
      } else if (this.fallbackCache && this.fallbackTimers) {
        this.fallbackCache.delete(key);
        
        if (this.fallbackTimers.has(key)) {
          clearTimeout(this.fallbackTimers.get(key)!);
          this.fallbackTimers.delete(key);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Recipe-specific cache methods
  async getRecipe(id: string): Promise<any> {
    const key = this.generateKey('recipe', id);
    return await this.cacheGet(key);
  }

  async setRecipe(id: string, recipe: any, ttl: number = 7200): Promise<boolean> {
    const key = this.generateKey('recipe', id);
    return await this.cacheSet(key, recipe, ttl);
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const key = this.generateKey('recipe', id);
    return await this.cacheDelete(key);
  }

  async getRecipesList(page: number = 1, limit: number = 20, filters: CacheFilters = {}): Promise<any> {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('recipes_list', page, limit, filterKey);
    return await this.cacheGet(key);
  }

  async setRecipesList(page: number, limit: number, filters: CacheFilters, recipes: any, ttl: number = 1800): Promise<boolean> {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('recipes_list', page, limit, filterKey);
    return await this.cacheSet(key, recipes, ttl);
  }

  async invalidateRecipesList(): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        const keys = await this.client.keys(this.generateKey('recipes_list', '*'));
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else if (this.fallbackCache && this.fallbackTimers) {
        const keys = Array.from(this.fallbackCache.keys()).filter(key => 
          key.includes(':recipes_list:')
        );
        keys.forEach(key => {
          this.fallbackCache?.delete(key);
          if (this.fallbackTimers?.has(key)) {
            clearTimeout(this.fallbackTimers.get(key)!);
            this.fallbackTimers.delete(key);
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error invalidating recipes list:', error);
      return false;
    }
  }

  // Search cache methods
  async getSearchResults(query: string, filters: CacheFilters = {}): Promise<any> {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('search', Buffer.from(query).toString('base64'), filterKey);
    return await this.cacheGet(key);
  }

  async setSearchResults(query: string, filters: CacheFilters, results: any, ttl: number = 1800): Promise<boolean> {
    const filterKey = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    const key = this.generateKey('search', Buffer.from(query).toString('base64'), filterKey);
    return await this.cacheSet(key, results, ttl);
  }

  // Popular recipes cache
  async getPopularRecipes(timeframe: string = 'week'): Promise<any> {
    const key = this.generateKey('popular_recipes', timeframe);
    return await this.cacheGet(key);
  }

  async setPopularRecipes(timeframe: string, recipes: any, ttl: number = 3600): Promise<boolean> {
    const key = this.generateKey('popular_recipes', timeframe);
    return await this.cacheSet(key, recipes, ttl);
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; type: string; error?: string }> {
    try {
      if (this.isConnected && this.client) {
        await this.client.ping();
        return { status: 'healthy', type: 'redis' };
      } else {
        return { status: 'healthy', type: 'memory_fallback' };
      }
    } catch (error: any) {
      return { status: 'unhealthy', type: 'error', error: error.message };
    }
  }

  // Cache statistics
  async getInfo(): Promise<{ type: string; info?: any; entries?: number; error?: string }> {
    try {
      if (this.isConnected && this.client) {
        const info = await this.client.info();
        return { type: 'redis', info };
      } else {
        return {
          type: 'memory_fallback',
          entries: this.fallbackCache ? this.fallbackCache.size : 0
        };
      }
    } catch (error: any) {
      return { type: 'error', error: error.message };
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Express middleware for caching responses
const cacheMiddleware = (ttl: number = 3600, keyGenerator?: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey: string;
    if (keyGenerator) {
      cacheKey = keyGenerator(req);
    } else {
      const query = JSON.stringify(req.query);
      cacheKey = cacheManager['generateKey']('middleware', req.path, Buffer.from(query).toString('base64'));
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
      res.json = function(data: any) {
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

// Helper functions for route handlers
const recipeCache = {
  get: (id: string) => cacheManager.getRecipe(id),
  set: (id: string, recipe: any) => cacheManager.setRecipe(id, recipe),
  delete: (id: string) => cacheManager.deleteRecipe(id)
};

const searchCache = {
  get: (query: string, filters: CacheFilters) => cacheManager.getSearchResults(query, filters),
  set: (query: string, filters: CacheFilters, results: any) => cacheManager.setSearchResults(query, filters, results)
};

export {
  cacheManager,
  cacheMiddleware,
  recipeCache,
  searchCache
};