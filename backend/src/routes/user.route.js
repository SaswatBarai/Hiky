import {Router} from 'express';
import {
    register,
    verifyEmail,
    resentOTP,
    profileUploader
} from "../controllers/user.controller.js"
import { upload } from '../middleware/multer.middleware.js';
import {authMiddleware} from "../middleware/auth.middleware.js"

const router = Router();






//
router.post("/register",register)
router.post("/verify-email",verifyEmail)
router.get("/resent-otp",resentOTP)
router.post("/profile-uploader",authMiddleware,upload.single("profileImage"), profileUploader);






export default router;