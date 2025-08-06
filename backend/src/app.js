import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from 'http';

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for WebSocket connections
}));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan("dev"));

// Cookie parser
app.use(cookieParser());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    message: {
        success: false,
        message: "Too many requests, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Hiky Chat API!',
        timestamp: new Date().toISOString()
    });
});

// API status endpoint
app.get('/api/v1/status', (req, res) => {
    res.json({
        success: true,
        message: 'API is running smoothly',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Import and use routes
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/messages", messageRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
});

export default app;