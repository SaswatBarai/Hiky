import Redis from "ioredis";

import dotenv from "dotenv";
dotenv.config();
// console.log('Redis URL:', process.env.REDIS_URL ? 'Found' : 'Not found');

// Common options for Redis clients
const redisOptions = {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,         // Reduced timeout
    lazyConnect: false,            // Connect immediately
    enableOfflineQueue: false,     // Don't queue commands when Redis is offline
    retryStrategy: (times) => {
        if (times > 3) {
            console.log(`Redis connection retry limit reached after ${times} attempts.`);
            return null; // Stop retrying
        }
        return Math.min(times * 1000, 3000); // Increase delay between retries
    },
    tls: {
        rejectUnauthorized: false // For rediss:// protocol, don't verify cert (common in dev)
    }
};

// Variables to hold our Redis clients
let redisClient;
let wsRedisClient;
let cacheRedisClient;
let sessionRedisClient;

// Create Redis clients with proper error handling
try {
    // Create Redis client using the connection string
    redisClient = new Redis(process.env.REDIS_URL, {
        ...redisOptions
    });

    // Add event listeners for the main Redis client
    redisClient.on('error', (err) => {
        console.error('❌ Redis client error:', err.message);
    });
    
    redisClient.on('connect', () => {
        console.log('✅ Redis client connected');
    });

    // Create separate Redis clients (all using database 0 as required by Upstash)
    wsRedisClient = new Redis(process.env.REDIS_URL, {
        ...redisOptions,
        db: 0 // Using database 0 for WebSocket data
    });
    
    wsRedisClient.on('error', (err) => {
        console.error('❌ WebSocket Redis connection error:', err.message);
    });
    
    wsRedisClient.on('connect', () => {
        console.log('✅ WebSocket Redis client connected');
    });

    cacheRedisClient = new Redis(process.env.REDIS_URL, {
        ...redisOptions,
        db: 0 // Using database 0 for caching
    });
    
    cacheRedisClient.on('error', (err) => {
        console.error('❌ Cache Redis connection error:', err.message);
    });
    
    cacheRedisClient.on('connect', () => {
        console.log('✅ Cache Redis client connected');
    });

    sessionRedisClient = new Redis(process.env.REDIS_URL, {
        ...redisOptions,
        db: 0 // Using database 0 for sessions
    });
    
    sessionRedisClient.on('error', (err) => {
        console.error('❌ Session Redis connection error:', err.message);
    });
    
    sessionRedisClient.on('connect', () => {
        console.log('✅ Session Redis client connected');
    });
} catch (error) {
    console.error('Failed to initialize Redis clients:', error.message);
    // Don't exit process here, allow server to start without Redis
}

// Export the Redis clients
export { redisClient, wsRedisClient, cacheRedisClient, sessionRedisClient };

// Handle Redis connection events for main client
redisClient.on('connect', () => {
    console.log('✅ Main Redis connected successfully');
});

redisClient.on('error', (err) => {
    console.error('❌ Main Redis connection error:', err.message);
    // Don't exit the process here, let the error bubble up
});

redisClient.on('close', () => {
    console.log('⚠️ Main Redis connection closed');
});

// Add error handlers for the other Redis clients
wsRedisClient.on('error', (err) => {
    console.error('❌ WebSocket Redis connection error:', err.message);
});

cacheRedisClient.on('error', (err) => {
    console.error('❌ Cache Redis connection error:', err.message);
});

sessionRedisClient.on('error', (err) => {
    console.error('❌ Session Redis connection error:', err.message);
});

// Handle Redis connection events for WebSocket client
wsRedisClient.on('connect', () => {
    // console.log('✅ WebSocket Redis connected successfully (DB 1)');
});

wsRedisClient.on('error', (err) => {
    console.error('❌ WebSocket Redis connection error:', err.message);
});

// Handle Redis connection events for cache client
cacheRedisClient.on('connect', () => {
    // console.log('✅ Cache Redis connected successfully (DB 2)');
});

cacheRedisClient.on('error', (err) => {
    console.error('❌ Cache Redis connection error:', err.message);
});

// Handle Redis connection events for session client
sessionRedisClient.on('connect', () => {
    // console.log('✅ Session Redis connected successfully (DB 3)');
});

sessionRedisClient.on('error', (err) => {
    console.error('❌ Session Redis connection error:', err.message);
});

export default redisClient;


