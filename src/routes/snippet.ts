import {Router} from "express";
import {getSnippets, postSnippet} from "../snippet/controller/snippetController.js"
import {jwtMiddleware} from "../middleware/jwt/jwtMiddleware.js";
import {validationSchemaBody} from "../middleware/validation/validationSchemaBody.js";
import {createSnippetValidator} from "../snippet/type/validatorPostSnippet.js";

const router = Router()

router.post("/", jwtMiddleware,validationSchemaBody(createSnippetValidator),postSnippet)
router.get("/", jwtMiddleware,getSnippets)

export default router