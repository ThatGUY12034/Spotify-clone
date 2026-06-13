import type { Request } from "express";
import TryCatch from "./TryCatch.js";
import getBuffer from "./config/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "./config/db.js";
import { redisClient } from "./index.js";

interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        role: string;
    } | null;
}

export const addAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Check admin role
    if (req.user?.role !== "admin") {
        return res.status(403).json({ // 403 is more appropriate than 401
            message: "You are not authorized to perform this action"
        });
    }

    const { title, description } = req.body;
    
    // Validate required fields
    if (!title || !description) {
        return res.status(400).json({
            message: "Title and description are required"
        });
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "No file provided"
        });
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        return res.status(500).json({
            message: "Failed to generate file buffer"
        });
    }

    // Upload to Cloudinary
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "albums",
    });

    // Insert into database
    const result = await sql`
        INSERT INTO albums (title, description, thumbnail)
        VALUES (${title}, ${description}, ${cloud.secure_url})
        RETURNING *`;



    if(redisClient.isReady){
        await redisClient.del("albums");
        console.log("Albums cache cleared");
    }
    res.status(201).json({
        message: "Album created successfully",
        album: result[0],
    });
});

export const addSong = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Check admin role
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            message: "You are not authorized to perform this action"
        });
    }

    const { title, description, album_id } = req.body;

    // Validate required fields
    if (!title || !description) {
        return res.status(400).json({
            message: "Title and description are required"
        });
    }

    // Check if album exists (if album_id is provided)
    if (album_id) {
        const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album_id}`;
        if (isAlbum.length === 0) {
            return res.status(404).json({
                message: "Album not found"
            });
        }
    }

    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "No audio file provided"
        });
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
        return res.status(500).json({
            message: "Failed to generate file buffer"
        });
    }

    // Upload to Cloudinary (audio files need resource_type: "video")
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "songs",
        resource_type: "video" // Required for audio files
    });

    // Insert into database
    const result = await sql`
        INSERT INTO songs (title, description, audio, album_id, thumbnail)
        VALUES (${title}, ${description}, ${cloud.secure_url}, ${album_id}, ${null})
        RETURNING *`;
    
    if(redisClient.isReady){
        await redisClient.del("songs");
        console.log("Songs cache cleared");
    }

    res.status(201).json({
        message: "Song added successfully",
        song: result[0]
    });
});

export const addThumbnail = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Check admin role
    if (req.user?.role !== "admin") {  
        return res.status(403).json({
            message: "You are not authorized to perform this action"
        });
    }
    const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
    if (song.length === 0) {
        return res.status(404).json({
            message: "Song not found"
        });
    }
    const fileBuffer = getBuffer(req.file);
    if (!fileBuffer || !fileBuffer.content) {
        return res.status(500).json({
            message: "Failed to generate file buffer"
        });
    }
    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content)

    const result = await sql`
        UPDATE songs
        SET thumbnail = ${cloud.secure_url}
        WHERE id = ${req.params.id}
        RETURNING *`;   
    if(redisClient.isReady){
        await redisClient.del("songs");
        console.log("Songs cache cleared");
    }
    res.status(200).json({
        message: "Thumbnail added successfully",
        song: result[0]

    });
});

export const deleteAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Check admin role
    if (req.user?.role !== "admin") {   
        return res.status(403).json({
            message: "You are not authorized to perform this action"
        });
    }
    const {id} = req.params;
     
    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${id}`;
        if (isAlbum.length === 0) {
            return res.status(404).json({
                message: "Album not found"
            });
        }
    
    await sql`DELETE FROM songs WHERE album_id = ${id}`;
    
    await sql`DELETE FROM albums WHERE id = ${id}`;
    if(redisClient.isReady){
        await redisClient.del("albums");
        console.log("Albums cache cleared");
    }
    if(redisClient.isReady){
        await redisClient.del("songs");
        console.log("Songs cache cleared");
    }
    res.status(200).json({
        message: "Album deleted successfully"
    });
});

export const deleteSong = TryCatch(async (req: AuthenticatedRequest, res) => {
    // Check admin role
    if (req.user?.role !== "admin") {   
        return res.status(403).json({
            message: "You are not authorized to perform this action"
        });
    }
    
    const { id } = req.params; // This was inside the if block incorrectly

    // Check if song exists
    const song = await sql`SELECT * FROM songs WHERE id = ${id}`;
    if (song.length === 0) {
        return res.status(404).json({
            message: "Song not found"
        });
    }

    // Delete the song
    await sql`DELETE FROM songs WHERE id = ${id}`;
    if(redisClient.isReady){
        await redisClient.del("songs");
        console.log("Songs cache cleared");
    }
    res.status(200).json({
        message: "Song deleted successfully"    
    }); 
});