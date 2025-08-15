import mongoose,{Schema} from "mongoose";

const messageSchema = new Schema({
    roomId:{
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
        index: true
    },
    senderId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    content :{
        type: String,
        required: true,
        trim: true,
        maxLength :[1000, 'Message cannot exceed 1000 characters' ]
    },
    messageType:{
        type: String,
        enum:["text","image","video","file"],
        default: "text"
    },
    fileUrl:{
        type: String,
        default: ''
    },
    fileName:{
        type: String,
        default: ''
    },
    fileSize:{
        type: Number,
        default: 0
    },

    deliveredTo:[{
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        deliveredAt: {
            type: Date,
            default: Date.now
        }
    }],
    readBy:[{
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        readAt:{
            type: Date,
            default: Date.now
        }
    }],
    status:{
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    replyTo:{
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    reactions:[{
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji:{
            type: String,
            required: true
        },
        reactedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted:{
        type: Boolean,
        default: false
    },
    deletedAt:{
        type: Date,
        default:null
    },

    isEdited:{
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    originalContent:{
        type: String,
        default: ''
    }
},{
    timestamps: true,
})


messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1});
messageSchema.index({createdAt:-1});
messageSchema.index({roomId:1, isDeleted:1});


/*
what is virtuals in mongoose in hinglish ?
Sidha baat karein toh, Mongoose mein "virtuals" ek tarah ka property hota hai jo ki schema ke andar define kiya ja sakta hai, lekin yeh database mein store nahi hota. Yeh properties aapko computed values ya relationships ko define karne ki suvidha deti hain bina kisi additional field ko database mein add kiye.
Virtuals ka istemal aap tab karte hain jab aapko kisi field ki value ko dynamically calculate karna ho ya kisi related document se data fetch karna ho bina usko directly store kiye. Yeh aapko flexibility aur efficiency deta hai, kyunki aap sirf zaroorat padne par hi inhe access karte hain.

example :-
messageSchema.virtual('formattedContent').get(function() {
    return this.content.trim().toUpperCase();
});
 
*/

messageSchema.virtual("isReady").get(function (){
    return (userId) => {
        return this.readBy.some(read => read.userId.toString() === userId.toString());
    }
})

//virtual for checking if a message is delivered to a specific user
messageSchema.virtual("isDelivered").get(function () {
    return (userId) => {
        return this.deliveredTo.some(delivered => delivered.userId.toString() === userId.toString());
    }
});


//method to mark message as delivered to a user
messageSchema.methods.markAsDelivered = function(userId) {
    const alreadtDelivered  = this.deliveredTo.some(delivered => delivered.userId.toString() === userId.toString());

    if(!alreadtDelivered){
        this.deliveredTo.push({
            userId: userId,
            deliveredAt: new Date()
        })
    }

    if(this.status === "send"){
        this.status = "delivered";
    } 

    return this.save();
}


messageSchema.methods.markAsRead = function(userId) {
    const alreadyRead = this.readBy.some(read => read.userId.toString() === userId.toString());
    if (!alreadyRead) {
        this.readBy.push({
            userId: userId,
            readAt: new Date()
        });

        const alreadyDelivered = this.deliveredTo.some(delivered => delivered.userId.toString() === userId.toString());
        if (!alreadyDelivered) {
            this.deliveredTo.push({
                userId: userId,
                deliveredAt: new Date()
            });
        }

        this.status = 'read';
    }

    return this.save();

}



messageSchema.methods.addReaction = function(userId,emoji){

    //if there is already a reaction from the user, update it

    this.reactions = this.reactions.filter(
        reaction => reaction.userId.toString() !== userId.toString()
    )

    this.reactions.push({
        userId: userId,
        emoji: emoji,
        reactedAt: new Date()
    })
    return this.save();
}


messageSchema.methods.removeReaction = function(userId) {
    this.reactions = this.reactions.filter(
        reaction => reaction.userId.toString() !== userId.toString()
    )
    return this.save();
}




///method to delete message

messageSchema.methods.deleteMessage = function(deletedBy) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
}


messageSchema.methods.editMessage = function(newContent){

    if(!this.isEdited){
        this.originalContent = this.content;
    }
}