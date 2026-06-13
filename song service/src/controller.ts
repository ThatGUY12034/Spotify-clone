import { sql } from "./config/db.js";
import TryCatch from "./TryCatch.js";
import {redisClient} from "./index.js";

const CACHE_EXPIRY = 1800;

export const getAllAlbums = TryCatch(async (req, res) => {
    // Serve from cache when available.
    if (redisClient.isReady) {
        const cached = await redisClient.get("albums");
        if (cached) {
            console.log("Albums fetched from cache");
            res.json({ albums: JSON.parse(cached) });
            return;
        }
    }

    // Cache miss or Redis unavailable — fall back to the database.
    console.log("Fetching albums from database.");
    const albums = await sql`SELECT * FROM albums`;

    if (redisClient.isReady) {
        await redisClient.set("albums", JSON.stringify(albums), { EX: CACHE_EXPIRY });
    }

    res.json({ albums });
});

export const getAllSongs = TryCatch(async (req, res) => {
    // Serve from cache when available.
    if (redisClient.isReady) {
        const cached = await redisClient.get("songs");
        if (cached) {
            console.log("Songs fetched from cache");
            res.json({ songs: JSON.parse(cached) });
            return;
        }
    }

    // Cache miss or Redis unavailable — fall back to the database.
    console.log("Fetching songs from database.");
    const songs = await sql`SELECT * FROM songs`;

    if (redisClient.isReady) {
        await redisClient.set("songs", JSON.stringify(songs), { EX: CACHE_EXPIRY });
    }

    res.json({ songs });
});

export const getAllSongsOfAlbum =TryCatch(async(req,res)=>{
    const {id} = req.params;

    let album, songs;

    if(redisClient.isReady){
        const cacheData= await redisClient.get(`album_songs_${id}`)
        if(cacheData){
            console.log("Album songs fetched from cache");
            res.json(JSON.parse(cacheData));
            return;
        }
    }

    album = await sql`SELECT * FROM albums WHERE id = ${id}`;
    
    if(album.length === 0){
        return res.status(404).json({
            message:"Album not found"
        });
    }
    songs = await sql`SELECT * FROM songs WHERE album_id = ${id}`;
    const  response ={songs,album:album[0]}

    if(redisClient.isReady){
        await redisClient.set(`album_songs_${id}`,JSON.stringify(response),{
            EX:CACHE_EXPIRY,
        })
    }
    console.log("Album songs fetched from database");
    res.json(response);
});

export const getSingleSong =TryCatch(async(req,res)=>{
    const {id} = req.params;
    let song;
    song = await sql`SELECT * FROM songs WHERE id = ${id}`; 
    if(song.length === 0){
        return res.status(404).json({
            message:"Song not found"
        });
    }
    res.json({
        song:song[0]
    })
});