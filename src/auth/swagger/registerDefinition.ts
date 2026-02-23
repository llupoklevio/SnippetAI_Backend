import {IbaseStruct} from "../../type/swagger/baseStructureDefinitionAPI.js";

export const registerAuth = ({path,summary,send,response,validator} : IbaseStruct & {send: any,validator : any}) => ({
    method: "post" as const,
    path: path,
    summary: summary,
    request: {
        body: { content: { 'application/json': { schema: send } } }
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