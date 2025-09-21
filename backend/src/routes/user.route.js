import {Router} from 'express';
import {
    register,
    verifyEmail,
    resentOTP,
    profileUploader,
    getUserData,
    login,
    logout,
    forgotPassword,
    verifyResetPasswordToken,
    resetPassword
} from "../controllers/user.controller.js"
import { upload } from '../middleware/multer.middleware.js';
import {authMiddleware} from "../middleware/auth.middleware.js"
import { validateSchema } from '../validation/validationMiddleware.js';
import {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    resendOTPSchema,
    profileUploaderSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    resetPasswordTokenSchema
} from '../validation/user.validation.js';
import {forgotPasswordLimiter} from "../rateLimits/limit.js"

const router = Router();






// User Routes
router.post("/register", validateSchema(registerSchema), register)
router.post("/login", validateSchema(loginSchema), login);
router.post("/verify-email", validateSchema(verifyEmailSchema), verifyEmail)
router.post("/resent-otp", validateSchema(resendOTPSchema), resentOTP)

router.post("/forgot-password",forgotPasswordLimiter, validateSchema(forgotPasswordSchema), forgotPassword)
router.get("/verify-reset-token/:token", validateSchema(resetPasswordTokenSchema, 'params'), verifyResetPasswordToken)
router.post("/reset-password/:token", validateSchema(resetPasswordTokenSchema, 'params'), validateSchema(resetPasswordSchema), resetPassword)

//Auth Routes 
router.post("/profile-uploader", authMiddleware, upload.single("profileImage"), validateSchema(profileUploaderSchema), profileUploader);
router.get("/get-user-data", authMiddleware, getUserData);
router.get("/logout", authMiddleware, logout);


export default router;