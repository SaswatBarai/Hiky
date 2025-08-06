import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { initializeWebSocket } from "./services/websocketService.js";
import app from "./app.js";
import { connectDB } from "./config/connectDB.js";


const server = http.createServer(app);

// Initialize WebSocket server
const wss = initializeWebSocket(server);

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Close WebSocket server
        wss.close(() => {
            console.log('WebSocket server closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        // Close WebSocket server
        wss.close(() => {
            console.log('WebSocket server closed');
            process.exit(0);
        });
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

// Start the server
const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 WebSocket server is running on ws://localhost:${PORT}/ws`);
        console.log(`🌐 API is available at http://localhost:${PORT}/api/v1`);
        console.log(`🔗 Health check: http://localhost:${PORT}/`);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});