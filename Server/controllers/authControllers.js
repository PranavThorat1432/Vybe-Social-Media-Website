import sendMail from "../config/mail.js";
import genToken from "../config/token.js";
import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    try {
        const { name, userName, email, password } = req.body;

        const findByEmail = await User.findOne({email});
        if(findByEmail) {
            return res.status(400).json({
                message: 'Email already exists!'
            });
        }

        const findByUserName = await User.findOne({userName});
        if(findByUserName) {
            return res.status(400).json({
                message: 'Username already exists!'
            });
        }

        if(password?.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters!'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, userName, email, password: hashPassword
        });

        const token = await genToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'Strict'  
        });

        return res.status(201).json(user);

    } catch (error) {
        return res.status(500).json({
            message: `Signup Error: ${error}`
        });
    }
};



export const signin = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const user = await User.findOne({userName});
        if(!user) {
            return res.status(400).json({
                message: 'User not found!'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({
                message: 'Invalid Credentials!'
            })
        }

        const token = await genToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'Strict'  
        });

        return res.status(201).json(user);

    } catch (error) {
        return res.status(500).json({
            message: `Signin Error: ${error}`
        });
    }
};



export const signout = async (req, res) => {
    try {
        res.clearCookie('token');

        return res.status(200).json({
            message: 'Signout Successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            message: `Signout Error: ${error}`
        });
    }
};


export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({
                message: 'User not found!'
            });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        user.resetOtp = otp; 
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;

        await user.save(); 
        await sendMail(email, otp);

        return res.status(200).json({
            message: 'OTP sent successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            message: `SendOTP Error: ${error}`
        });
    }
};


export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({email});

        if(!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
            return res.status(404).json({
                message: 'Invalid/Expired OTP!'
            });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: 'OTP Verified!'
        });

    } catch (error) {
        return res.status(500).json({
            message: `verifyOTP Error: ${error}`
        });
    }
};



export const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email});

        if(!user || !user.isOtpVerified) {
            return res.status(404).json({
                message: 'OTP verification required!'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        user.isOtpVerified = false;

        await user.save();

        return res.status(200).json({
            message: 'Password reset successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            message: `verifyOTP Error: ${error}`
        });
    }
}