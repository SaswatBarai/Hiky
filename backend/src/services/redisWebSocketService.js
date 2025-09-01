import { wsRedisClient } from "../config/connectRedis.js";

// Redis key prefixes for different data types
const REDIS_KEYS = {
    CLIENTS: 'ws:clients',
    USER_ROOMS: 'ws:user_rooms',
    ROOM_PARTICIPANTS: 'ws:room_participants',
    JOINED_ROOM_PARTICIPANTS: 'ws:joined_room_participants',
    TYPING_USERS: 'ws:typing_users',
    ONLINE_USERS: 'ws:online_users',
    OFFLINE_MESSAGE_QUEUE: 'ws:offline_messages',
    USER_CONNECTIONS: 'ws:user_connections'
};

// Helper function to create Redis keys
const createKey = (prefix, identifier) => `${prefix}:${identifier}`;

// Client connections management
export const redisClientService = {
    // Store client connection (userId -> connection data)
    async setClient(userId, connectionData) {
        try {
            await wsRedisClient.hset(REDIS_KEYS.CLIENTS, userId, JSON.stringify(connectionData));
            return true;
        } catch (error) {
            console.error('Error setting client in Redis:', error);
            return false;
        }
    },

    // Get client connection data
    async getClient(userId) {
        try {
            const data = await wsRedisClient.hget(REDIS_KEYS.CLIENTS, userId);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting client from Redis:', error);
            return null;
        }
    },

    // Remove client connection
    async removeClient(userId) {
        try {
            await wsRedisClient.hdel(REDIS_KEYS.CLIENTS, userId);
            return true;
        } catch (error) {
            console.error('Error removing client from Redis:', error);
            return false;
        }
    },

    // Get all clients
    async getAllClients() {
        try {
            const clients = await wsRedisClient.hgetall(REDIS_KEYS.CLIENTS);
            const result = {};
            for (const [userId, data] of Object.entries(clients)) {
                result[userId] = JSON.parse(data);
            }
            return result;
        } catch (error) {
            console.error('Error getting all clients from Redis:', error);
            return {};
        }
    }
};

// Online users management
export const redisOnlineUsersService = {
    // Add user to online users set
    async addOnlineUser(userId) {
        try {
            await wsRedisClient.sadd(REDIS_KEYS.ONLINE_USERS, userId);
            return true;
        } catch (error) {
            console.error('Error adding online user to Redis:', error);
            return false;
        }
    },

    // Remove user from online users set
    async removeOnlineUser(userId) {
        try {
            await wsRedisClient.srem(REDIS_KEYS.ONLINE_USERS, userId);
            return true;
        } catch (error) {
            console.error('Error removing online user from Redis:', error);
            return false;
        }
    },

    // Check if user is online
    async isUserOnline(userId) {
        try {
            return await wsRedisClient.sismember(REDIS_KEYS.ONLINE_USERS, userId);
        } catch (error) {
            console.error('Error checking online status in Redis:', error);
            return false;
        }
    },

    // Get all online users
    async getOnlineUsers() {
        try {
            return await wsRedisClient.smembers(REDIS_KEYS.ONLINE_USERS);
        } catch (error) {
            console.error('Error getting online users from Redis:', error);
            return [];
        }
    },

    // Get online users count
    async getOnlineUsersCount() {
        try {
            return await wsRedisClient.scard(REDIS_KEYS.ONLINE_USERS);
        } catch (error) {
            console.error('Error getting online users count from Redis:', error);
            return 0;
        }
    }
};

// User rooms management
export const redisUserRoomsService = {
    // Add room to user's rooms
    async addUserRoom(userId, roomId) {
        try {
            const key = createKey(REDIS_KEYS.USER_ROOMS, userId);
            await wsRedisClient.sadd(key, roomId);
            return true;
        } catch (error) {
            console.error('Error adding user room to Redis:', error);
            return false;
        }
    },

    // Remove room from user's rooms
    async removeUserRoom(userId, roomId) {
        try {
            const key = createKey(REDIS_KEYS.USER_ROOMS, userId);
            await wsRedisClient.srem(key, roomId);
            return true;
        } catch (error) {
            console.error('Error removing user room from Redis:', error);
            return false;
        }
    },

    // Get user's rooms
    async getUserRooms(userId) {
        try {
            const key = createKey(REDIS_KEYS.USER_ROOMS, userId);
            return await wsRedisClient.smembers(key);
        } catch (error) {
            console.error('Error getting user rooms from Redis:', error);
            return [];
        }
    },

    // Remove all user rooms
    async removeAllUserRooms(userId) {
        try {
            const key = createKey(REDIS_KEYS.USER_ROOMS, userId);
            await wsRedisClient.del(key);
            return true;
        } catch (error) {
            console.error('Error removing all user rooms from Redis:', error);
            return false;
        }
    }
};

