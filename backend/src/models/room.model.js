import mongoose,{Schema} from 'mongoose';


const roomSchema = new Schema({
    roomType:{
        type:String,
        enum:[
            "private",
            "group"
        ],
        required:true
    },
    name:{
        type:String,
        trim:true,
    },
    participants:[
        {
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ],
    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
}
,{
    timestamps:true,
})


//Indexinhg 
roomSchema.index({participants:1,createdBy:1},{unique:true});

const Room = mongoose.model("Room",roomSchema);
export default Room;