import joi from "joi";

export const registerSchema = joi.object({
    username:joi.string().trim().min(3).max(20).required().messages({
        "string.min": "Username must be at least 3 characters long.",
        "string.max": "Username must be at most 20 characters long."
    }),
    email:joi.string().trim().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).required().messages({
        "string.pattern.base": "Email must be a valid email address.",
        "string.empty": "Email is required."
    }),
    // Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, and one number
    password:joi.string().trim().min(6).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/).required().messages({
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number."
    }),
    //confrimPassword must match password
    confirmPassword:joi.string().trim().valid(joi.ref('password')).required().messages({
        "any.only": "Confirm Password must match Password.",
        "string.empty": "Confirm Password is required."
    }),
})


export const newProfileSchema = joi.object({
    name: joi.string().trim().max(50).messages({
        "string.max": "Name must be at most 50 characters long.",
        "string.empty": "Name is required." 
    }),
    about: joi.string().trim().max(200).messages({
        "string.max": "About must be at most 200 characters long.",
        "string.empty": "About is required."
    })
})