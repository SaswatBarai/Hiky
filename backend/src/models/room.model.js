import mongoose, { Schema } from 'mongoose';

const roomSchema = new Schema({
    roomType: {
        type: String,
        enum: ["private", "group"],
        required: true
    },
    name: {
        type: String,
        trim: true,
        maxlength: [50, 'Room name must be at most 50 characters long']
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description must be at most 200 characters long']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});


roomSchema.index({ participants: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ createdBy: 1 });
roomSchema.index({ updatedAt: -1 });

// Compound index to prevent duplicate private rooms between same users
roomSchema.index(
    { roomType: 1, participants: 1 },
    { 
        unique: true,
        partialFilterExpression: { roomType: "private" }
    }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;