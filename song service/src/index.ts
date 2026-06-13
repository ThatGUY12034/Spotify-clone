import express from 'express';
import dotenv from 'dotenv';
import songRoute from './route.js';
import redis from 'redis';
import cors from 'cors';

dotenv.config();


export const redisClient = redis.createClient({
    ...(process.env.Redis_Password && { password: process.env.Redis_Password }),
    socket: {
        host: "redis-12234.c305.ap-south-1-1.ec2.cloud.redislabs.com",
        port: 12234,
    },
});

redisClient.connect().then(()=>{
    console.log("Connected to Redis");
}).catch((error) => {
    console.error("Failed to connect to Redis:", error);
});

const app = express();
app.use(cors()); // ⬅️ Enable CORS for all routes

app.use(express.json()); // ⬅️ Must be BEFORE routes
app.use("/api/v1", songRoute);

const port = process.env.PORT || 3000; // ⬅️ Fallback port

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Try: http://localhost:${port}/`);
});