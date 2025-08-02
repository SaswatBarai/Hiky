import {Router} from 'express';
import {
    register,
    verifyEmail,
    resentOTP
} from "../controllers/user.controller.js"
import { upload } from '../middleware/multer.middleware.js';

const router = Router();






//
router.post("/register",register)
router.post("/verify-email",verifyEmail)
router.get("/resent-otp",resentOTP)
router.post("/profile-uploader",upload.single("profileImage"));






export default router;