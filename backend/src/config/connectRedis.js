import Redis from "ioredis";

import dotenv from "dotenv";
dotenv.config();
// console.log('Redis URL:', process.env.REDIS_URL ? 'Found' : 'Not found');

// Create Redis client using the connection string
export const redisClient = new Redis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    connectTimeout: 60000,
    lazyConnect: true,
});

// Create separate Redis clients for different databases
export const wsRedisClient = new Redis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    connectTimeout: 60000,
    lazyConnect: true,
    db: 1, // Database 1 for WebSocket data
});

export const cacheRedisClient = new Redis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    connectTimeout: 60000,
    lazyConnect: true,
    db: 2, // Database 2 for caching
});

export const sessionRedisClient = new Redis(process.env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    connectTimeout: 60000,
    lazyConnect: true,
    db: 3, // Database 3 for sessions
});

// Handle Redis connection events for main client
redisClient.on('connect', () => {
    // console.log('✅ Main Redis connected successfully');
});

redisClient.on('error', (err) => {
    console.error('❌ Main Redis connection error:', err.message);
});

redisClient.on('close', () => {
    // console.log('⚠️ Main Redis connection closed');
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


