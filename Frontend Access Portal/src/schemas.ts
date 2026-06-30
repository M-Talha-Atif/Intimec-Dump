import {z} from "zod"

export const LoginFormSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters long')
        .max(32, 'Username must be less than 32 characters'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .max(16, 'Password must be less than 16 characters'),
})
