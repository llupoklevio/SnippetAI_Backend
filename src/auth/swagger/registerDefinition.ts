import {IbaseStruct} from "../../type/swagger/baseStructureDefinitionAPI.js";

export const registerAuth = ({path,summary,response,validator} : IbaseStruct & {validator : any}) => ({
    method: "post" as const,
    path: path,
    summary: summary,
    request: {
        body: { content: { 'application/json': { schema: response } } }
    },
    responses: {
        200: {
            description: "Successfully registered",
            content: {'application/json': {schema: response}}
        },
        400: {
            description: "Swagger validation failed.",
            content: {'application/json': {schema: validator}}
        },

    }
})