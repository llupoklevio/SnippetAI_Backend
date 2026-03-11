
import {z} from "zod";
import {extendZodWithOpenApi, ZodOpenAPIMetadata } from "@asteasolutions/zod-to-openapi";
import {registerDTO} from "./registerDTO.js";

extendZodWithOpenApi(z);


function op<T extends z.ZodTypeAny>(schema: T, meta: Partial<ZodOpenAPIMetadata>): T {
    return (schema as any).openapi(meta);
}


const responseServiceLogin = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: registerDTO
})

export type typeResponseServiceLogin = z.infer<typeof responseServiceLogin>

export const responseLoginAPI = z.object({
    message: z.string(),
    session: responseServiceLogin
})

export type typeResponseLoginAPI = z.infer<typeof responseLoginAPI>

export const errorNotFound = z.object({
    type: op(z.string(),{examples: [
            "BusinessLogic"
        ]}),
    message: op(z.string(),{example:
            "User Not Found",
        }),
})


