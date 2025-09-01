import { WebSocketServer } from "ws";
import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";
import {
    redisClientService,
    redisOnlineUsersService,
    redisUserRoomsService,
    redisRoomParticipantsService,
    redisJoinedRoomParticipantsService,
    redisTypingUsersService,
    redisOfflineMessageQueueService
} from "./redisWebSocketService.js";

// 🚨 IN-MEMORY STORAGE (NON-REDIS) - Keep for WebSocket instances only
// This Map stores actual WebSocket connection objects which cannot be serialized to Redis
const clients = new Map(); // userId -> websocket connection

const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({
        server,
        path: '/ws'
    });

    wss.on("connection", (ws) => {
        let currentUserId = null;
        console.log("New WebSocket connection established");

        ws.on("message", async (data) => {
            try {
                const message = JSON.parse(data.toString());
                const { type, userId, roomId, content, friendId } = message;

                currentUserId = userId;

                switch (type) {
                    case "test": {
                        ws.send(JSON.stringify({
                            type: "testResponse",
                            message: "WebSocket connection is working!",
                            timestamp: new Date().toISOString()
                        }));
                        break;
                    }

                    case "register": {
                        // 🚨 IN-MEMORY: Store WebSocket instance (cannot be serialized to Redis)
                        clients.set(userId, ws);
                        
                        // ✅ REDIS: Add user to online users set
                        await redisOnlineUsersService.addOnlineUser(userId);
                        
                        // ✅ REDIS: Store client connection metadata (not the actual WebSocket)
                        await redisClientService.setClient(userId, {
                            connectedAt: new Date().toISOString(),
                            lastSeen: new Date().toISOString()
                        });
                        
                        // Load user's rooms from MongoDB (persistent storage)
                        const userRoomsData = await Room.find({ participants: userId });
                        const roomIds = userRoomsData.map(room => room._id.toString());
                        
                        // ✅ REDIS: Store user rooms and room participants
                        for (const roomId of roomIds) {
                            await redisUserRoomsService.addUserRoom(userId, roomId);
                            await redisRoomParticipantsService.addRoomParticipant(roomId, userId);
                        }

                        ws.send(JSON.stringify({
                            type: "registered",
                            userId: userId,
                            message: "Successfully registered for WebSocket communication"
                        }));

                        // Send any pending offline messages
                        await deliverOfflineMessages(userId);

                        // Send current online status of all friends to this user
                        await sendCurrentOnlineStatus(userId, ws);

                        // Broadcast this user's online status to friends
                        await broadcastOnlineStatus(userId, wss);
                        
                        // Mark messages as delivered when user comes online (only once per session)
                        await Message.markMessagesAsDeliveredOnUserOnline(userId);
                        break;
                    }

                    case "joinRoom": {
                        // ✅ REDIS: Join a specific room
                        await redisRoomParticipantsService.addRoomParticipant(roomId, userId);
                        await redisUserRoomsService.addUserRoom(userId, roomId);
                        await redisJoinedRoomParticipantsService.addJoinedRoomParticipant(roomId, userId);

                        ws.send(JSON.stringify({
                            type: "joinedRoom",
                            roomId: roomId,
                            participants: await redisRoomParticipantsService.getRoomParticipants(roomId)
                        }));

                        break;
                    }

                    case "leaveRoom": {
                        // ✅ REDIS: Leave a specific room
                        await redisRoomParticipantsService.removeRoomParticipant(roomId, userId);
                        await redisUserRoomsService.removeUserRoom(userId, roomId);
                        await redisJoinedRoomParticipantsService.removeJoinedRoomParticipant(roomId, userId);
                        
                        // Remove room if no participants
                        await redisRoomParticipantsService.removeRoomIfEmpty(roomId);

                        ws.send(JSON.stringify({
                            type: "leftRoom",
                            roomId: roomId
                        }));
                        
                        break;
                    }

                    case "message": {
                        // Validate room and user participation (MongoDB check)
                        const room = await Room.findById(roomId);
                        if (!room) {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "Room not found"
                            }));
                            return;
                        }

                        if (!room.participants.includes(userId)) {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "You are not a participant of this room"
                            }));
                            return;
                        }

                        // Save message to MongoDB (persistent storage)
                        const newMessage = new Message({
                            roomId,
                            senderId: userId,
                            content
                        });
                        await newMessage.save();

                        // Update room's updatedAt timestamp in MongoDB
                        await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

                        // Get populated message from MongoDB
                        const populatedMessage = await Message.findById(newMessage._id)
                            .populate("senderId", "username name email profileImage");

                        // Prepare message data
                        const messageData = {
                            type: "message",
                            roomId,
                            messageId: newMessage._id,
                            senderId: userId,
                            content,
                            timestamp: newMessage.createdAt,
                            sender: {
                                _id: populatedMessage.senderId._id,
                                username: populatedMessage.senderId.username,
                                name: populatedMessage.senderId.name,
                                profileImage: populatedMessage.senderId.profileImage
                            }
                        };

                        // Broadcast message to online room participants and queue for offline ones
                        await broadcastMessageToRoom(roomId, messageData, userId);
                        
                        // Mark messages as read for the sender's room (only once)
                        await Message.markRoomMessagesAsReadOnOpen(userId, roomId);
                        break;
                    }

                    case "typing": {
                        const isTyping = !!content;
                        
                        if (isTyping) {
                            // ✅ REDIS: Set typing status with TTL
                            await redisTypingUsersService.setTypingUser(userId, roomId);
                        } else {
                            // ✅ REDIS: Remove typing status
                            await redisTypingUsersService.removeTypingUser(userId);
                        }

                        // Broadcast typing status to room participants
                        broadcastToRoom(roomId, {
                            type: "typing",
                            userId: userId,
                            roomId: roomId,
                            isTyping: isTyping
                        }, userId); // Exclude the typing user
                        break;
                    }

                    case "getOnlineStatus": {
                        // Get user's friends from MongoDB
                        const user = await User.findById(userId).populate('friend', 'username name profileImage');
                        if (user && user.friend) {
                            // ✅ REDIS: Check online status for each friend
                            const friendsStatus = await Promise.all(user.friend.map(async (friend) => {
                                const friendId = friend._id.toString();
                                const isOnline = await redisOnlineUsersService.isUserOnline(friendId);
                                return {
                                    id: friendId,
                                    username: friend.username,
                                    name: friend.name,
                                    profileImage: friend.profileImage,
                                    isOnline: isOnline
                                };
                            }));

                            ws.send(JSON.stringify({
                                type: "onlineStatus",
                                friends: friendsStatus
                            }));
                        }
                        break;
                    }

                    case "markAsRead": {
                        // Mark messages as read
                        const room = await Room.findById(roomId);
                        if (room && room.participants.includes(userId)) {
                            // Broadcast read receipt to other participants
                            broadcastToRoom(roomId, {
                                type: "messageRead",
                                userId: userId,
                                roomId: roomId,
                                timestamp: new Date()
                            }, userId);
                        }
                        break;
                    }

                    case "readReceipt" :{
                        console.log("Read receipt event occurred for room:", roomId, "user:", userId);
                        await Message.markRoomMessagesAsReadOnOpen(userId, roomId);
                        break;
                    }
                    default: {
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "Unknown message type"
                        }));
                        break;
                    }
                }
            } catch (error) {
                console.error("WebSocket message processing error:", error);
                ws.send(JSON.stringify({
                    type: "error",
                    message: "An error occurred while processing your request"
                }));
            }
        });

        ws.on("close", () => {
            console.log("WebSocket connection closed");
            if (currentUserId) {
                // 🚨 IN-MEMORY: Remove WebSocket instance
                clients.delete(currentUserId);
                
                // ✅ REDIS: Remove user from online users
                redisOnlineUsersService.removeOnlineUser(currentUserId);
                
                // ✅ REDIS: Remove typing status
                redisTypingUsersService.removeTypingUser(currentUserId);
                
                // ✅ REDIS: Clean up user rooms and participants
                cleanupUserRooms(currentUserId);
                
                // Broadcast offline status to friends
                broadcastOfflineStatus(currentUserId, wss);
            }
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    });

    return wss;
};

