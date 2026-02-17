import {OpenApiGeneratorV3, OpenAPIRegistry} from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry()

export const getSwaggerDoc = () => {
    const generator = new OpenApiGeneratorV3(registry.definitions)
    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: "Snippet AI",
            version: "1.0.0",
            description: "Automatic documentation",
        },
    })
}
