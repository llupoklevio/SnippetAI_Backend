import {registry} from "../../swagger/swaggerRegistry.js";
import {ResponsePostSnippet} from "../type/responseSnippet.js";
import {postSnippet} from "./snippetDefinetion.js";

export const SchemaPostSnippet = {
    Response: registry.register('responsePostSnippet',ResponsePostSnippet)
}

registry.registerPath(
    postSnippet({
        path: "/snippets",
        summary: "creation of snippet",
        response: SchemaPostSnippet.Response,
    })
)

