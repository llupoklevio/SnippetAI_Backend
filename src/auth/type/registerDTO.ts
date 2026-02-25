import {z} from "zod";
import {extendZodWithOpenApi, ZodOpenAPIMetadata} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

function op<T extends z.ZodTypeAny>(schema: T, meta: Partial<ZodOpenAPIMetadata>): T {
    return (schema as any).openapi(meta);
}
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

export const errorDB409 = z.object({
    type: op(z.string(),{examples: [
            "DATABASE_ERROR",
            "BusinessLogic"
        ]}),
    message: op(z.string(),{examples: [
            "Risorsa già esistente (duplicato).",
            "L'email è già registrata"
        ]}),
})

export type typeErrorDB409 = z.infer<typeof errorDB409>


export const error500 = z.object({
    message: op(z.string(), {example: "Errore interno del server."})
})
export type typeError500 = z.infer<typeof error500>

