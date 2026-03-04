import {z} from "zod";
import {extendZodWithOpenApi} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

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

export const ForDescriptionAIWorker = z.object({
    code: z.string(),
    id: z.number(),
})

export type TypeForDescriptionAIWorker = z.infer<typeof ForDescriptionAIWorker>;


