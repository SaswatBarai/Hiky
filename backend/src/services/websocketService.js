import { WebSocketServer } from "ws";
import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

// Store client connections and user data
const clients = new Map(); // userId -> websocket connection
const userRooms = new Map(); // userId -> Set of roomIds
const roomParticipants = new Map(); // roomId -> Set of userIds
const joinedRoomParticipants = new Map(); // roomId -> Set of userIds who have joined
const typingUsers = new Map(); // userId -> roomId
const onlineUsers = new Set(); // Set of online userIds
const offlineMessageQueue = new Map(); // userId -> Array of pending messages

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
                const { type, userId, roomId, content, participants } = message;
                
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
                        // Register user connection
                        clients.set(userId, ws);
                        onlineUsers.add(userId);
                        
                        // Load user's rooms
                        const userRoomsData = await Room.find({ participants: userId });
                        const roomIds = userRoomsData.map(room => room._id.toString());
                        userRooms.set(userId, new Set(roomIds));
                        
                        // Add user to room participants
                        roomIds.forEach(roomId => {
                            if (!roomParticipants.has(roomId)) {
                                roomParticipants.set(roomId, new Set());
                            }
                            roomParticipants.get(roomId).add(userId);
                        });

                        ws.send(JSON.stringify({
                            type: "registered",
                            userId: userId,
                            message: "Successfully registered for WebSocket communication"
                        }));

                        // Send any pending offline messages
                        await deliverOfflineMessages(userId);

                        // Broadcast online status to friends
                        await broadcastOnlineStatus(userId, wss);
                        break;
                    }

                    case "joinRoom": {
                        // Join a specific room
                        if (!roomParticipants.has(roomId)) {
                            roomParticipants.set(roomId, new Set());
                        }
                        roomParticipants.get(roomId).add(userId);
                        
                        if (!userRooms.has(userId)) {
                            userRooms.set(userId, new Set());
                        }
                        userRooms.get(userId).add(roomId);

                        if(!joinedRoomParticipants.has(roomId)){
                            joinedRoomParticipants.set(roomId, new Set());
                        }
                        joinedRoomParticipants.get(roomId).add(userId);


                        ws.send(JSON.stringify({
                            type: "joinedRoom",
                            roomId: roomId,
                            participants: Array.from(roomParticipants.get(roomId))
                        }));

                        break;
                    }

                    case "leaveRoom": {
                        // Leave a specific room
                        if (roomParticipants.has(roomId)) {
                            roomParticipants.get(roomId).delete(userId);
                            if (roomParticipants.get(roomId).size === 0) {
                                roomParticipants.delete(roomId);
                            }
                        }
                        
                        if (userRooms.has(userId)) {
                            userRooms.get(userId).delete(roomId);
                        }

                        ws.send(JSON.stringify({
                            type: "leftRoom",
                            roomId: roomId
                        }));
                        
                        break;
                    }

                    case "message": {
                        // Validate room and user participation
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

                        // Save message to database
                        const newMessage = new Message({
                            roomId,
                            senderId: userId,
                            content
                        });
                        await newMessage.save();

                        // Update room's updatedAt timestamp
                        await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

                        // Get populated message
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
                        await Message.markAllAsRead(roomId,userId); 
                        break;
                    }

                    case "typing": {
                        const isTyping = !!content;
                        
                        if (isTyping) {
                            typingUsers.set(userId, roomId);
                        } else {
                            typingUsers.delete(userId);
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
                        // Send online status of user's friends
                        const user = await User.findById(userId).populate('friend', 'username name profileImage');
                        if (user && user.friend) {
                            const friendsStatus = user.friend.map(friend => ({
                                id: friend._id.toString(),
                                username: friend.username,
                                name: friend.name,
                                profileImage: friend.profileImage,
                                isOnline: onlineUsers.has(friend._id.toString())
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
                // Clean up user data
                clients.delete(currentUserId);
                onlineUsers.delete(currentUserId);
                typingUsers.delete(currentUserId);
                
                // Remove user from all rooms
                if (userRooms.has(currentUserId)) {
                    const rooms = userRooms.get(currentUserId);
                    rooms.forEach(roomId => {
                        if (roomParticipants.has(roomId)) {
                            roomParticipants.get(roomId).delete(currentUserId);
                            if (roomParticipants.get(roomId).size === 0) {
                                roomParticipants.delete(roomId);
                            }
                        }
                        
                        // Notify others in room that user is offline
                        broadcastToRoom(roomId, {
                            type: "userOffline",
                            userId: currentUserId
                        });
                    });
                    userRooms.delete(currentUserId);
                }

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

// Helper function to broadcast message to all participants in a room
function broadcastToRoom(roomId, message, excludeUserId = null) {
    if (roomParticipants.has(roomId)) {
        const participants = roomParticipants.get(roomId);
        participants.forEach(participantId => {
            if (excludeUserId && participantId === excludeUserId) {
                return;
            }
            
            const client = clients.get(participantId);
            if (client && client.readyState === 1) { // 1 = WebSocket.OPEN
                try {
                    client.send(JSON.stringify(message));
                } catch (error) {
                    console.error("Error sending message to client:", error);
                    // Remove dead connection
                    clients.delete(participantId);
                }
            }
        });
    }
}

// Enhanced function to broadcast messages and handle offline users
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
                // User is online, send message immediately
                try {
                    client.send(JSON.stringify(messageData));
                } catch (error) {
                    console.error("Error sending message to client:", error);
                    clients.delete(participantId);
                }
            } else {
                // User is offline, queue message for delivery when they come online
                if (!offlineMessageQueue.has(participantId)) {
                    offlineMessageQueue.set(participantId, []);
                }
                offlineMessageQueue.get(participantId).push(messageData);
                
                // Optional: Limit offline message queue size
                const queue = offlineMessageQueue.get(participantId);
                if (queue.length > 100) {
                    queue.shift(); // Remove oldest message
                }
            }
        });
    } catch (error) {
        console.error("Error broadcasting message to room:", error);
    }
}

// Deliver offline messages when user comes online
async function deliverOfflineMessages(userId) {
    if (offlineMessageQueue.has(userId)) {
        const messages = offlineMessageQueue.get(userId);
        const client = clients.get(userId);
        
        if (client && client.readyState === 1 && messages.length > 0) {
            // Send offline messages notification
            client.send(JSON.stringify({
                type: "offlineMessages",
                count: messages.length,
                messages: messages
            }));
            
            // Clear the queue
            offlineMessageQueue.delete(userId);
        }
    }
}

// Broadcast online status to friends
async function broadcastOnlineStatus(userId, wss) {
    try {
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        // Notify each friend that this user is online
        user.friend.forEach(friend => {
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
        });
    } catch (error) {
        console.error("Error broadcasting online status:", error);
    }
}

// Broadcast offline status to friends
async function broadcastOfflineStatus(userId, wss) {
    try {
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;

        // Notify each friend that this user is offline
        user.friend.forEach(friend => {
            const friendClient = clients.get(friend._id.toString());
            if (friendClient && friendClient.readyState === 1) {
                friendClient.send(JSON.stringify({
                    type: "friendOffline",
                    userId: userId
                }));
            }
        });
    } catch (error) {
        console.error("Error broadcasting offline status:", error);
    }
}

// Get online users count
function getOnlineUsersCount() {
    return onlineUsers.size;
}

// Get room participants count
function getRoomParticipantsCount(roomId) {
    return roomParticipants.has(roomId) ? roomParticipants.get(roomId).size : 0;
}

// Get offline message queue size for a user
function getOfflineMessageCount(userId) {
    return offlineMessageQueue.has(userId) ? offlineMessageQueue.get(userId).length : 0;
}

export { 
    initializeWebSocket, 
    broadcastOnlineStatus, 
    broadcastOfflineStatus,
    getOnlineUsersCount,
    getRoomParticipantsCount,
    getOfflineMessageCount
};