import { Router } from 'express';
import {
    createRoom,
    sendMessage,
    getMessages,
    getUserRooms,
    searchUsers,
    deleteRoom,
    markMessagesAsRead
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// All message routes require authentication
router.use(authMiddleware);

// Room routes
router.post("/create-room", createRoom);
router.get("/rooms", getUserRooms);
router.delete("/room/:roomId", deleteRoom);

// Message routes
router.post("/send-message", sendMessage);
router.get("/messages/:roomId", getMessages);
router.post("/mark-read/:roomId", markMessagesAsRead);

// User search route
router.get("/search-users", searchUsers);

export default router;