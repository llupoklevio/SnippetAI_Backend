import {z} from "zod";
import {extendZodWithOpenApi, ZodOpenAPIMetadata} from "@asteasolutions/zod-to-openapi";
import {error400Refresh} from "../../auth/type/refreshDTO.js";
import {AuthValidationBodyError} from "../../middleware/validation/validationSchemaBody.js";

extendZodWithOpenApi(z);

function op<T extends z.ZodTypeAny>(schema: T, meta: Partial<ZodOpenAPIMetadata>): T {
    return (schema as any).openapi(meta);
}

export const ResponsePostSnippet = z.object({
    id: z.number(),
    title: z.string(),
    code: z.string(),
    description: z.string().nullable(),
    dateCreation: z.date(),
    dateUpdate: z.date(),
    snippetOwner: z.object({
        id: z.string(),
        email: z.string(),
    })
})

export type IResponseSnippet = z.infer<typeof ResponsePostSnippet>;

export const responseControllerSnippet = z.object({
    snippet: ResponsePostSnippet,
    message: z.union([z.string(), z.string()]),
})

export type typeResponseControllerSnippet = z.infer<typeof responseControllerSnippet>;

export const ForDescriptionAIWorker = z.object({
    code: z.string(),
    id: z.number(),
})

export type TypeForDescriptionAIWorker = z.infer<typeof ForDescriptionAIWorker>;

export const error400Snippet = z.union([error400Refresh, AuthValidationBodyError])

/** Get Snippets */

export const ResponseGetSnippets = z.array(z.object({
    id: z.number(),
    title: z.string(),
    code: z.string(),
    description: z.string().nullable(),
    dateCreation: z.date(),
    dateUpdate: z.date(),
    snippetOwner: z.object({
        id: z.string(),
        email: z.string(),
    })
}))

export type IResponseSnippets = z.infer<typeof ResponseGetSnippets>;

export const ResponseAPIGETSnippets = z.object({
    snippets: ResponseGetSnippets
})

export type typeResponseAPIGETSnippets = z.infer<typeof ResponseAPIGETSnippets>;

/** get SingleSnippet */

export const paramsGetSingleSnippet = z.object({
    idSnippet: z.coerce.number({invalid_type_error: "is not number"}).int("is not number").positive("is not positive"),
})

export const error400GetSingleSnippetUserNotFound = z.object({
    message: op(
        z.string(),
        {example:"User Not Found"}
    ),
    type: op(z.string(),{examples: [
            "BusinessLogic"
        ]}),
})

export const error400GetSingleSnippetSnippetNotFound = z.object({
    message: op(
        z.string(),
        {example:"User Not Found"}
    ),
    type: op(z.string(),{examples: [
            "BusinessLogic"
        ]}),
})

export const error400GetSingleSnippet = z.union([error400GetSingleSnippetSnippetNotFound, error400GetSingleSnippetUserNotFound])


/** post SnippetDescAI */

export const responseAPIPostSnippetDescAI = z.object({
    snippet: ResponsePostSnippet
})

export type typeResponseAPIPostSnippetDescAI = z.infer<typeof responseAPIPostSnippetDescAI>
