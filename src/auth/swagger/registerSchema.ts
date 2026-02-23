import {registry} from "../../swagger/swaggerRegistry.js";
import {registerAuth} from "./registerDefinition.js";
import {AuthValidationBodyError} from "../../middleware/validation/validationSchemaBody.js";
import {registerValidator} from "../type/validatorTypeRegister.js";
import {responseRegisterSuccess} from "../type/registerDTO.js";

export const SchemaAuthRegister = {
    Validator: registry.register(
        'validatorPostRegister',
        (AuthValidationBodyError as unknown) as any
    ),
    Send: registry.register(
        'sendPostRegister',
        (registerValidator as unknown) as any
    ),
    Response: registry.register(
        'responsePostRegister',
        (responseRegisterSuccess as unknown) as any
    )
}

registry.registerPath(
    registerAuth({
        path: "/auth/register",
        summary: "register a user",
        send:SchemaAuthRegister.Send,
        response: SchemaAuthRegister.Response,
        validator: SchemaAuthRegister.Validator
    })
)