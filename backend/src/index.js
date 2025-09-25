import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { initializeWebSocket } from "./services/websocketService.js";
import app from "./app.js";
import { connectDB } from "./config/connectDB.js";
import { wsRedisClient } from "./config/connectRedis.js";
import { redisClientService } from "./services/redisWebSocketService.js";


const server = http.createServer(app);

// Initialize WebSocket server
const wss = initializeWebSocket(server);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    // console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        // console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    // console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        // console.log('HTTP server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Function to check Redis connectivity
const checkRedisConnection = async () => {
    try {
        // Simple ping to check if Redis is responsive
        await wsRedisClient.ping();
        console.log('✅ Redis connectivity check passed');
        return true;
    } catch (error) {
        console.error('❌ Redis connectivity check failed:', error.message);
        return false;
    }
};

// Start the server
const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 WebSocket server is running on ws://localhost:${PORT}/ws`);
        console.log(`🌐 API is available at http://localhost:${PORT}/api/v1`);
        console.log(`🔗 Health check: http://localhost:${PORT}/`);
        
        // Check Redis connectivity but don't block server startup if it fails
        checkRedisConnection().catch(err => {
            console.warn('⚠️ Warning: Redis connection check failed, but server will continue to run.');
            console.error('  Redis error details:', err.message);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});