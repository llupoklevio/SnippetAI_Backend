import {registry} from "../../swagger/swaggerRegistry.js";
import {ResponsePostSnippet} from "../type/responseSnippet.js";
import {postSnippet} from "./snippetDefinetion.js";
import {createSnippetValidator} from "../type/validatorPostSnippet.js";

export const SchemaPostSnippet = {
    Response: registry.register(
        'responsePostSnippet',
        ResponsePostSnippet
    ),
    Send: registry.register(
        'sendPostSnippet',
        createSnippetValidator
    )
}

registry.registerPath(
    postSnippet({
        path: "/snippets",
        summary: "creation of snippet",
        send: SchemaPostSnippet.Send,
        response: SchemaPostSnippet.Response,
    })
)