// Room participants management
export const redisRoomParticipantsService = {
    // Add participant to room
    async addRoomParticipant(roomId, userId) {
        try {
            const key = createKey(REDIS_KEYS.ROOM_PARTICIPANTS, roomId);
            await wsRedisClient.sadd(key, userId);
            return true;
        } catch (error) {
            console.error('Error adding room participant to Redis:', error);
            return false;
        }
    },

    // Remove participant from room
    async removeRoomParticipant(roomId, userId) {
        try {
            const key = createKey(REDIS_KEYS.ROOM_PARTICIPANTS, roomId);
            await wsRedisClient.srem(key, userId);
            return true;
        } catch (error) {
            console.error('Error removing room participant from Redis:', error);
            return false;
        }
    },

    // Get room participants
    async getRoomParticipants(roomId) {
        try {
            const key = createKey(REDIS_KEYS.ROOM_PARTICIPANTS, roomId);
            return await wsRedisClient.smembers(key);
        } catch (error) {
            console.error('Error getting room participants from Redis:', error);
            return [];
        }
    },

    // Get room participants count
    async getRoomParticipantsCount(roomId) {
        try {
            const key = createKey(REDIS_KEYS.ROOM_PARTICIPANTS, roomId);
            return await wsRedisClient.scard(key);
        } catch (error) {
            console.error('Error getting room participants count from Redis:', error);
            return 0;
        }
    },

    // Remove room if no participants
    async removeRoomIfEmpty(roomId) {
        try {
            const count = await this.getRoomParticipantsCount(roomId);
            if (count === 0) {
                const key = createKey(REDIS_KEYS.ROOM_PARTICIPANTS, roomId);
                await wsRedisClient.del(key);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing empty room from Redis:', error);
            return false;
        }
    }
};

// Joined room participants management
export const redisJoinedRoomParticipantsService = {
    // Add user to joined room participants
    async addJoinedRoomParticipant(roomId, userId) {
        try {
            const key = createKey(REDIS_KEYS.JOINED_ROOM_PARTICIPANTS, roomId);
            await wsRedisClient.sadd(key, userId);
            return true;
        } catch (error) {
            console.error('Error adding joined room participant to Redis:', error);
            return false;
        }
    },

    // Remove user from joined room participants
    async removeJoinedRoomParticipant(roomId, userId) {
        try {
            const key = createKey(REDIS_KEYS.JOINED_ROOM_PARTICIPANTS, roomId);
            await wsRedisClient.srem(key, userId);
            return true;
        } catch (error) {
            console.error('Error removing joined room participant from Redis:', error);
            return false;
        }
    },

    // Get joined room participants
    async getJoinedRoomParticipants(roomId) {
        try {
            const key = createKey(REDIS_KEYS.JOINED_ROOM_PARTICIPANTS, roomId);
            return await wsRedisClient.smembers(key);
        } catch (error) {
            console.error('Error getting joined room participants from Redis:', error);
            return [];
        }
    }
};

// Typing users management
export const redisTypingUsersService = {
    // Set user typing status
    async setTypingUser(userId, roomId) {
        try {
            await wsRedisClient.hset(REDIS_KEYS.TYPING_USERS, userId, roomId);
            // Set TTL for typing status (e.g., 10 seconds)
            await wsRedisClient.expire(createKey(REDIS_KEYS.TYPING_USERS, userId), 10);
            return true;
        } catch (error) {
            console.error('Error setting typing user in Redis:', error);
            return false;
        }
    },

    // Remove user typing status
    async removeTypingUser(userId) {
        try {
            await wsRedisClient.hdel(REDIS_KEYS.TYPING_USERS, userId);
            return true;
        } catch (error) {
            console.error('Error removing typing user from Redis:', error);
            return false;
        }
    },

    // Get user typing status
    async getTypingUser(userId) {
        try {
            return await wsRedisClient.hget(REDIS_KEYS.TYPING_USERS, userId);
        } catch (error) {
            console.error('Error getting typing user from Redis:', error);
            return null;
        }
    },

    // Get all typing users
    async getAllTypingUsers() {
        try {
            return await wsRedisClient.hgetall(REDIS_KEYS.TYPING_USERS);
        } catch (error) {
            console.error('Error getting all typing users from Redis:', error);
            return {};
        }
    }
};

// Offline message queue management
export const redisOfflineMessageQueueService = {
    // Add message to offline queue
    async addOfflineMessage(userId, message) {
        try {
            const key = createKey(REDIS_KEYS.OFFLINE_MESSAGE_QUEUE, userId);
            await wsRedisClient.lpush(key, JSON.stringify(message));
            // Limit queue size to 100 messages
            await wsRedisClient.ltrim(key, 0, 99);
            return true;
        } catch (error) {
            console.error('Error adding offline message to Redis:', error);
            return false;
        }
    },

    // Get offline messages for user
    async getOfflineMessages(userId) {
        try {
            const key = createKey(REDIS_KEYS.OFFLINE_MESSAGE_QUEUE, userId);
            const messages = await wsRedisClient.lrange(key, 0, -1);
            return messages.map(msg => JSON.parse(msg));
        } catch (error) {
            console.error('Error getting offline messages from Redis:', error);
            return [];
        }
    },

    // Clear offline messages for user
    async clearOfflineMessages(userId) {
        try {
            const key = createKey(REDIS_KEYS.OFFLINE_MESSAGE_QUEUE, userId);
            await wsRedisClient.del(key);
            return true;
        } catch (error) {
            console.error('Error clearing offline messages from Redis:', error);
            return false;
        }
    },

    // Get offline message count for user
    async getOfflineMessageCount(userId) {
        try {
            const key = createKey(REDIS_KEYS.OFFLINE_MESSAGE_QUEUE, userId);
            return await wsRedisClient.llen(key);
        } catch (error) {
            console.error('Error getting offline message count from Redis:', error);
            return 0;
        }
    }
};

// Utility functions
export const redisUtilityService = {
    // Clean up all WebSocket data (useful for testing or maintenance)
    async cleanupAllWebSocketData() {
        try {
            const keys = await wsRedisClient.keys('ws:*');
            if (keys.length > 0) {
                await wsRedisClient.del(...keys);
            }
            return true;
        } catch (error) {
            console.error('Error cleaning up WebSocket data from Redis:', error);
            return false;
        }
    },

    // Get Redis info
    async getRedisInfo() {
        try {
            const info = await wsRedisClient.info();
            return info;
        } catch (error) {
            console.error('Error getting Redis info:', error);
            return null;
        }
    },

    // Health check
    async healthCheck() {
        try {
            await wsRedisClient.ping();
            return true;
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }
};
