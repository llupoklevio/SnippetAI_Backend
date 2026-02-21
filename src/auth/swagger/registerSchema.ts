import {registry} from "../../swagger/swaggerRegistry.js";
import {registerAuth} from "./registerDefinition.js";
import {registerValidator} from "../type/validatorTypeRegister.js";
import {AuthValidationBodyError} from "../../middleware/validation/validationSchemaBody.js";

export const SchemaAuthRegister = {
    Validator: registry.register(
        'validatorPostRegister',
        (AuthValidationBodyError as unknown) as any
    ),
    Response: registry.register(
        'responsePostRegister',
        (registerValidator as unknown) as any
    )
}

registry.registerPath(
    registerAuth({
        path: "/auth/register",
        summary: "register a user",
        response:SchemaAuthRegister.Response,
        validator: SchemaAuthRegister.Validator
    })
)