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

// Store WebSocket connection instances (cannot be serialized to Redis)
const clients = new Map();

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
                        clients.set(userId, ws);
                        await redisOnlineUsersService.addOnlineUser(userId);
                        await redisClientService.setClient(userId, {
                            connectedAt: new Date().toISOString(),
                            lastSeen: new Date().toISOString()
                        });
                        
                        const userRoomsData = await Room.find({ participants: userId });
                        const roomIds = userRoomsData.map(room => room._id.toString());
                        
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
                        await redisRoomParticipantsService.removeRoomParticipant(roomId, userId);
                        await redisUserRoomsService.removeUserRoom(userId, roomId);
                        await redisJoinedRoomParticipantsService.removeJoinedRoomParticipant(roomId, userId);
                        await redisRoomParticipantsService.removeRoomIfEmpty(roomId);

                        ws.send(JSON.stringify({
                            type: "leftRoom",
                            roomId: roomId
                        }));
                        
                        break;
                    }

                    case "message": {
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

                        const newMessage = new Message({
                            roomId,
                            senderId: userId,
                            content
                        });
                        await newMessage.save();

                        await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

                        const populatedMessage = await Message.findById(newMessage._id)
                            .populate("senderId", "username name email profileImage");

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

                        await broadcastMessageToRoom(roomId, messageData, userId);
                        await Message.markRoomMessagesAsReadOnOpen(userId, roomId);
                        break;
                    }

                    case "typing": {
                        const isTyping = !!content;
                        
                        if (isTyping) {
                            await redisTypingUsersService.setTypingUser(userId, roomId);
                        } else {
                            await redisTypingUsersService.removeTypingUser(userId);
                        }

                        broadcastToRoom(roomId, {
                            type: "typing",
                            userId: userId,
                            roomId: roomId,
                            isTyping: isTyping
                        }, userId);
                        break;
                    }

                    case "getOnlineStatus": {
                        const user = await User.findById(userId).populate('friend', 'username name profileImage');
                        if (user && user.friend) {
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
                        const room = await Room.findById(roomId);
                        if (room && room.participants.includes(userId)) {
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
                clients.delete(currentUserId);
                redisOnlineUsersService.removeOnlineUser(currentUserId);
                redisTypingUsersService.removeTypingUser(currentUserId);
                cleanupUserRooms(currentUserId);
                broadcastOfflineStatus(currentUserId, wss);
            }
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    });

    return wss;
};

async function cleanupUserRooms(userId) {
    try {
        const userRooms = await redisUserRoomsService.getUserRooms(userId);
        
        for (const roomId of userRooms) {
            await redisRoomParticipantsService.removeRoomParticipant(roomId, userId);
            await redisJoinedRoomParticipantsService.removeJoinedRoomParticipant(roomId, userId);
            await redisRoomParticipantsService.removeRoomIfEmpty(roomId);
            
            broadcastToRoom(roomId, {
                type: "userOffline",
                userId: userId
            });
        }
        
        await redisUserRoomsService.removeAllUserRooms(userId);
    } catch (error) {
        console.error("Error cleaning up user rooms:", error);
    }
}

function broadcastToRoom(roomId, message, excludeUserId = null) {
    redisRoomParticipantsService.getRoomParticipants(roomId).then(participants => {
        participants.forEach(participantId => {
            if (excludeUserId && participantId === excludeUserId) {
                return;
            }
            
            const client = clients.get(participantId);
            if (client && client.readyState === 1) {
                try {
                    client.send(JSON.stringify(message));
                } catch (error) {
                    console.error("Error sending message to client:", error);
                    clients.delete(participantId);
                }
            }
        });
    }).catch(error => {
        console.error("Error getting room participants for broadcast:", error);
    });
}

async function broadcastMessageToRoom(roomId, messageData, excludeUserId = null) {
    try {
        const room = await Room.findById(roomId).populate('participants', '_id');
        if (!room) return;

        room.participants.forEach(participant => {
            const participantId = participant._id.toString();
            
            if (excludeUserId && participantId === excludeUserId) {
                return;
            }

            const client = clients.get(participantId);
            
            if (client && client.readyState === 1) {
                try {
                    client.send(JSON.stringify(messageData));
                } catch (error) {
                    console.error("Error sending message to client:", error);
                    clients.delete(participantId);
                }
            } else {
                redisOfflineMessageQueueService.addOfflineMessage(participantId, messageData);
            }
        });
    } catch (error) {
        console.error("Error broadcasting message to room:", error);
    }
}

async function deliverOfflineMessages(userId) {
    try {
        const messages = await redisOfflineMessageQueueService.getOfflineMessages(userId);
        const client = clients.get(userId);
        
        if (client && client.readyState === 1 && messages.length > 0) {
            client.send(JSON.stringify({
                type: "offlineMessages",
                count: messages.length,
                messages: messages
            }));
            
            await redisOfflineMessageQueueService.clearOfflineMessages(userId);
        }
    } catch (error) {
        console.error("Error delivering offline messages:", error);
    }
}

async function sendCurrentOnlineStatus(userId, ws) {
    try {
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        for (const friend of user.friend) {
            const friendId = friend._id.toString();
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

async function broadcastOnlineStatus(userId, wss) {
    try {
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        for (const friend of user.friend) {
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

async function broadcastOfflineStatus(userId, wss) {
    try {
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        for (const friend of user.friend) {
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

async function getOnlineUsersCount() {
    return await redisOnlineUsersService.getOnlineUsersCount();
}

async function getRoomParticipantsCount(roomId) {
    return await redisRoomParticipantsService.getRoomParticipantsCount(roomId);
}

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