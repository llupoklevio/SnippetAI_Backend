import {z} from "zod";
import {extendZodWithOpenApi, ZodOpenAPIMetadata} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const responseRefreshAPI = z.object({
    message: z.string(),
    accessToken: z.string(),
})

function op<T extends z.ZodTypeAny>(schema: T, meta: Partial<ZodOpenAPIMetadata>): T {
    return (schema as any).openapi(meta);
}


export const errorNotFoundRefresh = z.object({
    type: op(z.string(),{examples: [
            "BusinessLogic"
        ]}),
    message: op(z.string(),{examples: [
            "User not found",
            "Token Not Found"
        ]}),
})

export const error400Refresh = z.object({
    type: op(z.string(),{examples: [
            "BusinessLogic"
        ]}),
    message: op(z.string(),{examples: [
            "Problem with JWT: see if you sending token",
        ]}),
})


export type typeResponseRefreshAPI = z.infer<typeof responseRefreshAPI>