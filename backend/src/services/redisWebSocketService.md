# Redis WebSocket Service Documentation

## Overview

The `redisWebSocketService.js` provides a comprehensive Redis-based state management system for WebSocket connections in the Hiky chat application. This service replaces in-memory storage with Redis for better scalability, persistence, and multi-instance support.

## Architecture

### Redis Database Structure
- **Database 0**: Main application data
- **Database 1**: WebSocket-specific data (used by this service)
- **Database 2**: Application caching
- **Database 3**: User sessions

### Key Naming Convention
All Redis keys follow the pattern: `ws:{data_type}:{identifier}`

## Services

### 1. Client Connections Management (`redisClientService`)

Manages WebSocket client connection metadata in Redis.

#### Methods

##### `setClient(userId, connectionData)`
- **Purpose**: Store client connection metadata
- **Parameters**:
  - `userId` (string): Unique user identifier
  - `connectionData` (object): Connection metadata (connectedAt, lastSeen, etc.)
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `HSET ws:clients {userId} {JSON.stringify(connectionData)}`

##### `getClient(userId)`
- **Purpose**: Retrieve client connection data
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<object|null>` - Client data or null if not found
- **Redis Operation**: `HGET ws:clients {userId}`

##### `removeClient(userId)`
- **Purpose**: Remove client connection data
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `HDEL ws:clients {userId}`

##### `getAllClients()`
- **Purpose**: Get all client connections
- **Returns**: `Promise<object>` - Object with userId as keys and client data as values
- **Redis Operation**: `HGETALL ws:clients`

### 2. Online Users Management (`redisOnlineUsersService`)

Manages online user status using Redis Sets for efficient membership testing.

#### Methods

##### `addOnlineUser(userId)`
- **Purpose**: Mark user as online
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SADD ws:online_users {userId}`

##### `removeOnlineUser(userId)`
- **Purpose**: Mark user as offline
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SREM ws:online_users {userId}`

##### `isUserOnline(userId)`
- **Purpose**: Check if user is online
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Online status
- **Redis Operation**: `SISMEMBER ws:online_users {userId}`

##### `getOnlineUsers()`
- **Purpose**: Get all online user IDs
- **Returns**: `Promise<string[]>` - Array of online user IDs
- **Redis Operation**: `SMEMBERS ws:online_users`

##### `getOnlineUsersCount()`
- **Purpose**: Get count of online users
- **Returns**: `Promise<number>` - Number of online users
- **Redis Operation**: `SCARD ws:online_users`

### 3. User Rooms Management (`redisUserRoomsService`)

Manages user-room relationships using Redis Sets.

#### Methods

##### `addUserRoom(userId, roomId)`
- **Purpose**: Add room to user's room list
- **Parameters**:
  - `userId` (string): Unique user identifier
  - `roomId` (string): Unique room identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SADD ws:user_rooms:{userId} {roomId}`

##### `removeUserRoom(userId, roomId)`
- **Purpose**: Remove room from user's room list
- **Parameters**:
  - `userId` (string): Unique user identifier
  - `roomId` (string): Unique room identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SREM ws:user_rooms:{userId} {roomId}`

##### `getUserRooms(userId)`
- **Purpose**: Get all rooms for a user
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<string[]>` - Array of room IDs
- **Redis Operation**: `SMEMBERS ws:user_rooms:{userId}`

##### `removeAllUserRooms(userId)`
- **Purpose**: Remove all rooms for a user
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `DEL ws:user_rooms:{userId}`

### 4. Room Participants Management (`redisRoomParticipantsService`)

Manages room membership using Redis Sets.

#### Methods

##### `addRoomParticipant(roomId, userId)`
- **Purpose**: Add user to room participants
- **Parameters**:
  - `roomId` (string): Unique room identifier
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SADD ws:room_participants:{roomId} {userId}`

##### `removeRoomParticipant(roomId, userId)`
- **Purpose**: Remove user from room participants
- **Parameters**:
  - `roomId` (string): Unique room identifier
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SREM ws:room_participants:{roomId} {userId}`

##### `getRoomParticipants(roomId)`
- **Purpose**: Get all participants in a room
- **Parameters**:
  - `roomId` (string): Unique room identifier
- **Returns**: `Promise<string[]>` - Array of participant user IDs
- **Redis Operation**: `SMEMBERS ws:room_participants:{roomId}`

