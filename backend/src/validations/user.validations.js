import { z } from "zod"

export const registerSchema = z.object({
    fullname: z.string().trim().min(1, "Fullname is required"),
    username: z.string().trim().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
})

export const loginSchema = z
    .object({
        username: z.string().trim().optional(),
        email: z.string().email("Invalid email").optional(),
        password: z.string().min(1, "Password is required")
    })
    .refine((data) => data.username || data.email, {
        message: "Username or email is required",
        path: ["username"]
    })

export const refreshTokenSchema = z.object({
    refreshToken: z.string().optional()
})

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters")
})

export const updateAccountSchema = z.object({
    fullname: z.string().trim().min(1, "Fullname is required"),
    email: z.string().email("Invalid email address")
})

export const channelUsernameSchema = z.object({
    username: z.string().min(1, "Username is required")
})
