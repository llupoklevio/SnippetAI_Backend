import { extendZodWithOpenApi, ZodOpenAPIMetadata } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

function op<T extends z.ZodTypeAny>(schema: T, meta: Partial<ZodOpenAPIMetadata>): T {
    return (schema as any).openapi(meta);
}

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
            .min(20,"Description is required")
            .optional(),
        {example: "Deep example of description"}
    )
})

export type typeCreateSnippetValidator = z.infer<typeof createSnippetValidator>