import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { editProfile, follow, getCurrentUser, getProfile, suggestedUsers } from '../controllers/userControllers.js';
import { upload } from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.get('/current-user',isAuth, getCurrentUser);
userRouter.get('/suggested-user',isAuth, suggestedUsers);
userRouter.post('/edit-profile',isAuth, upload.single('profileImage'), editProfile);
userRouter.get('/get-profile/:userName',isAuth, getProfile);
userRouter.get('/follow/:targetUserId',isAuth, follow);


export default userRouter;