import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
    roomId: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
        index: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Message content must be at most 1000 characters long']
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'video'],
        default: 'text'
    },
    fileUrl: {
        type: String,
        default: ''
    },
    fileName: {
        type: String,
        default: ''
    },
    fileSize: {
        type: Number,
        default: 0
    },
    // Read receipts and delivery status
    deliveredTo: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        deliveredAt: {
            type: Date,
            default: Date.now
        }
    }],
    readBy: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Message status
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    // Reply functionality
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    // Message reactions
    reactions: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: {
            type: String,
            required: true
        },
        reactedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Edit functionality
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    originalContent: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

// Indexes for better query performance
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ roomId: 1, isDeleted: 1 });

// Virtual to check if message is read by specific user
messageSchema.virtual('isReadBy').get(function() {
    return (userId) => {
        return this.readBy.some(read => read.userId.toString() === userId.toString());
    };
});

// Virtual to check if message is delivered to specific user
messageSchema.virtual('isDeliveredTo').get(function() {
    return (userId) => {
        return this.deliveredTo.some(delivery => delivery.userId.toString() === userId.toString());
    };
});

// Method to mark message as delivered to a user
messageSchema.methods.markAsDelivered = function(userId) {
    const alreadyDelivered = this.deliveredTo.some(
        delivery => delivery.userId.toString() === userId.toString()
    );
    
    if (!alreadyDelivered) {
        this.deliveredTo.push({
            userId: userId,
            deliveredAt: new Date()
        });
        
        // Update status if this is the first delivery
        if (this.status === 'sent') {
            this.status = 'delivered';
        }
    }
    
    return this.save();
};

// Method to mark message as read by a user
messageSchema.methods.markAsRead = function(userId) {
    const alreadyRead = this.readBy.some(
        read => read.userId.toString() === userId.toString()
    );
    
    if (!alreadyRead) {
        this.readBy.push({
            userId: userId,
            readAt: new Date()
        });
        
        // Also mark as delivered if not already
        const alreadyDelivered = this.deliveredTo.some(
            delivery => delivery.userId.toString() === userId.toString()
        );
        
        if (!alreadyDelivered) {
            this.deliveredTo.push({
                userId: userId,
                deliveredAt: new Date()
            });
        }
        
        this.status = 'read';
    }
    
    return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
    // Remove existing reaction from this user
    this.reactions = this.reactions.filter(
        reaction => reaction.userId.toString() !== userId.toString()
    );
    
    // Add new reaction
    this.reactions.push({
        userId: userId,
        emoji: emoji,
        reactedAt: new Date()
    });
    
    return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
    this.reactions = this.reactions.filter(
        reaction => reaction.userId.toString() !== userId.toString()
    );
    
    return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function(deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    
    return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
    if (!this.isEdited) {
        this.originalContent = this.content;
        this.isEdited = true;
    }
    
    this.content = newContent;
    this.editedAt = new Date();
    
    return this.save();
};

// Pre-save middleware to update timestamps
messageSchema.pre('save', function(next) {
    if (this.isModified('content') && !this.isNew) {
        this.editedAt = new Date();
        if (!this.isEdited) {
            this.isEdited = true;
            if (!this.originalContent) {
                this.originalContent = this.content;
            }
        }
    }
    next();
});

// Static method to get unread messages count for a user in a room
messageSchema.statics.getUnreadCount = function(roomId, userId) {
    return this.countDocuments({
        roomId: roomId,
        senderId: { $ne: userId },
        isDeleted: false,
        'readBy.userId': { $ne: userId }
    });
};

// Static method to mark all messages in a room as read by a user
messageSchema.statics.markAllAsRead = function(roomId, userId) {
    return this.updateMany(
        {
            roomId: roomId,
            senderId: { $ne: userId },
            isDeleted: false,
            'readBy.userId': { $ne: userId }
        },
        {
            $addToSet: {
                readBy: {
                    userId: userId,
                    readAt: new Date()
                },
                deliveredTo: {
                    userId: userId,
                    deliveredAt: new Date()
                }
            },
            $set: {
                status: 'read'
            }
        }
    );
};

const Message = mongoose.model('Message', messageSchema);
export default Message;