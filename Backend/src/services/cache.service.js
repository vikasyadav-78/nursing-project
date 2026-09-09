import { redisClient, isRedisConnected, memoryCache } from '../config/redis.js';

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Get item from cache (Redis or Memory) or execute fetchFn and cache the result (Cache-Aside)
 */
export const getOrSetCache = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  try {
    // 1. Try Redis if connected
    if (isRedisConnected && redisClient) {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } else {
      // 2. Try In-Memory Fallback
      const memCached = memoryCache.get(key);
      if (memCached && memCached.expiresAt > Date.now()) {
        return memCached.value;
      }
    }
  } catch (err) {
    console.error(`Cache read error for key [${key}]:`, err.message);
  }

  // 3. CACHE MISS -> Fetch fresh data from Database/Source
  const freshData = await fetchFn();
  if (freshData === null || freshData === undefined) {
    return freshData;
  }

  // 4. Save to Cache
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.set(key, JSON.stringify(freshData), 'EX', ttl);
    } else {
      memoryCache.set(key, {
        value: freshData,
        expiresAt: Date.now() + ttl * 1000,
      });
    }
  } catch (err) {
    console.error(`Cache write error for key [${key}]:`, err.message);
  }

  return freshData;
};

/**
 * Delete a specific key from cache
 */
export const deleteCache = async (key) => {
  try {
    memoryCache.delete(key);
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    }
  } catch (err) {
    console.error(`Cache delete error for key [${key}]:`, err.message);
  }
};

/**
 * Invalidate multiple keys matching a pattern (e.g. "entity:college:*")
 */
export const invalidatePattern = async (pattern) => {
  try {
    // Clear from Memory Cache
    const regexPattern = new RegExp('^' + pattern.replace('*', '.*') + '$');
    for (const key of memoryCache.keys()) {
      if (regexPattern.test(key)) {
        memoryCache.delete(key);
      }
    }

    // Clear from Redis
    if (isRedisConnected && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys && keys.length > 0) {
        await redisClient.del(...keys);
      }
    }
  } catch (err) {
    console.error(`Cache pattern invalidation error [${pattern}]:`, err.message);
  }
};
