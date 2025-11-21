import express from "express";
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';
import { getAllStories, getStoryByUsername, uploadStory, viewStory } from "../controllers/storyControllers.js";

const storyRouter = express.Router();

storyRouter.post('/upload-story', isAuth, upload.single('media'), uploadStory);
storyRouter.get('/getStory/:userName', isAuth, getStoryByUsername);
storyRouter.get('/view/:storyId', isAuth, viewStory);
storyRouter.get('/getAllStories', isAuth, getAllStories);

export default storyRouter;