##### `getRoomParticipantsCount(roomId)`
- **Purpose**: Get count of participants in a room
- **Parameters**:
  - `roomId` (string): Unique room identifier
- **Returns**: `Promise<number>` - Number of participants
- **Redis Operation**: `SCARD ws:room_participants:{roomId}`

##### `removeRoomIfEmpty(roomId)`
- **Purpose**: Remove room if it has no participants
- **Parameters**:
  - `roomId` (string): Unique room identifier
- **Returns**: `Promise<boolean>` - True if room was removed, false if not empty
- **Redis Operation**: `SCARD` + `DEL` if count is 0

### 5. Joined Room Participants Management (`redisJoinedRoomParticipantsService`)

Manages users who have actively joined rooms (vs. just being participants).

#### Methods

##### `addJoinedRoomParticipant(roomId, userId)`
- **Purpose**: Mark user as having joined a room
- **Parameters**:
  - `roomId` (string): Unique room identifier
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SADD ws:joined_room_participants:{roomId} {userId}`

##### `removeJoinedRoomParticipant(roomId, userId)`
- **Purpose**: Mark user as having left a room
- **Parameters**:
  - `roomId` (string): Unique room identifier
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `SREM ws:joined_room_participants:{roomId} {userId}`

##### `getJoinedRoomParticipants(roomId)`
- **Purpose**: Get all users who have joined a room
- **Parameters**:
  - `roomId` (string): Unique room identifier
- **Returns**: `Promise<string[]>` - Array of joined user IDs
- **Redis Operation**: `SMEMBERS ws:joined_room_participants:{roomId}`

### 6. Typing Users Management (`redisTypingUsersService`)

Manages typing indicators with automatic expiration.

#### Methods

##### `setTypingUser(userId, roomId)`
- **Purpose**: Set user as typing in a room
- **Parameters**:
  - `userId` (string): Unique user identifier
  - `roomId` (string): Unique room identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operations**: 
  - `HSET ws:typing_users {userId} {roomId}`
  - `EXPIRE ws:typing_users:{userId} 10` (10 second TTL)

##### `removeTypingUser(userId)`
- **Purpose**: Remove user typing status
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `HDEL ws:typing_users {userId}`

##### `getTypingUser(userId)`
- **Purpose**: Get room where user is typing
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<string|null>` - Room ID or null if not typing
- **Redis Operation**: `HGET ws:typing_users {userId}`

##### `getAllTypingUsers()`
- **Purpose**: Get all users currently typing
- **Returns**: `Promise<object>` - Object with userId as keys and roomId as values
- **Redis Operation**: `HGETALL ws:typing_users`

### 7. Offline Message Queue Management (`redisOfflineMessageQueueService`)

Manages message queuing for offline users using Redis Lists.

#### Methods

##### `addOfflineMessage(userId, message)`
- **Purpose**: Add message to user's offline queue
- **Parameters**:
  - `userId` (string): Unique user identifier
  - `message` (object): Message data to queue
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operations**:
  - `LPUSH ws:offline_messages:{userId} {JSON.stringify(message)}`
  - `LTRIM ws:offline_messages:{userId} 0 99` (limit to 100 messages)

