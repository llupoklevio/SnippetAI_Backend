import { extendZodWithOpenApi, ZodOpenAPIMetadata } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

function op<T extends z.ZodTypeAny>(schema: T, meta: Partial<ZodOpenAPIMetadata>): T {
    return (schema as any).openapi(meta);
}

export const registerValidator = z.object({
    firstName: op(
        z.string()
            .trim()
            .min(1, "First name is required")
            .regex(/^[a-zA-Z]+$/, "Only words"),
        { example: "Klevio" }
    ),
    lastName: op(
        z.string()
            .trim()
            .min(1, "Last name is required")
            .regex(/^[a-zA-Z]+$/, "Only words"),
        { example: "Llupo" }
    ),
    email: op(
        z.string()
            .trim()
            .min(6, "Email is required")
            .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Invalid email address"),
        { example: "kleviollupo@gmail.com" }
    ),
    password: op(
        z.string()
            .trim()
            .min(6, "Password is required with minimum 6 characters")
            .regex(/[A-Z]/, "One word must be uppercased")
            .regex(/[0-9]/, "One ore more numbers must be on password"),
        { example: "Klupo03" }
    ),
});

export type IregisterValidator = z.infer<typeof registerValidator>;