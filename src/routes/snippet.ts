import {Router} from "express";
import {postSnippet} from "../snippet/controller/snippetController.js"

const router = Router()

router.post("/", postSnippet)

export default router