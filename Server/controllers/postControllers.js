import uploadOnCloudinary from "../config/cloudinary.js";
import Notification from "../models/NotificationModel.js";
import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";
import { getSocketId, io } from "../socket.js";

export const uploadPost = async (req, res) => {
    try {
        const { caption, mediaType } = req.body;
        let media;
        if(req.file) {
            media = await uploadOnCloudinary(req.file.path);

        } else {
            return res.status(400).json({
                message: 'Media is required!'
            });
        }

        const post = await Post.create({
            caption,
            mediaType,
            media,
            author: req.userId
        });

        const user = await User.findById(req.userId);
        user.posts.push(post._id);
        await user.save();

        const populatedPost = await Post.findById(post._id).populate('author', 'name userName profileImage');

        return res.status(201).json(populatedPost);

    } catch (error) {
        return res.status(500).json({
            message: `UploadPost Error: ${error}`
        });
    }
};


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate('author', 'name userName profileImage').populate('comments.author', 'name userName profileImage').sort({createdAt: -1});

        return res.status(200).json(posts);

    } catch (error) {
        return res.status(500).json({
            message: `getAllPost Error: ${error}`
        });
    }
};


export const like = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post  = await Post.findById(postId);
        if(!post) {
            return res.status(404).json({
                message: 'Post not found!'
            });
        }

        const alreadyLike = post.likes.some(id => id.toString() == req.userId.toString());
        if(alreadyLike) {
            post.likes = post.likes.filter(id => id.toString() != req.userId.toString());

        } else {
            post.likes.push(req.userId);
            if(post.author._id != req.userId) {
                const notification = await Notification.create({
                    sender: req.userId,
                    receiver: post.author._id,
                    type: 'like',
                    post: post._id,
                    message: 'liked your post'
                });
                
                const populatedNotification = await Notification.findById(notification._id).populate('sender receiver post');

                const receiverSocketId = getSocketId(post.author._id);
                if(receiverSocketId) {
                    io.to(receiverSocketId).emit('newNotification', populatedNotification);
                }

            }
        }

        await post.save();
       
        
        // Populate both post author and comments' authors
        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name userName profileImage')
            .populate('comments.author', 'name userName profileImage');

        io.emit('likedPost', {
            postId: post._id,
            likes: post.likes
        });

        return res.status(200).json(populatedPost);

    } catch (error) {
        return res.status(500).json({
            message: `LikePost Error: ${error}`
        });
    }
};


export const comment = async (req, res) => {
    try {
        const { message } = req.body;
        const postId = req.params.postId;
        
        if (!message || !message.trim()) {
            return res.status(400).json({
                message: 'Comment message is required!'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found!'
            });
        }

        // Add the new comment
        const newComment = {
            author: req.userId,
            message: message.trim()
        };
        
        post.comments.push(newComment);

        if(post.author._id != req.userId) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: post.author._id,
                type: 'comment',
                post: post._id,
                message: 'commented on your post'
            });
            
            const populatedNotification = await Notification.findById(notification._id).populate('sender receiver post');

            const receiverSocketId = getSocketId(post.author._id);
            if(receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', populatedNotification);
            }

        }


        await post.save();

        // Populate the necessary fields
        const populatedPost = await Post.findById(post._id)
            .populate('author', 'name userName profileImage')
            .populate('comments.author', 'name userName profileImage').sort({createdAt: -1});
        
        io.emit('commentedPost', {
            postId: post._id,
            comments: post.comments
        });

        return res.status(200).json(populatedPost);

    } catch (error) {
        console.error('Error in comment controller:', error);
        return res.status(500).json({
            message: 'Error adding comment',
            error: error.message
        });
    }
};


export const saved = async (req, res) => {
    try {
        const postId = req.params.postId;
        const user  = await User.findById(req.userId);

        const alreadySaved = user.saved.some(id => id.toString() === postId.toString());
        if(alreadySaved) {
            user.saved = user.saved.filter(id => id.toString() !== postId.toString());

        } else {
            user.saved.push(postId);
        }

        await user.save();
        user.populate('saved');

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: `SavedPost Error: ${error}`
        });
    }
};