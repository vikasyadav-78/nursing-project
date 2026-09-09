import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_URL = process.env.REDIS_URL || undefined;

let redisClient = null;
let isRedisConnected = false;

// Fallback In-Memory Cache if Redis is offline
const memoryCache = new Map();

try {
  const options = {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection retries exhausted. Operating in fallback mode.');
        return null; // stop retrying automatically to avoid log spam
      }
      return Math.min(times * 200, 1000);
    },
  };

  if (REDIS_PASSWORD) options.password = REDIS_PASSWORD;

  if (REDIS_URL) {
    redisClient = new Redis(REDIS_URL, options);
  } else {
    redisClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      ...options,
    });
  }

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Suppress unhandled error log crashes
  });

  // Attempt initial async connection silently
  redisClient.connect().catch((err) => {
    isRedisConnected = false;
    console.log('ℹ️ Redis server not reachable locally. Cache-Aside layer will use graceful in-memory fallback.');
  });
} catch (err) {
  console.warn('⚠️ Could not initialize Redis client. Fallback enabled.');
}

export { redisClient, isRedisConnected, memoryCache };
