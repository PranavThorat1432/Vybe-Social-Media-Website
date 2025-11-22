import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/UserModel.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId)
        .populate('posts loops posts.author posts.comments')
        .populate({
            path: 'story',
            populate: [
                { path: 'author', select: 'name userName profileImage' },
                { path: 'viewers', select: 'name userName profileImage' }
            ]
        });
        if(!user) {
            return res.status(404).json({
                message: 'User not found!'
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: `Get-Current-User Error: ${error}`
        });
    }
};


export const suggestedUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: {$ne: req.userId}
        }).select('-password');

        return res.status(200).json(users);

    } catch (error) {
        return res.status(500).json({
            message: `Get-Suggested-User Error: ${error}`
        });
    }
};


export const editProfile = async (req, res) => {
    try {
        const { name, userName, bio, profession, gender } = req.body;
        const user = await User.findById(req.userId).select('-password');
        if(!user) {
            return res.status(404).json({
                message: 'User not found!'
            });
        }

        // Check if username is taken by another user
        const sameUserWithUsername = await User.findOne({userName}).select('-password');
        if(sameUserWithUsername && sameUserWithUsername._id.toString() !== req.userId.toString()) {
            return res.status(400).json({
                message: 'Username already exists!'
            });
        }

        // Handle profile image upload
        if(req.file) {
            try {
                const result = await uploadOnCloudinary(req.file.path);
                
                // Handle both string URL and object response from Cloudinary
                if (typeof result === 'string') {
                    user.profileImage = result;  // Direct URL string
                    console.log('Profile image updated to (string URL):', user.profileImage);
                } else if (result && result.url) {
                    user.profileImage = result.url;  // URL from response object
                    console.log('Profile image updated to (object URL):', user.profileImage);
                } else {
                    console.log('No valid URL in Cloudinary response');
                }
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
            }
        }

        user.name = name;
        user.userName = userName;
        user.profession = profession;
        user.bio = bio;
        user.gender = gender;

        await user.save();

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: `EditProfile Error: ${error}`
        });
    }
};


export const getProfile = async (req, res) => {
    try {
        const userName = req.params.userName;
        const user = await User.findOne({userName}).select('-password').populate('posts loops followers following');
        if(!user) {
            return res.status(404).json({
                message: 'User not found!'
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: `GetProfile Error: ${error}`
        });
    }
};


export const follow = async (req, res) => {
    try {
        const currentUserId = req.userId;
        const targetUserId = req.params.targetUserId;

        if(!targetUserId) {
            return res.status(404).json({
                message: 'Target User not Found!'
            });
        }

        if(currentUserId === targetUserId) {
            return res.status(404).json({
                message: 'You can not follow yourself!'
            });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);
        
        const isFollowing = currentUser.following.includes(targetUserId);

        if(isFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());

            await currentUser.save();
            await targetUser.save();
    
            return res.status(200).json({
                following: false,
                message: 'Unfollow Successfully!'
            });

        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);

            await currentUser.save();
            await targetUser.save();

             return res.status(200).json({
                following: true,
                message: 'Followed Successfully!'
            });
        }


    } catch (error) {
        return res.status(500).json({
            message: `Follow Error: ${error}`
        });
    }
};