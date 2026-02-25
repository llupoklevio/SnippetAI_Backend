import {beforeAll, describe, it, beforeEach, expect, vi} from "vitest"
import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import {
    createUser,
    errorValidatorLogin,
    errorValidatorWrongTypeLogin, getChecks,
    zodTypeMap
} from "../utilsAuthTest";
import request from "supertest";
import app from "../../../../src/app";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {typeResponseLoginAPI, typeResponseServiceLogin} from "../../../../src/auth/type/loginDTO";
import {loginValidator} from "../../../../src/auth/type/validatorTypeLogin";
import {IAuthValidationError} from "../../../../src/middleware/validation/validationSchemaBody";
import {typeRegisterDTO} from "../../../../src/auth/type/registerDTO";

let userRepository : Repository<User>
let userSessionRepository : Repository<UserSession>

beforeAll(async () => {
    const myDataSource = getDataSource()
    userRepository = myDataSource.getRepository(User)
    userSessionRepository = myDataSource.getRepository(UserSession)
})

vi.mock("../../../../src/auth/service/loginService.js", () => {
    const LoginService = vi.fn(function () {
        return {
            LogUser: vi.fn().mockResolvedValue({
                accessToken: "accessToken",
                refreshToken: "refreshToken",
                user: {
                    id: "20",
                    firstName: "tester",
                    lastName: "snippetAI",
                    email: "test@snippet.it",
                    password: "hashedpassword",
                    session: undefined
                } as User,
            } as typeResponseServiceLogin)
        }
    })

    return {LoginService}
})

describe("AUTH POST LOGIN", () => {

    describe("Validator", () => {

        beforeEach(async () => {

            await userRepository
                .createQueryBuilder()
                .delete()
                .from(User)
                .execute()

            await userSessionRepository
                .createQueryBuilder()
                .delete()
                .from(User)
                .execute()

            const register = await request(app)
                .post("/auth/register")
                .send(createUser({}))

            expect(register.status).equal(201)

        })

        it("request with undefined body", async () => {

            const responseErrorValidator = await request(app)
                .post("/auth/login")
                .send(undefined)

            expect(responseErrorValidator.status).equal(400)

            expect(responseErrorValidator.body.message).equal("Error - Invalid data input")

            /** with undefined body, expected for zod rules:
             *
             * Errors length 1 and default string
             *
             **/

            const bodyError = responseErrorValidator.body.errors
            expect(bodyError["path"].pop()).equal("Required");
        })

        it("request with empty body", async () => {

            const responseErrorValidator = await request(app)
                .post("/auth/login")
                .send({})

            expect(responseErrorValidator.status).equal(400)

            expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

            /** with empty body, expected for zod rules:
             *
             * Errors length n and default n string -- n is the number of path
             *
             **/

            const bodyError = responseErrorValidator.body.errors
            expect(Object.keys(bodyError).length).equal(2);

            expect(bodyError["email"].pop()).equal("Required");
            expect(bodyError["password"].pop()).equal("Required");
        })

        it("request with wrong type", async () => {

            const responseErrorWrongTypeValidator = await request(app)
            .post("/auth/login")
            .send(errorValidatorWrongTypeLogin)

            expect(responseErrorWrongTypeValidator.status).equal(400)

            const bodyErrorWrong = responseErrorWrongTypeValidator.body.errors
            expect(Object.keys(bodyErrorWrong).length).equal(2);

            const typeValidatorPathEmail = loginValidator.shape['email']._def.schema._def.typeName
            expect(bodyErrorWrong['email'].pop()).equal(`Expected ${zodTypeMap[typeValidatorPathEmail]}, received ${typeof errorValidatorWrongTypeLogin.email}`);

            const typeValidatorPathPassword = loginValidator.shape['password']._def.typeName
            expect(bodyErrorWrong['password'].pop()).equal(`Expected ${zodTypeMap[typeValidatorPathPassword]}, received ${typeof errorValidatorWrongTypeLogin.password}`)
        })

        it("request with wrong value", async () => {

            const responseErrorWrongValueValidator = await request(app)
                .post("/auth/login")
                .send(errorValidatorLogin)

            expect(responseErrorWrongValueValidator.status).equal(400)

            const bodyError : IAuthValidationError["errors"] = responseErrorWrongValueValidator.body.errors
            expect(Object.keys(bodyError).length).equal(2);

            /** prendiamo tutti gli errori verificatosi dal validator per email che ci asppettiamo **/
            const errorEmail = getChecks('email')

            expect(errorEmail.length).equal(2);
            expect(errorEmail.some(e => e.type === "min")).equal(true)
            expect(errorEmail.some(e => e.type === "custom")).equal(true)

            expect(bodyError.email!.every((value) => errorEmail.map(e => e.err).includes(value))).equal(true)

            /** password */
            const errorPassword = getChecks('password')

            expect(errorPassword.length).equal(3);
            expect(errorPassword.some(e => e.type === "min")).equal(true)
            expect(errorPassword.some(e => e.type === "regex")).equal(true)
            expect(errorPassword.some(e => (e.type !== "regex" && e.type !== "min"))).equal(false)

            expect(bodyError.password!.every((value) => errorPassword.map(e => e.err).includes(value)))

            /** verifichiamo che la sessione nel db sia vuota */
            const sessionUser = await userSessionRepository.find()
            expect(sessionUser.length).equal(0);

            const emailResponse = ["Email is required","Invalid email address"]
            const passwordResponse = ["Password is required with minimum 6 characters","One word must be uppercased","One ore more numbers must be on password"]

            expect(bodyError.email).to.deep.equal(emailResponse)
            expect(bodyError.password).to.deep.equal(passwordResponse)
        })
    })

    describe("DTO Response", () => {


        it("success response with hidden password", async () => {

            const responseUserSession = await request(app)
                .post("/auth/login")
                .send({
                    password: "UserTest20",
                    email: "user@test.com"
                })

            expect(responseUserSession.status).equal(200)

            const verifyDTOResponseUserSessione: typeResponseLoginAPI = responseUserSession.body
            expect(verifyDTOResponseUserSessione.message).equal("success")
            expect(verifyDTOResponseUserSessione.session).toMatchObject({
                accessToken: expect.any(String),
                refreshToken: expect.any(String),
                user: {
                    id: expect.any(String),
                    email: expect.any(String),
                    firstName: expect.any(String),
                    lastName: expect.any(String),
                } as typeRegisterDTO
            } as typeResponseServiceLogin)
        })
    })
})