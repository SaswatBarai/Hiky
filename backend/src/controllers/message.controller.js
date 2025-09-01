import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

export const createRoom = async (req, res) => {
  const { roomType, participants, name } = req.body;
  const user = req.user;

  try {
    if (!roomType || !participants) {
      return res.status(400).json({
        success: false,
        message: "Invalid room data",
      });
    }

    if (roomType === "private" && participants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Private room must have exactly 2 participants",
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
        message: "Invalid user IDs",
      });
    }

    let room;

    if (roomType === "private") {
      const existingRoom = await Room.findOne({
        roomType: "private",
        participants: {
          $all: participants,
          $size: 2,
        },
      });

      if (existingRoom) {
        return res.status(200).json({
          success: true,
          roomId: existingRoom._id,
          room: existingRoom,
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

    if (room) {
      return res.status(201).json({
        success: true,
        roomId: room._id,
        room: room,
        message: "Room created successfully",
      });
    }
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createPrivateRoom = async (req, res) => {
  const { mainInput, roomType } = req.body;
  const userId = req.user._id;
  try {
    if (!mainInput || !roomType) {
      return res.status(400).json({
        success: false,
        message: "Invalid room data",
      });
    }
    if (roomType.toLowerCase() !== "private") {
      return res.status(400).json({
        success: false,
        message: "Invalid room type",
      });
    }
    const otherUser = await User.findOne({
      $or: [{ username: mainInput }, { email: mainInput }],
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (otherUser._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a private room with yourself",
      });
    }
    const participants = [userId.toString(), otherUser._id.toString()];
    const existingRoom = await Room.findOne({
      roomType: "private",
      participants: {
        $all: participants,
        $size: 2,
      },
    });
    if (existingRoom) {
      return res.status(200).json({
        success: true,
        roomId: existingRoom._id,
        room: existingRoom,
        message: "Private room already exists",
      });
    }
    const room = await Room.create({
      roomType,
      participants,
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friend: otherUser._id },
    });
    await User.findByIdAndUpdate(otherUser._id, {
      $addToSet: { friend: userId },
    });

    //wait for 60second
    // const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // await wait(10000);
    return res.status(201).json({
      success: true,
      roomId: room._id,
      room: room,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Create private room error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const sendMessage = async (req, res) => {
  const { roomId, content } = req.body;
  const user = req.user;

  try {
    if (!roomId || !content) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!room.participants.includes(user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this room",
      });
    }

    const message = await Message.create({
      roomId,
      senderId: user._id,
      content,
    });

    await Room.findByIdAndUpdate(roomId, {
      updatedAt: new Date(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "name username email profileImage"
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessages = async (req, res) => {
  const { roomId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const userId = req.user._id;

  try {
    const room = await Room.findById(roomId).populate(
      "participants",
      "name email username"
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const isParticipant = room.participants.some(
      (x) => x._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this room",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ roomId });
    const totalPages = Math.ceil(totalMessages / limitNum);

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("senderId", "name username email profileImage")
      .lean();

    // Reverse to show oldest first in the current page
    const reversedMessages = messages.reverse();

    return res.status(200).json({
      success: true,
      messages: reversedMessages,
      room: room,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMessages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserRooms = async (req, res) => {
  const userId = req.user._id;

  try {
    const rooms = await Room.find({ participants: userId })
      .populate("participants", "name email username profileImage")
      .populate("createdBy", "name username")
      .sort({ updatedAt: -1 })
      .lean();

    // Get last message for each room and unread count
    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomId: room._id })
          .sort({ createdAt: -1 })
          .populate("senderId", "name username")
          .lean();

        // Calculate unread messages (messages after user's last seen)
        // For now, we'll use a simple approach - you can enhance this with a lastSeen field
        let unreadCount = 0; // Implement based on your lastSeen logic

        unreadCount = await Message.countDocuments({
          roomId: room._id,
          senderId: { $ne: userId },
          "readBy.userId": { $ne: userId },
        });

        return {
          ...room,
          lastMessage: lastMessage || null,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      rooms: roomsWithLastMessage,
    });
  } catch (error) {
    console.error("Get user rooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const userId = req.user._id;

  try {
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } },
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("name username email profileImage")
      .limit(10);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteRoom = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (
      room.roomType === "group" &&
      room.createdBy.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only room creator can delete the group",
      });
    }

    if (room.roomType === "private" && !room.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this room",
      });
    }

    await Message.deleteMany({ roomId });
    await Room.findByIdAndDelete(roomId);

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// New endpoint to mark messages as read
export const markMessagesAsRead = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!room.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant of this room",
      });
    }

    // Update user's last seen timestamp for this room
    // You can implement this based on your schema design

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
