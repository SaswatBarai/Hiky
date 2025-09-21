import { Router } from 'express';
import {
    createRoom,
    sendMessage,
    getMessages,
    getUserRooms,
    searchUsers,
    deleteRoom,
    markMessagesAsRead,
    createPrivateRoom
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateSchema } from '../validation/validationMiddleware.js';
import {
    createRoomSchema,
    createPrivateRoomSchema,
    sendMessageSchema,
    getMessagesParamsSchema,
    getMessagesQuerySchema,
    searchUsersQuerySchema,
    deleteRoomParamsSchema,
    markMessagesAsReadParamsSchema
} from '../validation/message.validation.js';

const router = Router();

// All message routes require authentication
router.use(authMiddleware);

// Room routes
router.post("/create-room", validateSchema(createRoomSchema), createRoom);
router.post("/create-private-room", validateSchema(createPrivateRoomSchema), createPrivateRoom);
router.get("/rooms", getUserRooms);
router.delete("/room/:roomId", validateSchema(deleteRoomParamsSchema, 'params'), deleteRoom);

// Message routes
router.post("/send-message", validateSchema(sendMessageSchema), sendMessage);
router.get("/messages/:roomId", validateSchema(getMessagesParamsSchema, 'params'), validateSchema(getMessagesQuerySchema, 'query'), getMessages);
router.post("/mark-read/:roomId", validateSchema(markMessagesAsReadParamsSchema, 'params'), markMessagesAsRead);

// User search route
router.get("/search-users", validateSchema(searchUsersQuerySchema, 'query'), searchUsers);

export default router;