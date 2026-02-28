import {IregisterValidator, registerValidator} from "../../../src/auth/type/validatorTypeRegister";
import {typeLoginValidator} from "../../../src/auth/type/validatorTypeLogin";
import jwt from "jsonwebtoken"
import {Express} from "express";
import {ExpectStatic} from "vitest";
import {typeResponseLoginAPI} from "../../../src/auth/type/loginDTO";

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

export const defaultUser : IregisterValidator = {
    firstName: "User",
    lastName: "Test",
    password: "UserTest20",
    email: "user@test.com"
}

/**
 * Crea un utente valido per i test.
 * @param user - Campi da sovrascrivere
 * @param user.firstName - Solo lettere, min 1 carattere (es. "Klevio")
 * @param user.lastName - Solo lettere, min 1 carattere (es. "Llupo")
 * @param user.email - Email valida (es. "klevio@gmail.com")
 * @param user.password - Min 6 caratteri, una maiuscola, un numero (es. "Klevio03")
 */
export const createUser = (user : Partial<IregisterValidator>) : IregisterValidator => {
    const userResponse : IregisterValidator = Object.assign(defaultUser)

    return {
        ...Object.assign(userResponse, user)
    }
}

type pathRegisterValidator = 'firstName' | 'lastName' | 'email' | 'password'
type pathLoginValidator = 'email' | 'password'

export function getChecks(path: pathRegisterValidator | pathLoginValidator): { type: string, err: string }[] {
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

/** ###### LOGIN ######### */

export const errorValidatorWrongTypeLogin = {
    email: 20,
    password:20 ,
}

export const errorValidatorLogin : typeLoginValidator = {
    email: "",
    password:"" ,
}

/** ##### REFRESH ###### */
export function getToken() : string  {
    return "Bearer "+jwt.sign({
        email: defaultUser.email,
        id: 1
    },process.env.SECRET_JWT!, {expiresIn: "1h"})
}

export const getTokenByLoggedUser = async (request: any, app: Express, expect: ExpectStatic) : Promise<typeResponseLoginAPI["session"]> => {

    const register = await request(app)
        .post("/auth/register")
        .send(createUser({}))

    expect(register.status).equal(201)

    const login = await request(app)
        .post("/auth/login")
        .send(createUser({}))

    expect(login.status).equal(200)

    return login.body.session
}