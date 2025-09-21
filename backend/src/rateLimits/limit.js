import rateLimit from "express-rate-limit";

export const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000000, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: "Too many password reset attempts. Try later."
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});