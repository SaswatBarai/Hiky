import User from "../models/user.model.js"
import {redisClient} from "../config/connectRedis.js";
import sendMail from "../services/sendMail.js"
import {uploadImage} from "../services/cloudinary.js"


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



export const profileUploader = async (req, res) => {
    try {
        const {name} = req.body;
        const path = req.file ? req.file.path : null;

        if (!path) {
            return res.status(400).json({
                success: false,
                message: "Please upload a profile picture"
            });
        }

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please provide a name"
            });
        }

        const user = req.user; 

        console.log(user)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        
        const result = await uploadImage(path);

        if (!result) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload image"
            });
        }

        await User.findByIdAndUpdate(user._id,{
            profileImage: {
                image: result.secure_url,
                publicId: result.public_id
            },
            name: name
        }, { new: true }).select("-password -refreshToken");

        return res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
        });

        
    } catch (error) {
        
    }
}


export const getUserData = async (req,res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if(await redisClient.exists(`user:${user._id}`)) {
           
            const cachedUser = JSON.parse(await redisClient.get(`user:${user._id}`));
            return res.status(200).json({
                success: true,
                message: "User data retrieved from cache",
                user: cachedUser
            });
        }


        const userData = await User.findById(user._id).select("-password -refreshToken");
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        await redisClient.set(`user:${user._id}`, JSON.stringify(userData), 'EX', 3600); // Cache user data for 1 hour  

        return res.status(200).json({
            success: true,
            message: "User data retrieved successfully",
            user: userData
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


export const login = async (req,res) => {
    try {
        const {mainInput, password} = req.body;
        if([mainInput, password].includes(undefined)){
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const user = await User.findOne({
            $or:[
                { username: mainInput },
                { email: mainInput }
            ]
        }).select("+password +refreshToken");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();


        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        return res.cookie("refreshToken",refreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 
            
        }).status(200).json({
            success: true,
            message: "User logged in successfully",
            user: loggedInUser,
            accessToken 
        })
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


export const logout = async (req,res) => {

    console.log("mark 1")
    try {
        if(!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const user = req.user;
        user.refreshToken = "";
        await user.save();
        await redisClient.del(`user:${user._id}`);

        return res.clearCookie("refreshToken").status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

