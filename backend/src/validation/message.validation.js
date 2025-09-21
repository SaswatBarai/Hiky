import { z } from 'zod';


export const createRoomSchema = z.object({
    roomType: z.enum(['private', 'group'], {
        errorMap: () => ({ message: "Room type must be either 'private' or 'group'" })
    }),
    participants: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid participant ID format"))
        .min(1, "At least one participant is required")
        .max(50, "Maximum 50 participants allowed"),
    name: z.string()
        .min(1, "Group name is required")
        .max(100, "Group name must be at most 100 characters")
        .optional()
}).refine((data) => {
    if (data.roomType === 'group' && !data.name) {
        return false;
    }
    if (data.roomType === 'private' && data.participants.length !== 2) {
        return false;
    }
    return true;
}, {
    message: "Group rooms must have a name, and private rooms must have exactly 2 participants"
});


export const createPrivateRoomSchema = z.object({
    mainInput: z.string()
        .min(1, "Username or email is required"),
    roomType: z.string()
        .refine((val) => val.toLowerCase() === 'private', {
            message: "Room type must be 'private'"
        })
});

export const sendMessageSchema = z.object({
    roomId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID format"),
    content: z.string()
        .min(1, "Message content is required")
        .max(2000, "Message must be at most 2000 characters")
});

export const getMessagesParamsSchema = z.object({
    roomId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID format")
});

export const getMessagesQuerySchema = z.object({
    limit: z.string()
        .regex(/^\d+$/, "Limit must be a number")
        .transform(Number)
        .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
        .default("20"),
    page: z.string()
        .regex(/^\d+$/, "Page must be a number")
        .transform(Number)
        .refine((val) => val > 0, "Page must be greater than 0")
        .default("1")
});


export const searchUsersQuerySchema = z.object({
    query: z.string()
        .min(1, "Search query is required")
        .max(50, "Search query must be at most 50 characters")
});


export const deleteRoomParamsSchema = z.object({
    roomId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID format")
});


export const markMessagesAsReadParamsSchema = z.object({
    roomId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid room ID format")
});
