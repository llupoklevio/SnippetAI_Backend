import {Router} from "express";
import {register} from "../auth/controller/authController.js";
import {validationSchemaBody} from "../middleware/validation/validationSchemaBody.js";
import {registerValidator} from "../auth/type/validatorTypeRegister.js";

const router = Router()

router.post("/register", validationSchemaBody(registerValidator),register)

export default router