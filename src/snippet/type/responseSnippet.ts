import {z} from "zod";
import {extendZodWithOpenApi} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const ResponsePostSnippet = z.object({
    message: z.string().openapi({
        example: "ok"
    })
})

export type IResponseSnippet = z.infer<typeof ResponsePostSnippet>;

