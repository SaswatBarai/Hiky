import mongoose from "mongoose";


export const connectDB = async () => {
    try {
        const res = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to MongoDB ${res.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}