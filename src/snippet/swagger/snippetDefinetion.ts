import {IbaseStruct} from "../../type/swagger/baseStructureDefinitionAPI.js";

export const postSnippet = ({path,summary,response}: IbaseStruct) => ({
    method: "post" as const,
    path: path,
    summary,
    responses : {
        200: {
            description: "success",
            content: {'application/json': {schema : response}}
        }
    }
})