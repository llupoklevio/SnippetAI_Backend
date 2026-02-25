import {IbaseStruct} from "../../type/swagger/baseStructureDefinitionAPI.js";

export const registerAuth = ({path,summary,send,response,validator,error409, error500} : IbaseStruct & {send: any,validator : any, error409: any}) => ({
    method: "post" as const,
    path: path,
    tags: ['Auth'],
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
        409: {
            description: "Email already exists",
            content: {'application/json': {schema: error409}}
        },
        500: {
            description: "Server Error",
            content: {'application/json': {schema: error500}}
        }
    }
})

export const loginAuth = ({path,summary,send,response,error500,error404,validator} : IbaseStruct & {send: any, validator: any, error404: any}) => ({
    method: "post" as const,
    path: path,
    tags: ['Auth'],
    summary: summary,
    request: {
        body: { content: { 'application/json': { schema: send } } }
    },
    responses: {
        200:{
            description: "Successfully logged in",
            content: {'application/json': {schema: response}}
        },
        400: {
            description: "validation failed.",
            content: {'application/json': {schema: validator}}
        },
        404: {
            description: "user not founded",
            content: {'application/json': {schema: error404}}
        },
        500: {
            description: "Server Error",
            content: {'application/json': {schema: error500}}
        }
    }
})