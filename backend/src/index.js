import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import {initializeWebSocket} from "../src/services/websocketService.js"
import app from "./app.js";
import {connectDB} from "./config/connectDB.js"

const server = http.createServer(app);
initializeWebSocket(server);

// Start the server
server.listen(process.env.PORT || 8000, async () => {
    await connectDB();
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
    console.log(`WebSocket server is running on ws://localhost:${process.env.PORT || 8000}`);
    console.log(`API is available at http://localhost:${process.env.PORT || 8000}/api/v1`);
})


// app.listen(process.env.PORT || 8000 , async () => {
//     await connectDB();
    
//     console.log(`Server is running on port ${process.env.PORT || 8000}`);
// })