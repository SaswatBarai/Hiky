import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [20, "Username must be at most 20 characters long"],
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(value){
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: "Invalid email address",
        },
    },
    password:{
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters long"],
        maxlength: [20, "Password must be at most 20 characters long"],
        select: false,// it will not be returned in the response
    },
    profileImage:{
        image:{
            type: String,
            default: "https://via.placeholder.com/150",
            
        },
        publicId:{
            type: String,
            default: null,
        },
    },
    role:{
        type: String,
    }
},{
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;
