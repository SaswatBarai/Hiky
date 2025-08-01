import app from "./app.js";
import { connectDB } from "./config/connectDB.js";
import { connectRedis } from "./config/connectRedis.js";





app.listen( process.env.PORT, async() => {
    await connectRedis();
    await connectDB();
    console.log(`Server is running on port ${process.env.PORT}`);
})