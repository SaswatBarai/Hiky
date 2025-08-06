import { WebSocketServer } from "ws"
import User from "../models/user.model.js"
import Room from "../models/room.model.js"
import Message from "../models/message.model.js"


const clients = new Map();
const rooms = new Map();
const typingUsers = new Map();
const onlineUsers = new Set();




const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({
        server
    })

    wss.on("connection", (ws) => {
        let msgUserId;

        ws.on("message", async (data) => {
            try {
                const message = JSON.parse(data.toString());
                const {type, userId, roomId, content, participants} = message;
                
                // Store userId for use in close event
                msgUserId = userId;
    
                switch (type){

                    case "test":{
                        ws.send(JSON.stringify({
                            type: "testResponse",
                            message: "WebSocket connection is working!"
                        }));
                    }
    
                    case "register":{
                        //user jesa hee online aya aur register hua
                        // uska userId aur socket id store karna hai
                        clients.set(userId, ws);
                        onlineUsers.add(userId);
                        ws.send(JSON.stringify({
                            type:"registered",
                            userId: userId,
    
                        }))
                        break;
                    }
    
    
                    case "joinRoom":{
                        //user kisi room me join hua 
                        // uska roomId aur socket id store karna hai
                        console.log("mark 1")
                        if(!rooms.has(roomId)){
                            rooms.set(roomId, new Set(participants)); // iska mtalab roomId me participant add ho gya
                        }
                        else{
                            rooms.get(roomId).add(userId);
                        }
    
                        ws.send(JSON.stringify({
                            type:"joinedRoom",
                            roomId: roomId,
                            participants: Array.from(rooms.get(roomId))
                        }))
                        break;
                    }
    
                    case "message":{
                        const room = await Room.findById(roomId);
                        // if(!room){
                        //     ws.send(JSON.stringify({
                        //         type: "error",
                        //         message: "Room not found"
                        //     }));
                        //     return;
                        // }
    
                        // if(!room.participants.includes(userId)){
                        //     ws.send(JSON.stringify({
                        //         type: "error",
                        //         message: "You are not a participant of this room"
                        //     }));
                        //     return;
                        // }
    
                        const newMessage = new Message({
                            roomId,
                            senderId: userId,
                            content
                        })
                        await newMessage.save();
    
                        const populatedMessage = await Message.findById(newMessage._id).populate("senderId","username");
    
                        const participants = rooms.get(roomId);
                        if(participants){
                            participants.forEach(participantId => {
                                const client = clients.get(participantId);
                                if(client && client.readyState === WebSocketServer.OPEN){
                                    client.send(JSON.stringify({
                                        type:"message",
                                        roomId,
                                        senderId: userId,
                                        content,
                                        timestamp: newMessage.createdAt,
                                        username: populatedMessage.senderId.username
                                    }))
                                }
                            })
                        }
    
                        break;
                    }
    
    
                    case "typing":{
                        if(content){
                            typingUsers.set(userId, roomId);
    
                        }
                        else{
                            typingUsers.delete(userId);
                        }
    
                        const roomTyping = rooms.get(roomId);
                        if(roomTyping){
                            roomTyping.forEach(participantId => {
                                const client = clients.get(participantId);
    
                                if(client && client.readyState === WebSocketServer.OPEN){
                                    client.send(JSON.stringify({
                                        type:"typing",
                                        userId: userId,
                                        roomId,
                                        isTyping: !!content // !!content converts content to boolean
                                    }))
                                }
                            })
                        }
    
                        break;
                    }
    
                }
            } catch (error) {
                console.error("WebSocket error:", error);
                ws.send(JSON.stringify({
                    type: "error",
                    message: "An error occurred while processing your request"
                }))
            }
        });

        ws.on("close", () => {
            // User disconnected
            if(msgUserId){
                clients.delete(msgUserId);
                onlineUsers.delete(msgUserId);
                    typingUsers.delete(msgUserId);
                rooms.forEach((participants, roomId) => {
                    if(participants.has(msgUserId)){
                        participants.delete(msgUserId);

                        if(participants.size === 0){
                            rooms.delete(roomId)
                        }
                    }
                })
            }
        })
    })
}




async function broadcastOnlineStatus(userId, wss){
    try {
        const user = await User.findById(userId).populate('friends');
        if(!user) return;

        const onlineFriends = user.friends.filter(friend => onlineUsers.has(friend._id.toString()));
        const offlineFriends = user.friends.filter(friend => !onlineUsers.has(friend._id.toString()));
        const onlineStatus = {
            type: "onlineStatus",
            userId: user._id.toString(),
            onlineFriends: onlineFriends.map(friend => ({
                id: friend._id.toString(),
                username: friend.username
            })),
            offlineFriends: offlineFriends.map(friend => ({
                id: friend._id.toString(),
                username: friend.username
            }))
        };
        
        wss.clients.forEach(client => {
            if (client.readyState === WebSocketServer.OPEN) {
                client.send(JSON.stringify(onlineStatus));
            }
        });
    } catch (error) {
        console.error("Error broadcasting online status:", error);
    }
}

export { initializeWebSocket, broadcastOnlineStatus };