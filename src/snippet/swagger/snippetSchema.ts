import {registry} from "../../swagger/swaggerRegistry.js";
import {
    error400GetSingleSnippet, error404ResponseAPIPostSnippetVDB,
    paramsGetSingleSnippet,
    ResponseAPIGETSnippets, responseAPIPostSnippetDescAI,
    responseControllerSnippet
} from "../type/responseSnippet.js";
import {
    getSingleSnippet,
    getSnippets,
    postSnippet,
    postSnippetDescAI,
    postSnippetSimilaritySearch
} from "./snippetDefinetion.js";
import {
    createSnippetValidator,
    DescAIValidator,
    idSnippetValidator,
    validatorQuerySearch
} from "../type/validatorPostSnippet.js";
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
        'Error400GetSnippet',
        error400Refresh
    ),
    Error404: registry.register(
        "Error404GetSnippet",
        errorNotFound
    ),
    Error500: registry.register(
        'Error500GetSnippet',
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

/** Get Single Snippet */

export const SchemaGetSingleSnippet = {
    Response: registry.register(
        'responseGetSingleSnippet',
        responseControllerSnippet
    ),
    Params: registry.register(
        'paramsGetSingleSnippet',
        paramsGetSingleSnippet
    ),
    Error400: registry.register(
        'Error400GetSingleSnippet',
        error400Refresh
    ),
    Error404: registry.register(
      "Error404GetSingleSnippet",
        error400GetSingleSnippet
    ),
    Error500: registry.register(
        'Error500GetSingleSnippet',
        error500
    )
}

registry.registerPath(
    getSingleSnippet({
        path:     "/snippets/{idSnippet}",
        summary:  "get all personal snippet",
        params:   SchemaGetSingleSnippet.Params,
        response: SchemaGetSingleSnippet.Response,
        error400: SchemaGetSingleSnippet.Error400,
        error404: SchemaGetSingleSnippet.Error404,
        error500: SchemaGetSingleSnippet.Error500
    })
)


/** POST SNIPPET DESC AI */

export const SchemaPostDescAI = {
    Params: registry.register(
        'paramsPostDescAI',
        idSnippetValidator
    ),
    Send: registry.register(
        'sendPostDescAI',
        DescAIValidator
    ),
    Response: registry.register(
        'responsePostDescAI',
        responseAPIPostSnippetDescAI
    ),
    Error500: registry.register(
        'Error500PostDescAI',
        error500
    )
}

registry.registerPath(
    postSnippetDescAI({
        path: "/snippets/{idSnippet}/saveDescAI",
        summary: "API used for saving description created by AI or Human",
        response: SchemaPostDescAI.Response,
        params: SchemaPostDescAI.Params,
        send: SchemaPostDescAI.Send,
        error500: SchemaPostDescAI.Error500
    })
)

export const SchemaPostSnippetsVectorDB = {
    Send: registry.register(
        'sendPostSearchVDB',
        validatorQuerySearch
    ),
    Response: registry.register(
        'responsePostSearchVDB',
        ResponseAPIGETSnippets
    ),
    Error400: registry.register(
        'Error400PostSearchVDB',
        error400Refresh
    ),
    Error404: registry.register(
        "Error404PostSearchVDB",
        error404ResponseAPIPostSnippetVDB
    ),
    Error500: registry.register(
        'Error500PostSearchVDB',
        error500
    )
}

registry.registerPath(
    postSnippetSimilaritySearch({
        path: "/snippets/SimilaritySearch",
        summary: "API used for similarity research on snippet",
        send: SchemaPostSnippetsVectorDB.Send,
        response: SchemaPostSnippetsVectorDB.Response,
        error400: SchemaPostSnippetsVectorDB.Error400,
        error404: SchemaPostSnippetsVectorDB.Error404,
        error500: SchemaPostSnippetsVectorDB.Error500
    })
)