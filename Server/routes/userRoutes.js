import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { editProfile, follow, followingList, getAllNotifications, getCurrentUser, getProfile, markAsRead, search, suggestedUsers } from '../controllers/userControllers.js';
import { upload } from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.get('/current-user',isAuth, getCurrentUser);
userRouter.get('/suggested-user',isAuth, suggestedUsers);
userRouter.post('/edit-profile',isAuth, upload.single('profileImage'), editProfile);
userRouter.get('/get-profile/:userName',isAuth, getProfile);
userRouter.get('/follow/:targetUserId',isAuth, follow);
userRouter.get('/followingList',isAuth, followingList);
userRouter.get('/search',isAuth, search);
userRouter.get('/getAllNotifications',isAuth, getAllNotifications);
userRouter.post('/markAsRead',isAuth, markAsRead);


export default userRouter;