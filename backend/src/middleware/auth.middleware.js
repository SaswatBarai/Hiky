import User from "../models/user.model.js"
import jwt from "jsonwebtoken";



export const authMiddleware = async (req,res,next) => {
    try {
        const accessToken = req.headers.authorization?.split(" ")[1] 
        
        if(!accessToken){
            return res.status(401).json({
                success: false,
                message: "Unauthorized access, token is missing"
            })
        }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

       
        req.user = user; 
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access, invalid token"
        });
    }
}