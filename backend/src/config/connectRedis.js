import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
})


export const connectRedis = async () => {
    try {
       const res = await redisClient.connect();
        console.log("✅ Connected to Redis", res.isOpen);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}