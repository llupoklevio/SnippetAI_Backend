import {OpenApiGeneratorV3, OpenAPIRegistry} from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry()

registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Inserisci il token JWT'
});

export const getSwaggerDoc = () => {
    const generator = new OpenApiGeneratorV3(registry.definitions)
    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: "Snippet AI",
            version: "1.0.0",
            description: "Automatic documentation",
        },
        tags: [
            {
                name: 'Auth',
                description: 'Gestione autenticazione utenti',
            },
            {
                name: 'Snippet',
                description: 'Gestione snippetPost utenti',
            }
        ]
    })
}