##### `getOfflineMessages(userId)`
- **Purpose**: Get all offline messages for user
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<object[]>` - Array of message objects
- **Redis Operation**: `LRANGE ws:offline_messages:{userId} 0 -1`

##### `clearOfflineMessages(userId)`
- **Purpose**: Clear all offline messages for user
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operation**: `DEL ws:offline_messages:{userId}`

##### `getOfflineMessageCount(userId)`
- **Purpose**: Get count of offline messages for user
- **Parameters**:
  - `userId` (string): Unique user identifier
- **Returns**: `Promise<number>` - Number of offline messages
- **Redis Operation**: `LLEN ws:offline_messages:{userId}`

### 8. Utility Functions (`redisUtilityService`)

Provides maintenance and monitoring functions.

#### Methods

##### `cleanupAllWebSocketData()`
- **Purpose**: Remove all WebSocket-related data from Redis
- **Returns**: `Promise<boolean>` - Success status
- **Redis Operations**:
  - `KEYS ws:*` - Find all WebSocket keys
  - `DEL {keys...}` - Delete all found keys
- **Use Case**: Testing, maintenance, or reset scenarios

##### `getRedisInfo()`
- **Purpose**: Get Redis server information
- **Returns**: `Promise<string|null>` - Redis INFO command output
- **Redis Operation**: `INFO`
- **Use Case**: Monitoring and debugging

##### `healthCheck()`
- **Purpose**: Test Redis connection
- **Returns**: `Promise<boolean>` - Connection status
- **Redis Operation**: `PING`
- **Use Case**: Health monitoring and startup checks

## Error Handling

All methods include comprehensive error handling:
- Try-catch blocks around Redis operations
- Console error logging with descriptive messages
- Graceful fallbacks (returning false, null, or empty arrays)
- No throwing of errors to prevent application crashes

## Performance Considerations

### Redis Data Types Used
- **Hash**: Client metadata, typing status
- **Set**: Online users, room participants, user rooms
- **List**: Offline message queues
- **String**: Individual keys with TTL

### Memory Optimization
- Automatic cleanup of empty rooms
- Message queue size limits (100 messages per user)
- TTL on typing status (10 seconds)
- Efficient set operations for membership testing

### Scalability Features
- Database separation for different data types
- Horizontal scaling support (multiple server instances)
- Persistent state across server restarts
- Atomic operations for data consistency

## Usage Examples

### 1. User Connection Flow
```javascript
import { 
    redisOnlineUsersService, 
    redisUserRoomsService,
    redisClientService,
    redisRoomParticipantsService
} from './redisWebSocketService.js';

// When user connects to WebSocket
async function handleUserConnection(userId, ws) {
    try {
        // Mark user as online
        await redisOnlineUsersService.addOnlineUser(userId);
        
        // Store connection metadata
        await redisClientService.setClient(userId, {
            connectedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            ipAddress: ws.remoteAddress
        });
        
        // Load user's rooms from database and sync to Redis
        const userRooms = await Room.find({ participants: userId });
        for (const room of userRooms) {
            await redisUserRoomsService.addUserRoom(userId, room._id.toString());
            await redisRoomParticipantsService.addRoomParticipant(room._id.toString(), userId);
        }
        
        console.log(`User ${userId} connected successfully`);
    } catch (error) {
        console.error('Error handling user connection:', error);
    }
}
```

### 2. Room Management
```javascript
// User joins a room
async function joinRoom(userId, roomId) {
    try {
        // Add user to room participants
        await redisRoomParticipantsService.addRoomParticipant(roomId, userId);
        
        // Add room to user's room list
        await redisUserRoomsService.addUserRoom(userId, roomId);
        
        // Mark user as having joined the room
        await redisJoinedRoomParticipantsService.addJoinedRoomParticipant(roomId, userId);
        
        // Get updated participant list
        const participants = await redisRoomParticipantsService.getRoomParticipants(roomId);
        
        console.log(`User ${userId} joined room ${roomId}. Participants: ${participants.length}`);
        return participants;
    } catch (error) {
        console.error('Error joining room:', error);
        return [];
    }
}

// User leaves a room
async function leaveRoom(userId, roomId) {
    try {
        // Remove user from room participants
        await redisRoomParticipantsService.removeRoomParticipant(roomId, userId);
        
        // Remove room from user's room list
        await redisUserRoomsService.removeUserRoom(userId, roomId);
        
        // Remove from joined participants
        await redisJoinedRoomParticipantsService.removeJoinedRoomParticipant(roomId, userId);
        
        // Check if room is empty and clean up
        await redisRoomParticipantsService.removeRoomIfEmpty(roomId);
        
        console.log(`User ${userId} left room ${roomId}`);
    } catch (error) {
        console.error('Error leaving room:', error);
    }
}
```

### 3. Message Broadcasting
```javascript
import { redisOfflineMessageQueueService } from './redisWebSocketService.js';

// Broadcast message to room participants
async function broadcastMessage(roomId, messageData, senderId) {
    try {
        // Get room participants from Redis
        const participants = await redisRoomParticipantsService.getRoomParticipants(roomId);
        
        for (const participantId of participants) {
            if (participantId === senderId) continue; // Skip sender
            
            // Check if user is online
            const isOnline = await redisOnlineUsersService.isUserOnline(participantId);
            
            if (isOnline) {
                // Send message immediately to online users
                const client = clients.get(participantId);
                if (client && client.readyState === 1) {
                    client.send(JSON.stringify(messageData));
                }
            } else {
                // Queue message for offline users
                await redisOfflineMessageQueueService.addOfflineMessage(participantId, messageData);
            }
        }
    } catch (error) {
        console.error('Error broadcasting message:', error);
    }
}
```

### 4. Typing Indicators
```javascript
import { redisTypingUsersService } from './redisWebSocketService.js';

