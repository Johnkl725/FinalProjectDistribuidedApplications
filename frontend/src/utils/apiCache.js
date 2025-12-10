/**
 * API Cache Utility
 * Implements a simple in-memory cache with TTL (Time To Live)
 * Reduces redundant API calls and database connections
 */

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map(); // Para evitar requests duplicados simultáneos
  }

  /**
   * Generate cache key from function name and arguments
   */
  generateKey(fnName, args = []) {
    const argsKey = JSON.stringify(args);
    return `${fnName}:${argsKey}`;
  }

  /**
   * Get cached data if valid
   */
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache with TTL
   */
  set(key, data, ttlMs = 30000) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Check if a request is already pending
   */
  getPending(key) {
    return this.pendingRequests.get(key);
  }

  /**
   * Set a pending request promise
   */
  setPending(key, promise) {
    if (promise === null) {
      // Remove pending request
      this.pendingRequests.delete(key);
      return;
    }
    this.pendingRequests.set(key, promise);
    // Clean up when done
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear cache entries matching pattern
   */
  clearPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
const apiCache = new ApiCache();

/**
 * Wrapper function to add caching to any API call
 * @param {Function} apiFn - The API function to wrap
 * @param {string} fnName - Unique name for this function
 * @param {Array} args - Arguments for the API function
 * @param {number} ttl - Time to live in milliseconds (default 30s)
 * @returns {Promise} - The API response
 */
export async function cachedApiCall(apiFn, fnName, args = [], ttl = 30000) {
  const cacheKey = apiCache.generateKey(fnName, args);

  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    console.log(`🎯 Cache HIT: ${fnName}`);
    return cached;
  }

  // Check if request is already pending (deduplication)
  const pending = apiCache.getPending(cacheKey);
  if (pending) {
    console.log(`⏳ Request deduplication: ${fnName}`);
    return pending;
  }

  // Make the actual API call
  console.log(`🌐 Cache MISS: ${fnName} - Fetching...`);
  const promise = apiFn(...args)
    .then((response) => {
      apiCache.set(cacheKey, response, ttl);
      return response;
    })
    .catch((error) => {
      // Silently handle canceled requests
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log(`🚫 Request cancelled: ${fnName}`);
        throw error;
      }
      // Don't cache other errors
      throw error;
    });

  // Store pending promise (will auto-cleanup via .finally in setPending)
  apiCache.setPending(cacheKey, promise);
  return promise;
}

/**
 * Clear cache when data is mutated (create, update, delete)
 * @param {string} pattern - Pattern to match cache keys
 */
export function invalidateCache(pattern) {
  apiCache.clearPattern(pattern);
  console.log(`🗑️ Cache invalidated: ${pattern}`);
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  apiCache.clearAll();
  console.log("🗑️ All cache cleared");
}

export default apiCache;
