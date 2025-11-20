import express from "express";
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';
import { comment, getAllLoops, like, uploadLoop } from "../controllers/loopControllers.js";


const loopRouter = express.Router();

loopRouter.post('/upload-loop', isAuth, upload.single('media'), uploadLoop);
loopRouter.get('/like/:loopId', isAuth, like);
loopRouter.post('/comment/:loopId', isAuth, comment);
loopRouter.get('/getAll-loops', isAuth, getAllLoops);


export default loopRouter;