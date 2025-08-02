import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Always use HTTPS

});

export const uploadImage = async (filePath) => {
    try {
        if(!filePath) {
            return null;
        }

        if(!fs.existsSync(filePath)){
            return null;
        }

        const result = await cloudinary.uploader.upload(filePath,{
            folder: 'Hiky/profile_images',
            resource_type: 'image',
        })

        if(!result?.secure_url){
            throw new Error("Image upload failed");
        }

        fs.unlinkSync(filePath); 

        return result;

    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error.message);
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }
        return null;
        
    }
}