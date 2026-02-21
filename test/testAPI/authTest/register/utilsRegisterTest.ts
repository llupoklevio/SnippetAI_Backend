//import * as z from "zod";
import {IregisterValidator, registerValidator} from "../../../../src/auth/type/validatorTypeRegister";


export const errorValidator : IregisterValidator = {
    email: "",
    password:"" ,
    lastName: "",
    firstName: ""
}

export const errorValidatorWrongType = {
    email: 20,
    password:20 ,
    lastName: 20,
    firstName: 20
}

type pathRegisterValidator = 'firstName' | 'lastName' | 'email' | 'password'

export function getChecks(path: pathRegisterValidator): { type: string, err: string }[] {
    const shape = registerValidator.shape[path] as any

    const schema = shape._def.schema ?? shape
    const checks = (schema._def.checks ?? []).map((check: any) => ({
        type: check.kind,
        err: check.message
    })).filter((err: any) => err.err)

    if (shape._def.typeName === 'ZodEffects') {
        const result = shape.safeParse("")
        if (!result.success) {
            const refineError = result.error.errors.find((e: any) => e.code === "custom")
            if (refineError) checks.push({type: "custom", err: refineError.message})
        }
    }

    return checks
}

export const zodTypeMap: Record<string, string> = {
    ZodString: "string",
    ZodNumber: "number",
    ZodBoolean: "boolean",
    ZodDate: "date",
}