// Helper function to clean up user rooms (uses Redis)
async function cleanupUserRooms(userId) {
    try {
        // ✅ REDIS: Get user's rooms
        const userRooms = await redisUserRoomsService.getUserRooms(userId);
        
        for (const roomId of userRooms) {
            // ✅ REDIS: Remove user from room participants
            await redisRoomParticipantsService.removeRoomParticipant(roomId, userId);
            await redisJoinedRoomParticipantsService.removeJoinedRoomParticipant(roomId, userId);
            
            // ✅ REDIS: Remove room if no participants
            await redisRoomParticipantsService.removeRoomIfEmpty(roomId);
            
            // Notify others in room that user is offline
            broadcastToRoom(roomId, {
                type: "userOffline",
                userId: userId
            });
        }
        
        // ✅ REDIS: Remove all user rooms
        await redisUserRoomsService.removeAllUserRooms(userId);
    } catch (error) {
        console.error("Error cleaning up user rooms:", error);
    }
}

// Helper function to broadcast message to all participants in a room
function broadcastToRoom(roomId, message, excludeUserId = null) {
    // ✅ REDIS: Get room participants from Redis
    redisRoomParticipantsService.getRoomParticipants(roomId).then(participants => {
        participants.forEach(participantId => {
            if (excludeUserId && participantId === excludeUserId) {
                return;
            }
            
            // 🚨 IN-MEMORY: Get WebSocket instance from memory (cannot be in Redis)
            const client = clients.get(participantId);
            if (client && client.readyState === 1) { // 1 = WebSocket.OPEN
                try {
                    client.send(JSON.stringify(message));
                } catch (error) {
                    console.error("Error sending message to client:", error);
                    // 🚨 IN-MEMORY: Remove dead connection from memory
                    clients.delete(participantId);
                }
            }
        });
    }).catch(error => {
        console.error("Error getting room participants for broadcast:", error);
    });
}

