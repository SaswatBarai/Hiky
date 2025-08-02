import {Router} from 'express';
import {
    register,
    verifyEmail,
    resentOTP,
    profileUploader,
    getUserData,
    login,
    logout
} from "../controllers/user.controller.js"
import { upload } from '../middleware/multer.middleware.js';
import {authMiddleware} from "../middleware/auth.middleware.js"

const router = Router();






// User Routes
router.post("/register",register)
router.post("/login",login);
router.post("/verify-email",verifyEmail)
router.get("/resent-otp",resentOTP)



//Auth Routes 
router.post("/profile-uploader",authMiddleware,upload.single("profileImage"), profileUploader);
router.get("/get-user-data",authMiddleware,getUserData);
router.get("/logout",authMiddleware,logout);


export default router;