// Handle typing status
async function handleTypingStatus(userId, roomId, isTyping) {
    try {
        if (isTyping) {
            // Set typing status with 10-second TTL
            await redisTypingUsersService.setTypingUser(userId, roomId);
        } else {
            // Remove typing status
            await redisTypingUsersService.removeTypingUser(userId);
        }
        
        // Broadcast typing status to room participants
        const participants = await redisRoomParticipantsService.getRoomParticipants(roomId);
        for (const participantId of participants) {
            if (participantId === userId) continue;
            
            const client = clients.get(participantId);
            if (client && client.readyState === 1) {
                client.send(JSON.stringify({
                    type: 'typing',
                    userId: userId,
                    roomId: roomId,
                    isTyping: isTyping
                }));
            }
        }
    } catch (error) {
        console.error('Error handling typing status:', error);
    }
}
```

### 5. Offline Message Delivery
```javascript
// Deliver offline messages when user comes online
async function deliverOfflineMessages(userId) {
    try {
        // Get offline messages from Redis
        const messages = await redisOfflineMessageQueueService.getOfflineMessages(userId);
        
        if (messages.length > 0) {
            const client = clients.get(userId);
            if (client && client.readyState === 1) {
                // Send offline messages notification
                client.send(JSON.stringify({
                    type: 'offlineMessages',
                    count: messages.length,
                    messages: messages
                }));
                
                // Clear the queue after delivery
                await redisOfflineMessageQueueService.clearOfflineMessages(userId);
                
                console.log(`Delivered ${messages.length} offline messages to user ${userId}`);
            }
        }
    } catch (error) {
        console.error('Error delivering offline messages:', error);
    }
}
```

### 6. User Disconnection Cleanup
```javascript
// Clean up when user disconnects
async function handleUserDisconnection(userId) {
    try {
        // Remove from online users
        await redisOnlineUsersService.removeOnlineUser(userId);
        
        // Remove typing status
        await redisTypingUsersService.removeTypingUser(userId);
        
        // Get user's rooms and clean up
        const userRooms = await redisUserRoomsService.getUserRooms(userId);
        
        for (const roomId of userRooms) {
            // Remove user from room participants
            await redisRoomParticipantsService.removeRoomParticipant(roomId, userId);
            await redisJoinedRoomParticipantsService.removeJoinedRoomParticipant(roomId, userId);
            
            // Remove room if empty
            await redisRoomParticipantsService.removeRoomIfEmpty(roomId);
            
            // Notify others in room that user is offline
            broadcastToRoom(roomId, {
                type: 'userOffline',
                userId: userId
            });
        }
        
        // Remove all user rooms
        await redisUserRoomsService.removeAllUserRooms(userId);
        
        // Remove client connection data
        await redisClientService.removeClient(userId);
        
        console.log(`User ${userId} disconnected and cleaned up`);
    } catch (error) {
        console.error('Error handling user disconnection:', error);
    }
}
```

### 7. Online Status Management
```javascript
// Get online status of friends
async function getFriendsOnlineStatus(userId) {
    try {
        // Get user's friends from database
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return [];
        
        // Check online status for each friend
        const friendsStatus = await Promise.all(
            user.friend.map(async (friend) => {
                const friendId = friend._id.toString();
                const isOnline = await redisOnlineUsersService.isUserOnline(friendId);
                
                return {
                    id: friendId,
                    username: friend.username,
                    name: friend.name,
                    profileImage: friend.profileImage,
                    isOnline: isOnline
                };
            })
        );
        
        return friendsStatus;
    } catch (error) {
        console.error('Error getting friends online status:', error);
        return [];
    }
}

