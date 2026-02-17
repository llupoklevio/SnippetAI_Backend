import {Router} from "express";
import {createSnippet} from "../snippet/controller/snippetController.js"

const router = Router()

router.post("/", createSnippet)

export default router