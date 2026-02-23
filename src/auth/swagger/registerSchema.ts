import {registry} from "../../swagger/swaggerRegistry.js";
import {loginAuth, registerAuth} from "./registerDefinition.js";
import {AuthValidationBodyError} from "../../middleware/validation/validationSchemaBody.js";
import {registerValidator} from "../type/validatorTypeRegister.js";
import {error500, errorDB409, responseRegisterSuccess} from "../type/registerDTO.js";
import {loginValidator} from "../type/validatorTypeLogin.js";

export const SchemaAuthRegister = {
    Validator: registry.register(
        'validatorPostRegister',
        AuthValidationBodyError
    ),
    Send: registry.register(
        'sendPostRegister',
        registerValidator
    ),
    Response: registry.register(
        'responsePostRegister',
        responseRegisterSuccess
    ),
    ErrorDuplicated: registry.register(
        'errorDuplicateRegister',
        errorDB409
    ),
    ServerError: registry.register(
        'serverError',
        error500
    )
}

registry.registerPath(
    registerAuth({
        path: "/auth/register",
        summary: "register a user",
        send:SchemaAuthRegister.Send,
        response: SchemaAuthRegister.Response,
        validator: SchemaAuthRegister.Validator,
        error409: SchemaAuthRegister.ErrorDuplicated,
        error500: SchemaAuthRegister.ServerError
    })
)

export const SchemaAuthLogin = {
    Validator: registry.register(
        'validatorPostLogin',
        AuthValidationBodyError
    ),
    Send: registry.register(
        'sendPostLogin',
        loginValidator
    ),
    ServerError: registry.register(
        'serverError',
        error500
    )
}

registry.registerPath(
    loginAuth({
        path: "/auth/login",
        summary: "login a user",
        send: SchemaAuthLogin.Send,
        validator: SchemaAuthLogin.Validator,
        error500: SchemaAuthLogin.ServerError
    })
)