import {z} from "zod";

export const baseStruct = z.object({
    path: z.string(),
    summary: z.string(),
    response: z.any(),
})

export type IbaseStruct = z.infer<typeof baseStruct>;