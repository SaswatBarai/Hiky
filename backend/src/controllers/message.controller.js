import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

export const createRoom = async (req, res) => {
  const { roomType, participants, name } = req.body;
  const user = req.user;

  try {
    if (!roomType || !participants || !name) {
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
      const exisitingRoom = Room.findOne({
        roomType: "private",
        participants: {
          $all: participants,
          $size: 2,
        },
      });

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



