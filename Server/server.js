import express from 'express';
import 'dotenv/config';
import connectDB from './config/mongoDB.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import loopRouter from './routes/loopRoutes.js';
import storyRouter from './routes/storyRoutes.js';
import msgRouter from './routes/msgRoutes.js';
import { app, server } from './socket.js';


const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


//Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/loop', loopRouter);
app.use('/api/story', storyRouter); 
app.use('/api/msg', msgRouter); 
 
app.get('/', (req, res) => {
    res.send('Server is running...')
});


connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on PORT: http://localhost:${PORT}`)
}); 
 