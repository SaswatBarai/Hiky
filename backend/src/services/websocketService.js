import {WebSocket} from "ws"
import User from "../models/user.model.js"
import Room from "../models/room.model.js"
import Message from "../models/message.model.js"


const client = new Map();
const rooms = new Map();
const typingUsers = new Map();
const onlineUsers = new Set();




const initializeWebSocke = (socket) => {
    const wss = new WebSocket.Server({
        server
    })

    wss.on("connection", (ws) => {
        ws.on("message", async (message) => {
            const message = JSON.parse(message);

            const {type, userId:msgUserId, roomId, content, participant} = message

            switch (type){

                case "register":{
                    //user jesa hee online aya aur register hua
                    // uska userId aur socket id store karna hai
                    client.set(msgUserId, ws);
                    onlineUsers.add(msgUserId);
                    ws.send(JSON.stringify({
                        type:"registered",
                        userId: msgUserId,

                    }))
                    break;
                }


                case "joinRoom":{
                    //user kisi room me join hua 
                    // uska roomId aur socket id store karna hai
                    if(!rooms.has(roomId)){
                        roomId.set(roomId,new Set(participant));
                    }
                    else{
                        roomId.get(roomId).add(msgUserId);
                    }

                    ws.send(JSON)
                }
            }
        })
    })
}