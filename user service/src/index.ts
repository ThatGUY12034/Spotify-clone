import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRoutes from './route.js'
import cors from 'cors';


dotenv.config()

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "Spotify",
            serverSelectionTimeoutMS: 5000,
        })
        console.log("MongoDB Connected")
    } catch (error) {
        // Log but do NOT crash the process — the server stays up so health checks
        // and clear error responses keep working even if Mongo is unreachable.
        console.error("MongoDB connection failed:", error instanceof Error ? error.message : error)
    }
}

// Surface (but survive) async errors from the driver after the initial connect.
mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message)
})


const app = express();

app.use(cors()); // ⬅️ Enable CORS for all routes
app.use(express.json())

app.use("/api/v1", userRoutes)

app.get("/", (req, res) => {
    res.send("server is working")
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    connectDb()
});
