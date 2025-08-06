import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

export const createRoom = async (req, res) => {
  const { roomType, participants, name } = req.body;
  const user = req.user;

  try {
    if (!roomType || !participants ) {
      return res.status(400).json({
        success: false,
        message: "Invalid room data",
      });
    }

    if (roomType === "private" && participants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Private room must have extactly 2 participants",
      });
    }

    if (roomType === "group" && !name) {
      return res.status(400).json({
        success: false,
        message: "Group room must have a name",
      });
    }

    // Ensure the requesting user is part of the participants

    if (!participants.includes(user._id.toString())) {
      participants.push(user._id.toString());
    }

    const users = await User.find({ _id: { $in: participants } });

    if (users.length !== participants.length) {
      return res.status(404).json({
        success: false,
        message: "Inavlid user IDs",
      });
    }

    let room;

    if (roomType === "private") {
      const exisitingRoom = await Room.findOne({
        roomType: "private",
        participants: {
          $all: participants,
          $size: 2,
        },
      });
      console.log(exisitingRoom)
      if (exisitingRoom) {
        return res.status(400).json({
          success: true,
          roomId: exisitingRoom._id,
          message: "Private room already exists",
        });
      }

      room = await Room.create({
        roomType,
        participants,
      });

      const otherUserId = participants.find(
        (id) => id.toString() !== user._id.toString()
      );

      await User.findByIdAndUpdate(user._id, {
        $addToSet: { friend: otherUserId },
      });

      await User.findByIdAndUpdate(otherUserId, {
        $addToSet: { friend: user._id },
      });
    }

    if (roomType === "group") {
      room = await Room.create({
        roomType,
        participants,
        name,
        createdBy: user._id,
      });
    }


    if(room) {
        return res.status(201).json({
            success:true,
            roomId:room._id,
            room:room,
            message:"Room created successfully"
        })
    }
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"Internal server error"
    })
  }
};



export const sendMessage = async (req,res) => {
    const {roomId, content} = req.body;
    const user = req.user;

    try {
        if(!roomId || !content){
            return res.status(400).json({
                success:false,
                message:"Missing required fields"
            })
        }

        const room = await Room.findById(roomId);

        if(!room){
            return res.status(404).json({
                success:false,
                message:"Room not found"
            })
        }

        if(!room.participants.includes(user._id)){
            return res.status(403).json({
                success:false,
                message:"You are not a participant of this room"
            })
        }

        const message = await Message.create({
            roomId,
            senderId:user._id,
            content
        })


        await Room.findByIdAndUpdate(roomId,{
            updatedAt:new Date()
        })

        const populateMessage = await Message.findById(message._id).populate("senderId","name username email profileImage");


        return res.status(201).json({
            success:true,
            message:"Message sent successfully",
            date:populateMessage
        })
    } catch (error) {

        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
        
    }
}



export const getMessages = async (req, res) => {
    const {roomId} = req.params;
    const {limit = 20, offset = 0} = req.query;
    const userId = req.user._id;

    try {
        const room = await Room.findById(roomId).populate("participants", "name email username")


        if(!room){
            return res.status(404).json({
                success:false,
                message:"Room not found"
            })
        }

        const isParticipant = room.participants.some(x => x._id.toString() === userId.toString());

        if(!isParticipant){
            return res.status(403).json({
                success:false,
                message:"You are not a participant of this room"
            })
        }

        const messages = await Message.find({roomId}).sort({createdAt: -1}).skip(parseInt(offset)).limit(parseInt(limit)).populate("sender","name username email profileImage");

        return res.status(200).json({
            success:true,
            messages:messages.reverse(),
            room:room
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}




export const getUserRooms = async(req, res) => {
    const userId = req.user._id;

    try {
        const room = await Room.find({participants:userId}).populate("participants","name email username profileImage").populate("createdBy","name username").sort({updatedAt:-1});

        //Get last message for each room
        const roomWithLastMessage = await Promise.all(
            room.map(async (room) => {
                const lastMessage = await Message.findOne({roomId: room._id}).sort({createdAt : -1}).populate("senderId", "name username");

                return {
                    ...room.toObject(),
                    lastMessage:lastMessage || null
                }
            })
        )


        return res.status(200).json({
            success:true,
            rooms:roomWithLastMessage
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}



export const searchUsers = async (req, res) => {
    const {query} = req.query;
    const userId = req.user._id;

    try {
        if(!query){
            return res.status(400).json({
                success:false,
                message:"Search query is required"
            })
        }


        const users = await User.find({
            $and:[
                {_id : {$ne: userId}},
                {
                    $or:[
                        {username :{$regex : query, $options: "i"}},
                        {name :{$regex : query, $options: "i"}},
                        {email :{$regex : query, $options: "i"}}
                    ]
                }
            ]
        }).select("name username email profileImage").limit(10);


    return res.status(200).json({
        success:true,
        users
    })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}


export const deleteRoom = async (req, res) => {
    const {roomId} = req.params;
    const userId = req.user._id;

    try {
        const room = await Room.findById(roomId);
        if(!room){
            return res.status(404).json({
                success:false,
                messsage:"Room not found"
            })
        }

        if(room.roomType === "group" && room.createdBy.toString() !== userId.toString()){
            return res.status(403).json({
                success:false,
                message:"Only room creator can delete the group"
            })
        }

        if(room.roomType === "private" && !room.participants.includes(userId)){
            return res.status(403).json({
                success:false,
                message:"You are not authorized to delete this room"
            })
        }

        await Message.deleteMany({roomId});
        await Room.findByIdAndDelete(roomId);

        return res.status(200).json({
            success:true,
            message:"Room deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}