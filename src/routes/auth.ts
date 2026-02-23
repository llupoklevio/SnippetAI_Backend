import {Router} from "express";
import {register} from "../auth/controller/authController.js";
import {validationSchemaBody} from "../middleware/validation/validationSchemaBody.js";
import {registerValidator} from "../auth/type/validatorTypeRegister.js";
import {authLimiter} from "../RateLimiting/rate.js";
import {login} from "../auth/controller/authLogin.js";
import {loginValidator} from "../auth/type/validatorTypeLogin.js";

const router = Router()

router.post("/register",authLimiter,validationSchemaBody(registerValidator),register)
router.post('/login',validationSchemaBody(loginValidator),login)

export default router