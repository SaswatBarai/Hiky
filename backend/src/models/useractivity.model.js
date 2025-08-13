import mongoose, { Schema } from 'mongoose';

const userActivitySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['online', 'away', 'busy', 'offline'],
        default: 'offline'
    },
    lastActiveRooms: [{
        roomId: {
            type: Schema.Types.ObjectId,
            ref: 'Room'
        },
        lastSeen: {
            type: Date,
            default: Date.now
        }
    }],
    deviceInfo: {
        userAgent: {
            type: String,
            default: ''
        },
        platform: {
            type: String,
            default: ''
        },
        ipAddress: {
            type: String,
            default: ''
        }
    },
    // For tracking typing indicators
    currentlyTypingIn: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    },
    typingStartedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
});

// Index for efficient queries
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ isOnline: 1 });
userActivitySchema.index({ lastSeen: -1 });
userActivitySchema.index({ 'lastActiveRooms.roomId': 1 });

// Method to update user's online status
userActivitySchema.methods.setOnline = function(deviceInfo = {}) {
    this.isOnline = true;
    this.status = 'online';
    this.lastSeen = new Date();
    this.deviceInfo = { ...this.deviceInfo, ...deviceInfo };
    return this.save();
};

// Method to set user offline
userActivitySchema.methods.setOffline = function() {
    this.isOnline = false;
    this.status = 'offline';
    this.lastSeen = new Date();
    this.currentlyTypingIn = null;
    this.typingStartedAt = null;
    return this.save();
};

// Method to update last seen in a specific room
userActivitySchema.methods.updateRoomActivity = function(roomId) {
    const existingRoom = this.lastActiveRooms.find(
        room => room.roomId.toString() === roomId.toString()
    );
    
    if (existingRoom) {
        existingRoom.lastSeen = new Date();
    } else {
        this.lastActiveRooms.push({
            roomId: roomId,
            lastSeen: new Date()
        });
    }
    
    this.lastSeen = new Date();
    return this.save();
};

// Method to set typing status
userActivitySchema.methods.setTyping = function(roomId, isTyping = true) {
    if (isTyping) {
        this.currentlyTypingIn = roomId;
        this.typingStartedAt = new Date();
    } else {
        this.currentlyTypingIn = null;
        this.typingStartedAt = null;
    }
    return this.save();
};

// Method to get last seen time in a specific room
userActivitySchema.methods.getLastSeenInRoom = function(roomId) {
    const roomActivity = this.lastActiveRooms.find(
        room => room.roomId.toString() === roomId.toString()
    );
    return roomActivity ? roomActivity.lastSeen : this.createdAt;
};

// Static method to get online users
userActivitySchema.statics.getOnlineUsers = function() {
    return this.find({ isOnline: true }).populate('userId', 'username name profileImage');
};

// Static method to get users who were online recently (within last 5 minutes)
userActivitySchema.statics.getRecentlyActiveUsers = function(minutes = 5) {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.find({
        lastSeen: { $gte: cutoffTime }
    }).populate('userId', 'username name profileImage');
};

// Static method to clean up old typing indicators (older than 10 seconds)
userActivitySchema.statics.cleanupTypingIndicators = function() {
    const cutoffTime = new Date(Date.now() - 10 * 1000); // 10 seconds ago
    return this.updateMany(
        {
            typingStartedAt: { $lt: cutoffTime }
        },
        {
            $unset: {
                currentlyTypingIn: 1,
                typingStartedAt: 1
            }
        }
    );
};

// Static method to get typing users in a room
userActivitySchema.statics.getTypingUsersInRoom = function(roomId) {
    const cutoffTime = new Date(Date.now() - 10 * 1000); // 10 seconds ago
    return this.find({
        currentlyTypingIn: roomId,
        typingStartedAt: { $gte: cutoffTime }
    }).populate('userId', 'username name profileImage');
};

// Pre-save middleware to update lastSeen
userActivitySchema.pre('save', function(next) {
    if (this.isModified('isOnline') && this.isOnline) {
        this.lastSeen = new Date();
    }
    next();
});

// Static method to find or create user activity
userActivitySchema.statics.findOrCreate = function(userId, deviceInfo = {}) {
    return this.findOneAndUpdate(
        { userId: userId },
        {
            $setOnInsert: {
                userId: userId,
                lastSeen: new Date(),
                isOnline: true,
                status: 'online',
                deviceInfo: deviceInfo
            }
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );
};

// Method to check if user was active in room after a certain timestamp
userActivitySchema.methods.wasActiveInRoomAfter = function(roomId, timestamp) {
    const lastSeenInRoom = this.getLastSeenInRoom(roomId);
    return lastSeenInRoom > timestamp;
};

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;