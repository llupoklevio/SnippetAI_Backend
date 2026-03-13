import {Router} from "express";
import {
    getSingleSnippets,
    getSnippets,
    postSnippet,
    saveSnippetWithDescriptionAI
} from "../snippet/controller/snippetController.js"
import {jwtMiddleware} from "../middleware/jwt/jwtMiddleware.js";
import {validationSchemaBody} from "../middleware/validation/validationSchemaBody.js";
import {createSnippetValidator, DescAIValidator, idSnippetValidator} from "../snippet/type/validatorPostSnippet.js";
import {validationSchemaParams} from "../middleware/validation/validationSchemaParamas.js";
import {paramsGetSingleSnippet} from "../snippet/type/responseSnippet.js";

const router = Router()

router.post("/", jwtMiddleware,validationSchemaBody(createSnippetValidator),postSnippet)
router.get("/", jwtMiddleware,getSnippets)
router.get("/:idSnippet", jwtMiddleware,validationSchemaParams(paramsGetSingleSnippet),getSingleSnippets)
router.post("/:idSnippet/saveDescAI",validationSchemaParams(idSnippetValidator),validationSchemaBody(DescAIValidator), jwtMiddleware,saveSnippetWithDescriptionAI)



export default router