// Enhanced function to broadcast messages and handle offline users
async function broadcastMessageToRoom(roomId, messageData, excludeUserId = null) {
    try {
        // Get room participants from MongoDB (persistent storage)
        const room = await Room.findById(roomId).populate('participants', '_id');
        if (!room) return;

        room.participants.forEach(participant => {
            const participantId = participant._id.toString();
            
            if (excludeUserId && participantId === excludeUserId) {
                return;
            }

            // 🚨 IN-MEMORY: Get WebSocket instance from memory
            const client = clients.get(participantId);
            
            if (client && client.readyState === 1) {
                // User is online, send message immediately via WebSocket
                try {
                    client.send(JSON.stringify(messageData));
                } catch (error) {
                    console.error("Error sending message to client:", error);
                    // 🚨 IN-MEMORY: Remove dead connection from memory
                    clients.delete(participantId);
                }
            } else {
                // User is offline, queue message for delivery when they come online
                // ✅ REDIS: Add to offline message queue
                redisOfflineMessageQueueService.addOfflineMessage(participantId, messageData);
            }
        });
    } catch (error) {
        console.error("Error broadcasting message to room:", error);
    }
}

// Deliver offline messages when user comes online
async function deliverOfflineMessages(userId) {
    try {
        // ✅ REDIS: Get offline messages from Redis
        const messages = await redisOfflineMessageQueueService.getOfflineMessages(userId);
        
        // 🚨 IN-MEMORY: Get WebSocket instance from memory
        const client = clients.get(userId);
        
        if (client && client.readyState === 1 && messages.length > 0) {
            // Send offline messages notification
            client.send(JSON.stringify({
                type: "offlineMessages",
                count: messages.length,
                messages: messages
            }));
            
            // ✅ REDIS: Clear the queue
            await redisOfflineMessageQueueService.clearOfflineMessages(userId);
        }
    } catch (error) {
        console.error("Error delivering offline messages:", error);
    }
}

// Send current online status of all friends to a newly connected user
async function sendCurrentOnlineStatus(userId, ws) {
    try {
        // Get user's friends from MongoDB
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        // Check which friends are currently online using Redis
        for (const friend of user.friend) {
            const friendId = friend._id.toString();
            // ✅ REDIS: Check online status
            const isOnline = await redisOnlineUsersService.isUserOnline(friendId);
            
            if (isOnline) {
                ws.send(JSON.stringify({
                    type: "friendOnline",
                    userId: friendId,
                    user: {
                        id: friendId,
                        username: friend.username,
                        name: friend.name,
                        profileImage: friend.profileImage
                    }
                }));
            }
        }
    } catch (error) {
        console.error("Error sending current online status:", error);
    }
}

// Broadcast online status to friends
async function broadcastOnlineStatus(userId, wss) {
    try {
        // Get user's friends from MongoDB
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        // Notify each friend that this user is online
        for (const friend of user.friend) {
            // 🚨 IN-MEMORY: Get friend's WebSocket instance from memory
            const friendClient = clients.get(friend._id.toString());
            if (friendClient && friendClient.readyState === 1) {
                friendClient.send(JSON.stringify({
                    type: "friendOnline",
                    userId: userId,
                    user: {
                        id: userId,
                        username: user.username,
                        name: user.name,
                        profileImage: user.profileImage
                    }
                }));
            }
        }
    } catch (error) {
        console.error("Error broadcasting online status:", error);
    }
}

// Broadcast offline status to friends
async function broadcastOfflineStatus(userId, wss) {
    try {
        // Get user's friends from MongoDB
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        // Notify each friend that this user is offline
        for (const friend of user.friend) {
            // 🚨 IN-MEMORY: Get friend's WebSocket instance from memory
            const friendClient = clients.get(friend._id.toString());
            if (friendClient && friendClient.readyState === 1) {
                friendClient.send(JSON.stringify({
                    type: "friendOffline",
                    userId: userId
                }));
            }
        }
    } catch (error) {
        console.error("Error broadcasting offline status:", error);
    }
}

// Get online users count (uses Redis)
async function getOnlineUsersCount() {
    return await redisOnlineUsersService.getOnlineUsersCount();
}

// Get room participants count (uses Redis)
async function getRoomParticipantsCount(roomId) {
    return await redisRoomParticipantsService.getRoomParticipantsCount(roomId);
}

// Get offline message queue size for a user (uses Redis)
async function getOfflineMessageCount(userId) {
    return await redisOfflineMessageQueueService.getOfflineMessageCount(userId);
}

export { 
    initializeWebSocket, 
    broadcastOnlineStatus, 
    broadcastOfflineStatus,
    getOnlineUsersCount,
    getRoomParticipantsCount,
    getOfflineMessageCount
};