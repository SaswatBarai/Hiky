import mongoose,{Schema} from 'mongoose';


const messageSchema = new Schema({
    roomId :{
        type:Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    senderId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content:{
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
},{
    timestamps: true
})


const Message = mongoose.model('Message', messageSchema);
export default Message;