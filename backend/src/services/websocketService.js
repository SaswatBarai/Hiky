import { WebSocketServer } from "ws";
import User from "../models/user.model.js";
import Room from "../models/room.model.js";
import Message from "../models/message.model.js";

//!Store Client connection and user data

const clients = new Map(); // userId --> websocket connection
const userRooms = new Map(); //userId --> set of roomIds
const roomParticipant = new Map(); //roomId --> set of userIds
const typingUsers = new Map(); // userId --> roomId
const onlineUsers = new Map(); //set of online userIds

const initializeWebSocke = (server) => {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", (ws) => {
    let currentUserId = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        const { type, userId, roomId, content, participants } = message;

        currentUserId = userId;

        switch (type) {
          case "test": {
            ws.send(
              JSON.stringify({
                type: "testResponse",
                message: "Websocket connection is working!",
                timestamp: new Date().toISOString(),
              })
            );
            break;
          }

          case "register": {
            clients.set(userId, ws);
            onlineUsers.add(userId);

            const userRoomData = await Room.find({ participants: userId });
            const roomIds = userRoomData.map((room) => room._id.toString());
            userRooms.set(userId, new Set(roomIds));

            roomIds.forEach((roomId) => {
              if (!roomParticipant.has(roomId)) {
                roomParticipant.get(roomId, new Set());
              }
              roomParticipant.get(roomId).add(userId);
            });

            ws.send(
              JSON.stringify({
                type: "registered",
                userId: userId,
                message: "Successfully registered for Websocket communication",
              })
            );

            await broadcastOnlineStatus(userId, wss);
            break;
          }
          case "joinRoom": {
            if (!roomParticipant.has(roomId)) {
              roomParticipant.set(roomId, new Set());
            }
            roomParticipant.get(roomId).add(roomId);

            if (!userRooms.has(userId)) {
              userRooms.set(userId, new Set());
            }
            userRooms.get(userId).add(roomId);

            ws.send(
              JSON.stringify({
                type: "joinedRoom",
                roomId: roomId,
                participants: Array.from(roomParticipant.get(roomId)),
              })
            );
            break;
          }

          case "leaveRoom": {
            if (roomParticipant.has(roomId)) {
              roomParticipant.get(roomId).delete(userId);
              if (roomParticipant.get(roomId).size === 0) {
                roomParticipant.delete(roomId);
              }
            }

            if (userRooms.has(userId)) {
              userRooms.get(userId).delete(roomId);
              if (userRooms.get(userId).size === 0) {
                userRooms.delete(userId);
              }
            }

            ws.send(
              JSON.stringify({
                type: "leftRoom",
                roomId: roomId,
              })
            );

            break;
          }

          case "message": {
            const room = await Room.findById(roomId);
            if (!room) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Room not found",
                })
              );

              return;
            }

            if (!room.participants.includes(userId)) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "You are not participant of this room",
                })
              );
              return;
            }

            const newMessage = new Message({
              roomId,
              senderId: userId,
              content,
            });

            await newMessage.save();

            await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

            const populatedMessage = await Message.findById(
              newMessage._id
            ).populate("senderId", "username name email profileImage");

            const messageData = {
              type: "message",
              roomId,
              messageId: newMessage._id,
              senderId: userId,
              timestamp: newMessage.createdAt,
              sender: {
                username: populatedMessage.senderId.username,
                name: populatedMessage.senderId.name,
                profileImage: populatedMessage.senderId.profileImage,
              },
            };

            broadcastToRoom(roomId,messageData);
            break;
          }

          case "typing" :{
            const istyping = !!content;

            if(istyping){
                typingUsers.set(userId,roomId);
            }
            else{
                typingUsers.delete(userId)
            }

            broadcastToRoom(roomId,
                {
                    type:"typing",
                    userId:userId,
                    roomId:roomId,
                    isTyping :isTyping 
                },
                userId
            )
          }









        }
      } catch (error) {}
    });
  });
};
