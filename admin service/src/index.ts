import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js';
import adminRoutes from './route.js';
import cloudinary from 'cloudinary';
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
})

// Validate environment variables
const cloudName = process.env.Cloud_Name;
const apiKey = process.env.Cloud_API_Key;
const apiSecret = process.env.Cloud_API_Secret;

if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Missing Cloudinary environment variables. Please check:');
    console.error('   Cloud_Name:', cloudName ? '✅' : '❌');
    console.error('   Cloud_API_Key:', apiKey ? '✅' : '❌');
    console.error('   Cloud_API_Secret:', apiSecret ? '✅' : '❌');
    process.exit(1);
}

// Now TypeScript knows these are strings
cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

async function initDB() {
    try {
        // Create albums table
        await sql`
            CREATE TABLE IF NOT EXISTS albums (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                thumbnail VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Create songs table
        await sql`
            CREATE TABLE IF NOT EXISTS songs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                thumbnail VARCHAR(255),
                audio VARCHAR(255) NOT NULL,
                album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log("Database Initialized Successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
        process.exit(1); // Exit if database initialization fails
    }
}



const app = express();
// Middleware
app.use(cors());

app.use(express.json());
app.use('/api/v1', adminRoutes);
const PORT = process.env.PORT || 7000;




// Basic route
app.get('/', (req, res) => {
    res.json({ message: "Server is running" });
});

// Initialize database and start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
});