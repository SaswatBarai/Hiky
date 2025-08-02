import User from "../models/user.model.js"
import {redisClient} from "../config/connectRedis.js";
import sendMail from "../services/sendMail.js"


export const register = async (req,res) => {
    try{
        const {username,email,password} = req.body;

        if([!username, !email, !password].includes(undefined)){
            return res.status(400).json(
                {
                    success: false,
                    message: "Please provide all required fields"
                }
            );
        }
        
        const existingUsername = await User.findOne({
            username: username
        })
        if(existingUsername){
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }

        const existingEmail = await User.findOne({
            email: email
        })
        if(existingEmail){
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        const user = await User.create({
            username,
            email,
            password
        })

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save();
        
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        
        
        
        //Genrate otp 
        const otp = Math.floor(100000 + Math.random() * 900000); 
        
        
        //cache the otp in redis'

        await redisClient.set(`otp:${email}`, otp, 'EX', 300);
        
        

        
        //To cool down otp request for 60s means next otp will called after 60s
        
        await redisClient.set(`otp_limit:${email}`, 'sent', 'EX', 60);
        
        
        //sending mail
        const result = await sendMail(email, "Verify Your Email", otp);
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email"
            });
        }
        
        return res.status(201).cookie("refreshToken", refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 
            
        }).json({
            success: true,
            message: "User registered successfully",
            user: loggedInUser,
            accessToken
        })

    }
    catch(error){
        console.error("Error in register:", error);
        return res.status(500).json({
            success: false,
            message: error.message 
        });
    }
}


export const verifyEmail = async (req,res) => {
    try {
        const {email ,otp} = req.body;
        if([email, otp].includes(undefined)){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            })
        }

        //Check if otp is valid

        const cachedOTP = await redisClient.get(`otp:${email}`);
        if(!cachedOTP){
            return res.status(400).json({
                success: false,
                message: "OTP is invalid or expired"
            });
        }

        if(cachedOTP !== otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        
        // OTP is valid, update user's email verification status
        const user = await User.findOneAndUpdate(
            { email: email },
            { isEmailVerified: true },
            { new: true }
        ).select("-password -refreshToken");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete the OTP from Redis since it's been used
        await redisClient.del(`otp:${email}`);
        await redisClient.del(`otp_limit:${email}`); // Clear the cooldown for OTP requests


        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: user
        });

    } catch (error) {
        console.error("Error in verifyEmail:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


export const resentOTP = async (req,res) => {
    try {
        const {email} = req.body;
        if(!email){
            return res.status(400).json({   
                success: false,
                message: "Please provide an email address"
            });
        }
        // Check if the user exists
        const user = await User.findOne({email});
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if(user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        const ratedLimited = await redisClient.get(`otp_limit:${email}`);
        if(ratedLimited){
            return res.status(429).json({
                success: false,
                message: "Please wait before requesting a new OTP"
            })
        }

        let otp = await redisClient.get(`otp:${email}`);
        if(!otp){
            otp = Math.floor(100000 + Math.random() * 900000); // Generate a new OTP
            await redisClient.set(`otp_limit:${email}`, 'sent', 'EX', 60); // Set cooldown for OTP requests\
        }
        await redisClient.set(`otp:${email}`, otp, 'EX', 300); // Store OTP in Redis for 5 minutes

        // Send the OTP via email
        const result = await sendMail(email, "Verify Your Email", otp);


        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "OTP resent successfully"
        });



    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
        
    }
}