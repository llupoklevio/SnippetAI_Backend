import { z } from 'zod';

export const registerValidator = z.object({
    firstName: z.string()
        .trim()
        .min(1, "First name is required")
        .regex(/^[a-zA-Z]+$/, "Only words"),
    lastName: z.string()
        .trim()
        .min(1, "Last name is required")
        .regex(/^[a-zA-Z]+$/, "Only words"),
    email: z.string()
        .trim()
        .min(6, "Email is required")
        .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Invalid email address"),
    password: z.string()
        .trim()
        .min(6, "Password is required with minimum 6 characters")
        .regex(/[A-Z]/, "One word must be uppercased")
        .regex(/[0-9]/, "One ore more numbers must be on password")
})

export type IregisterValidator = z.infer<typeof registerValidator>;
