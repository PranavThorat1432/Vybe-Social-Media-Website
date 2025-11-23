import express from "express";
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';
import { getAllMsgs, getPrevUserChats, sendMsg } from "../controllers/MsgController.js";



const msgRouter = express.Router();

msgRouter.post('/send-msg/:receiverId', isAuth, upload.single('image'), sendMsg);
msgRouter.get('/getAll-msgs/:receiverId', isAuth, getAllMsgs);
msgRouter.get('/getPrevChats', isAuth, getPrevUserChats);


export default msgRouter;