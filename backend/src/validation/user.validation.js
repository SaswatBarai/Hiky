import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters long")
        .max(20, "Username must be at most 20 characters long")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string()
        .email("Please provide a valid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
});


export const loginSchema = z.object({
    mainInput: z.string()
        .min(1, "Username or email is required"),
    password: z.string()
        .min(1, "Password is required")
});

export const verifyEmailSchema = z.object({
    email: z.string()
        .email("Please provide a valid email address"),
    otp: z.string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d{6}$/, "OTP must contain only numbers")
});

export const resendOTPSchema = z.object({
    email: z.string()
        .email("Please provide a valid email address")
});

export const profileUploaderSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(50, "Name must be at most 50 characters long"),
    about: z.string()
        .min(1, "About is required")
        .max(500, "About must be at most 500 characters long")
});

export const forgotPasswordSchema = z.object({
    email: z.string()
        .email("Please provide a valid email address")
});


export const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, "Password must contain at least one uppercase letter, one lowercase letter, and one number")
});


export const resetPasswordTokenSchema = z.object({
    token: z.string()
        .min(1, "Token is required")
});
