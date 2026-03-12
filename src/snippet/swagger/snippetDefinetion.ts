import {IbaseStruct} from "../../type/swagger/baseStructureDefinitionAPI.js";


export const postSnippet = ({path,summary,response,send, error400, error500,error404}: IbaseStruct & {send: any, error400: any, error404: any}) => ({
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
        },
        400: {
            description: "validator fail",
            content: {'application/json': {schema : error400}}
        },
        404: {
            description: "error not found",
            content: {'application/json': {schema : error404}}
        },
        500: {
            description: "error",
            content: {'application/json': {schema : error500}}
        }
    }
})

export const getSnippets = ({path,summary,response,error400, error404,error500} : IbaseStruct & {error400: any,error404: any}) => ({
    method: "get" as const,
    path: path,
    summary,
    tags: ['Snippet'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "success",
            content: {'application/json': {schema : response}}
        },
        400: {
          description: "jwt error",
          content: {'application/json': {schema : error400}}
        },
        404: {
            description: "error not found",
            content: {'application/json': {schema : error404}}
        },
        500: {
            description: "error",
            content: {'application/json': {schema : error500}}
        }
    }
})