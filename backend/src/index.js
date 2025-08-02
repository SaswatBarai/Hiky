import dotenv from 'dotenv';
dotenv.config();

import app from "./app.js";
import {connectDB} from "./config/connectDB.js"



app.listen(process.env.PORT || 8000 , async () => {
    await connectDB();
    
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
})