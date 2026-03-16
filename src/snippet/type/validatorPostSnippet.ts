import { extendZodWithOpenApi, ZodOpenAPIMetadata } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

function op<T extends z.ZodTypeAny>(schema: T, meta: Partial<ZodOpenAPIMetadata>): T {
    return (schema as any).openapi(meta);
}

/** POST SNIPPET  */

export const createSnippetValidator = z.object({
    title: op(
        z.string()
            .trim()
            .min(1,"Title is required"),
        {example: "Snippet1"}
    ),
    code: op(
        z.string()
            .min(1,"Code is required"),
        {example: "Code1"}
    ),
    description: op(
        z.string()
            .trim()
            .min(20,"Description must be a minimum of 20 characters")
            .optional(),
        {example: "Deep example of description"}
    )
})

export type typeCreateSnippetValidator = z.infer<typeof createSnippetValidator>

/** POST SNIPPET DESC AI  */

export const DescAIValidator = z.object({
    description: z.string()
        .trim()
        .min(20,"Description must be a minimum of 20 characters"),
})

export type typeDescAIValidator = z.infer<typeof DescAIValidator>


export const idSnippetValidator = z.object({
    idSnippet: z.coerce
        .number({invalid_type_error: "is not number"})
        .positive("is not positive"),
})

export type typeIdSnippetValidator = z.infer<typeof idSnippetValidator>

/** GET SNIPPET BY VDB  */

export const validatorQuerySearch = z.object({
    query: z.string()
        .trim()
        .min(1,"query is required"),
})

export type typeValidatorQuerySearch = z.infer<typeof validatorQuerySearch>

