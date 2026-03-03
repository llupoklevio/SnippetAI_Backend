import {IbaseStruct} from "../../type/swagger/baseStructureDefinitionAPI.js";

export const postSnippet = ({path,summary,response,send}: IbaseStruct & {send: any}) => ({
    method: "post" as const,
    path: path,
    summary,
    tags: ['Snippet'],
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: send } } }
    },
    responses : {
        200: {
            description: "success",
            content: {'application/json': {schema : response}}
        }
    }
})