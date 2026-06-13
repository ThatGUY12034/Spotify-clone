import type { AuthenticatedRequest } from "./middleware.js";
import { User } from "./model.js"
import TryCatch from "./TryCatch.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const registerUser = TryCatch(async(req,res)=>{

    const {name,email,password} = req.body
    let user = await User.findOne({email})

    if(user){
        res.status(400).json({
            message:"User Already Exists",
        });
        return;
    }
    const hashPassword = await bcrypt.hash(password,10)
    user = await User.create({
        name,
        email,
        password:hashPassword
    });

      const token = jwt.sign({id:user._id},process.env.JWT_SEC as string,{
        expiresIn:"7d"
      });
      res.status(201).json({
        message:"User Registered Successfully",
        user,
        token
      });
    
});

export const loginUser = TryCatch(async(req,res)=>{
    const {email,password}=req.body


    const user = await User.findOne({email})

    if(!user){
      res.status(400).json({
        message:"User Not Found",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
      res.status(400).json({
        message:"Invalid Credentials",
      });
      return;
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SEC as string,{
      expiresIn:"7d"
    });   
    res.status(200).json({
      message:"User Logged In Successfully",
      user,
      token
    });

})

export const myProfile= TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    res.json(user);
    });

// GET /user/playlist — the current user's saved song ids
export const getPlaylist = TryCatch(async(req:AuthenticatedRequest,res)=>{
    res.json({ playlist: req.user?.playlist ?? [] });
});

// POST /user/playlist/:songId — add a song to the playlist (idempotent)
export const addToPlaylist = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const songId = req.params.songId as string;

    if(!songId){
        res.status(400).json({ message: "songId is required" });
        return;
    }

    const user = await User.findById(req.user?._id);
    if(!user){
        res.status(404).json({ message: "User Not Found" });
        return;
    }

    if(user.playlist.includes(songId)){
        res.json({ message: "Already in playlist", playlist: user.playlist });
        return;
    }

    user.playlist.push(songId);
    await user.save();

    res.status(201).json({ message: "Added to playlist", playlist: user.playlist });
});

// DELETE /user/playlist/:songId — remove a song from the playlist
export const removeFromPlaylist = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const songId = req.params.songId as string;

    if(!songId){
        res.status(400).json({ message: "songId is required" });
        return;
    }

    const user = await User.findById(req.user?._id);
    if(!user){
        res.status(404).json({ message: "User Not Found" });
        return;
    }

    if(!user.playlist.includes(songId)){
        res.status(404).json({ message: "Not in playlist", playlist: user.playlist });
        return;
    }

    user.playlist = user.playlist.filter((id) => id !== songId);
    await user.save();

    res.json({ message: "Removed from playlist", playlist: user.playlist });
});
