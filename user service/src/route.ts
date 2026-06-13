import express from 'express'
import {
  addToPlaylist,
  getPlaylist,
  loginUser,
  myProfile,
  registerUser,
  removeFromPlaylist,
} from './controller.js';
import { isAuth } from './middleware.js';

const router = express.Router();

router.post("/user/register",registerUser)
router.post("/user/login",loginUser)
router.get("/user/me",isAuth,myProfile)

router.get("/user/playlist",isAuth,getPlaylist)
router.post("/user/playlist/:songId",isAuth,addToPlaylist)
router.delete("/user/playlist/:songId",isAuth,removeFromPlaylist)

export default router;