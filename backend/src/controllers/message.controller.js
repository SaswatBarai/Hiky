import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js"




export const createRoom = async (req,res) => {
    const {roomType, participants,name} = req.body;

    const user = req.user;
    try {
        if(!roomType || !participants || participants.length < 2){
            return res.status(400).json({
                success: false,
                message: "Invalid room data"
            })
        }
        
        if(roomType === "private" && participants.length !== 2){
            return res.status(400).json({
                success: false,
                message: "Private room must have exactly 2 participants"
            })
        }

        if(roomType === "group" && !name){
            return res.status(400).json({
                success: false,
                message: "Group room must have a name"
            })
        }


        const users = await User.find({_id : {$in:participants}});

        if(users.length !== participants.length){
            return res.status(400).json({
                success: false,
                message:"Invalid user IDs"
            })
        }


        let room;
        if(roomType === "private"){
            room = await Room.create({
                roomType,
                participants,
            })

            if(room){
                return res.json({roomId:room._id});
            }

            // i will extract the other use id
            const otherUserId = participants.find(id  => id.toString() !== user._id.toString());

            User.findByIdAndUpdate(user._id,{
                //add to friend  array
                $push:{
                    friend:otherUserId
                }

            })

        }

        if(roomType === "group"){
            room = await Room.create({
                roomType,
                participants,
                name,
                createdBy: user._id
            })
        }
    } catch (error) {
        console.error("Error creating room:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


export const sendMessage = async(req,res) => {
    const {roomId,senderId,content} = req.body;

    try {
        if(!roomId || !senderId || !content){
            return res.status(400).json({
                success:false,
                message:"issing required fields"
            })
        }

        const room = await Room.findById(roomId);

        if(!room){
            return res.status(404).json({
                success:false,
                message:"Room not found"
            })
        }

        if(!room.participants.includes(senderId)){
            return res.status(403).json({
                success:false,
                message:"Sender is not a participant of the room"
            })
        }

        const message = await Message.create({
            roomId,
            senderId,
            content
        })
        await message.save()

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            messageId : message._id
        })

    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


const getMessages = async (req, res) => {
    const { roomId } = req.params;
    const {limit = 20, offset = 0} = req.query;
    const userId = req.user._id;
    //offset mean in simple word is used to skip the first n messages
    try {
        //let us check if the room exists and if the user is a participant
        const room = await Room.findById(roomId).populate('participants', 'name email'); 
        //? why we r using populate for field ? 
        // _id: 'room123',
        //  roomType: 'private',
        //  participants: [
            //         { _id: 'userA_id', name: 'Alice', email: 'alice@email.com' },
            //         { _id: 'userB_id', name: 'Bob', email: 'bob@email.com' }
            //             ];
            
            //if room not found
            if(!room){
                return res.status(404).json({
                    success: false,
                    message: "Room not found"
                });
            }
        //room contain the userId or not
        for(let i = 0; i<room.participants.length; i++)
        {
            if(room.participants[i]._id.toString() === userId.toString()){
                break;
            }

            if(i === room.participants.length - 1){
                return res.status(403).json({
                    success: false,
                    message: "You are not a participant of this room"
                });
            }
        }

        //if room found then we will get the messages
        const messages = await Message.find({roomId})
            .sort({createdAt: -1}) // Sort by createdAt in descending order
            .skip(parseInt(offset)) // Skip the first 'offset' messages
            .limit(parseInt(limit)) // Limit to 'limit' messages
            .populate('senderId', 'name username email'); // Populate senderId with name, username, and email

        return res.status(200).json({
            success: true,
            messages: messages.reverse(), // Reverse to show oldest first   
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}



export const getUserRoom = async (req, res) => {
    const userId = req.user._id;

    try {
        // Find all rooms where the user is a participant
        const rooms = await Room.find({ participants: userId })
            .populate('participants', 'name email') // Populate participants with name and email
            .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order
        // If no rooms found, return an empty array
        if (!rooms || rooms.length === 0) {
            return res.status(200).json({
                success: true,
                rooms: []
            });
        }
        return res.status(200).json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("Error fetching user rooms:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}