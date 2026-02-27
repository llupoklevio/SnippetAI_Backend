import {registry} from "../../swagger/swaggerRegistry.js";
import {loginAuth, refreshAuth, registerAuth} from "./registerDefinition.js";
import {AuthValidationBodyError} from "../../middleware/validation/validationSchemaBody.js";
import {registerValidator} from "../type/validatorTypeRegister.js";
import {error500, errorDB409, responseRegisterSuccess} from "../type/registerDTO.js";
import {loginValidator} from "../type/validatorTypeLogin.js";
import {errorNotFound, responseLoginAPI} from "../type/loginDTO.js";
import {error400Refresh, errorNotFoundRefresh, responseRefreshAPI} from "../type/refreshDTO.js";

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
    Response: registry.register(
        'responsePostLogin',
        responseLoginAPI
    ),
    ErrorNotFound: registry.register(
        'errorNotFound',
        errorNotFound
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
        response: SchemaAuthLogin.Response,
        validator: SchemaAuthLogin.Validator,
        error404:SchemaAuthLogin.ErrorNotFound,
        error500: SchemaAuthLogin.ServerError
    })
)

export const SchemaAuthRefresh = {
    Response: registry.register(
        'responsePostRefresh',
        responseRefreshAPI
    ),
    ErrorNotFound: registry.register(
        'errorNotFoundRefresh',
        errorNotFoundRefresh
    ),
    ErrorValidationToken: registry.register(
      "errorValidationToken",
        error400Refresh
    ),
    ServerError: registry.register(
        'serverError',
        error500
    )
}

registry.registerPath(
    refreshAuth({
        path: "/auth/refresh",
        summary: "api used to get a new access token",
        response: SchemaAuthRefresh.Response,
        error400: SchemaAuthRefresh.ErrorValidationToken,
        error404: SchemaAuthRefresh.ErrorNotFound,
        error500: SchemaAuthRefresh.ServerError
    })
)
