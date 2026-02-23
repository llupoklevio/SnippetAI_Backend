import {z} from "zod";

export const registerDTO = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
})

export type typeRegisterDTO = z.infer<typeof registerDTO>


export const responseRegisterSuccess = z.object({
    user: registerDTO
})

export type typeResponseRegisterSuccess = z.infer<typeof responseRegisterSuccess>