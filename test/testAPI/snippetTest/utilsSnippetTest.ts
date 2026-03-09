import jwt from "jsonwebtoken";
import {createSnippetValidator, typeCreateSnippetValidator} from "../../../src/snippet/type/validatorPostSnippet";
import {z} from "zod";
import {Snippet} from "../../../src/entities/postgres/snippet.entity";

export const generateTestToken = (payload  : {idUser: string, email: string} = { idUser: "user-123", email: "test@unit.com" }) => {
    return jwt.sign(payload, process.env.SECRET_JWT!, { expiresIn: "1h" });
};

export const baseData = {
    title: "exampleTitle",
    description: "Deep example of description",
    code: "function a(){ return 20 }",
}

export const baseWrongData = {
    title: 20,
    description: 20,
    code: 20,
}

export const baseWrongDataError = {
    title: "",
    description: "not 20 characters",
    code: "",
}

type pathSnippetPost = 'title' | 'code' | 'description'

export function getChecks(path: pathSnippetPost): { type: string, err: string }[] {
    const raw = createSnippetValidator.shape[path] as any

    const shape =  raw instanceof z.ZodOptional ? raw.unwrap() : raw

    const schema = shape._def.schema ?? shape
    const checks = (schema._def.checks ?? []).map((check: any) => ({
        type: check.kind,
        err: check.message
    })).filter((err: any) => err.err)

    if (shape._def.typeName === 'ZodEffects') {
        const result = shape.safeParse("")
        if (!result.success) {
            const refineError = result.error.errors.find((e: any) => e.code === "custom")
            if (refineError) checks.push({type: "custom", err: refineError.message})
        }
    }

    return checks
}

export const createSnippet = (snippet : typeCreateSnippetValidator = baseData) => {
    return snippet
}

export type typeSnippetService = {
    snippet: Snippet
    operation: "RAG" | "DESCRIPTIONAI"
}

const socketRAGSchema = z.object({
    message: z.string(),
    status: z.number()
})

export type socketRAG = z.infer<typeof socketRAGSchema>

const socketDesc = z.object({
    description: z.string(),
    snippetId: z.number()
})

export type socketDesc = z.infer<typeof socketDesc>