// Broadcast online status to friends
async function broadcastOnlineStatus(userId) {
    try {
        const user = await User.findById(userId).populate('friend', 'username name profileImage');
        if (!user || !user.friend) return;
        
        for (const friend of user.friend) {
            const friendClient = clients.get(friend._id.toString());
            if (friendClient && friendClient.readyState === 1) {
                friendClient.send(JSON.stringify({
                    type: 'friendOnline',
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
        console.error('Error broadcasting online status:', error);
    }
}
```

### 8. Monitoring and Health Checks
```javascript
import { redisUtilityService } from './redisWebSocketService.js';

// Health check endpoint
async function healthCheck() {
    try {
        // Check Redis connection
        const isHealthy = await redisUtilityService.healthCheck();
        
        if (!isHealthy) {
            return { status: 'unhealthy', message: 'Redis connection failed' };
        }
        
        // Get Redis info
        const info = await redisUtilityService.getRedisInfo();
        
        // Get online users count
        const onlineCount = await redisOnlineUsersService.getOnlineUsersCount();
        
        return {
            status: 'healthy',
            redis: 'connected',
            onlineUsers: onlineCount,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Health check failed:', error);
        return { status: 'unhealthy', message: error.message };
    }
}

// Maintenance cleanup
async function performMaintenance() {
    try {
        console.log('Starting maintenance cleanup...');
        
        // Clean up all WebSocket data (use with caution)
        const cleaned = await redisUtilityService.cleanupAllWebSocketData();
        
        if (cleaned) {
            console.log('Maintenance cleanup completed successfully');
        } else {
            console.log('Maintenance cleanup failed');
        }
    } catch (error) {
        console.error('Error during maintenance:', error);
    }
}
```

### 9. Error Handling Patterns
```javascript
// Robust error handling wrapper
async function safeRedisOperation(operation, fallbackValue = null) {
    try {
        const result = await operation();
        return result;
    } catch (error) {
        console.error('Redis operation failed:', error);
        return fallbackValue;
    }
}

// Usage example
async function getUserRoomsSafely(userId) {
    return await safeRedisOperation(
        () => redisUserRoomsService.getUserRooms(userId),
        [] // fallback to empty array
    );
}

// Batch operations with error handling
async function batchUserOperations(userIds, operation) {
    const results = [];
    
    for (const userId of userIds) {
        try {
            const result = await operation(userId);
            results.push({ userId, success: true, result });
        } catch (error) {
            console.error(`Operation failed for user ${userId}:`, error);
            results.push({ userId, success: false, error: error.message });
        }
    }
    
    return results;
}
```

### 10. Real-world Integration Example
```javascript
// Complete WebSocket message handler
async function handleWebSocketMessage(ws, message) {
    try {
        const { type, userId, roomId, content } = JSON.parse(message);
        
        switch (type) {
            case 'register':
                await handleUserConnection(userId, ws);
                break;
                
            case 'joinRoom':
                const participants = await joinRoom(userId, roomId);
                ws.send(JSON.stringify({
                    type: 'joinedRoom',
                    roomId: roomId,
                    participants: participants
                }));
                break;
                
            case 'leaveRoom':
                await leaveRoom(userId, roomId);
                ws.send(JSON.stringify({
                    type: 'leftRoom',
                    roomId: roomId
                }));
                break;
                
            case 'message':
                const messageData = {
                    type: 'message',
                    roomId: roomId,
                    senderId: userId,
                    content: content,
                    timestamp: new Date().toISOString()
                };
                await broadcastMessage(roomId, messageData, userId);
                break;
                
            case 'typing':
                await handleTypingStatus(userId, roomId, !!content);
                break;
                
            case 'getOnlineStatus':
                const friendsStatus = await getFriendsOnlineStatus(userId);
                ws.send(JSON.stringify({
                    type: 'onlineStatus',
                    friends: friendsStatus
                }));
                break;
        }
    } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'An error occurred while processing your request'
        }));
    }
}
```

## Monitoring and Maintenance

### Health Checks
```javascript
// Check Redis connection
const isHealthy = await redisUtilityService.healthCheck();

// Get Redis information
const info = await redisUtilityService.getRedisInfo();
```

### Data Cleanup
```javascript
// Remove all WebSocket data (use with caution)
await redisUtilityService.cleanupAllWebSocketData();
```

## Dependencies

- `ioredis`: Redis client for Node.js
- `../config/connectRedis.js`: Redis connection configuration

## Notes

- All Redis operations are asynchronous and return Promises
- Error handling is built into each method
- Data is automatically serialized/deserialized as JSON
- Redis keys are automatically prefixed with `ws:`
- The service is designed to work with multiple server instances
- WebSocket connection objects themselves are NOT stored in Redis (they remain in memory)
