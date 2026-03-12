import {Router} from "express";
import {getSingleSnippets, getSnippets, postSnippet} from "../snippet/controller/snippetController.js"
import {jwtMiddleware} from "../middleware/jwt/jwtMiddleware.js";
import {validationSchemaBody} from "../middleware/validation/validationSchemaBody.js";
import {createSnippetValidator} from "../snippet/type/validatorPostSnippet.js";
import {validationSchemaParams} from "../middleware/validation/validationSchemaParamas.js";
import {paramsGetSingleSnippet} from "../snippet/type/responseSnippet.js";

const router = Router()

router.post("/", jwtMiddleware,validationSchemaBody(createSnippetValidator),postSnippet)
router.get("/", jwtMiddleware,getSnippets)
router.get("/:idSnippet", jwtMiddleware,validationSchemaParams(paramsGetSingleSnippet),getSingleSnippets)


export default router