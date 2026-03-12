import {registry} from "../../swagger/swaggerRegistry.js";
import {ResponseAPIGETSnippets, responseControllerSnippet} from "../type/responseSnippet.js";
import {getSnippets, postSnippet} from "./snippetDefinetion.js";
import {createSnippetValidator} from "../type/validatorPostSnippet.js";
import {error400Refresh} from "../../auth/type/refreshDTO.js";
import {error500} from "../../auth/type/registerDTO.js";
import {errorNotFound} from "../../auth/type/loginDTO.js";

export const SchemaPostSnippet = {
    Response: registry.register(
        'responsePostSnippet',
        responseControllerSnippet
    ),
    Send: registry.register(
        'sendPostSnippet',
        createSnippetValidator
    ),
    Error400: registry.register(
        'Error400PostSnippet',
        error400Refresh
    ),
    Error404: registry.register(
        'Error404PostSnippet',
        errorNotFound
    ),
    Error500: registry.register(
        'Error500PostSnippet',
        error500
    )
}

registry.registerPath(
    postSnippet({
        path: "/snippets",
        summary: "creation of snippetPost",
        send: SchemaPostSnippet.Send,
        error400: SchemaPostSnippet.Error400,
        response: SchemaPostSnippet.Response,
        error500: SchemaPostSnippet.Error500,
        error404: SchemaPostSnippet.Error404
    })
)

/** Get snippets */

export const SchemaGetSnippets = {
    Response: registry.register(
        'responseGetSnippets',
        ResponseAPIGETSnippets
    ),
    Error400: registry.register(
        'Error400PostSnippet',
        error400Refresh
    ),
    Error404: registry.register(
        'Error404PostSnippet',
        errorNotFound
    ),
    Error500: registry.register(
        'Error500PostSnippet',
        error500
    )
}

registry.registerPath(
    getSnippets({
        path: "/snippets",
        summary: "get all personal snippet",
        response: SchemaGetSnippets.Response,
        error400: SchemaPostSnippet.Error400,
        error404: SchemaPostSnippet.Error404,
        error500: SchemaPostSnippet.Error500
    })
)
