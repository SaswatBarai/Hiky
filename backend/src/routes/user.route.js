import {Router} from 'express';
import {
    register,
    verifyEmail,
    resentOTP
} from "../controllers/user.controller.js"

const router = Router();






//
router.post("/register",register)
router.post("/verify-email",verifyEmail)
router.get("/resent-otp",resentOTP)






export default router;