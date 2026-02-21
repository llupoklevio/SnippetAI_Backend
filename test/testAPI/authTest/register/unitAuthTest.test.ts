import {beforeAll, afterAll, describe, it, expect} from "vitest"
import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {setup, teardown} from "../../../setup";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import request from "supertest";
import app from "../../../../src/app";
import {
    errorValidator,
    errorValidatorWrongType,
} from "./utilsRegisterTest";
import {registerValidator} from "../../../../src/auth/type/validatorTypeRegister";
import {
    IAuthValidationError
} from "../../../../src/middleware/validation/validationSchemaBody";

let userRepository : Repository<User>

beforeAll(async () => {
    await setup()
    const myDataSource = getDataSource()
    userRepository = myDataSource.getRepository(User)

})

afterAll(async () => {
    await teardown()
})

describe("SNIPPET API", () => {

    describe("POST register", () => {

        beforeAll(async () => {
            await userRepository
                .createQueryBuilder()
                .delete()
                .from(User)
                .execute()
        })

        it("request with undefined body", async () => {

            const responseErrorValidator = await request(app)
                .post("/auth/register")
                .send(undefined)

            expect(responseErrorValidator.status).equal(400);

            /** Messaggio di qualsiasi validator **/
            expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

            /** with undefined body, expected for zod rules:
             *
             * Errors length 1 and default string
             *
             **/

            const bodyError : IAuthValidationError["errors"] = responseErrorValidator.body.errors
            expect(Object.keys(bodyError).length).equal(1)
            const result = bodyError.undefined!
            expect(result[0]).equal("Invalid input: expected object, received undefined");
        })

        it("request with empty body", async () => {

            const responseErrorValidator = await request(app)
                .post("/auth/register")
                .send({})

            // console.log(responseErrorValidator.body)
            expect(responseErrorValidator.status).equal(400);

            /** Messaggio di qualsiasi validator **/
            expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

            /** with empty body, expected for zod rules:
             *
             * Errors length n and default n string -- n is the number of path
             *
             **/

            const bodyError : IAuthValidationError["errors"] = responseErrorValidator.body.errors
            expect(Object.keys(bodyError).length).equal(4);

            const typeValidatorPathFirstName = registerValidator.shape['firstName']._def.type
            expect(bodyError.firstName![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathFirstName}, received undefined`);

            const typeValidatorPathLastName = registerValidator.shape['lastName']._def.type
            expect(bodyError.lastName![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathLastName}, received undefined`);

            const typeValidatorPathPassword = registerValidator.shape['password']._def.type
            expect(bodyError.password![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathPassword}, received undefined`);

            const typeValidatorPathEmail = registerValidator.shape['email']._def.type
            expect(bodyError.email![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathEmail}, received undefined`);

        })


        it("request with wrong type", async () => {

            const responseErrorValidatorWrongType = await request(app)
                .post("/auth/register")
                .send(errorValidatorWrongType)

            expect(responseErrorValidatorWrongType.status).equal(400);

            const bodyErrorWrong : IAuthValidationError["errors"] = responseErrorValidatorWrongType.body.errors
            expect(Object.keys(bodyErrorWrong).length).equal(4);

            const typeValidatorPathFirstName = registerValidator.shape['firstName']._def.type
            expect(bodyErrorWrong.firstName![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathFirstName}, received ${typeof errorValidatorWrongType.firstName}`);

            const typeValidatorPathLastName = registerValidator.shape['lastName']._def.type
            expect(bodyErrorWrong.lastName![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathLastName}, received ${typeof errorValidatorWrongType.lastName}`);

            const typeValidatorPathPassword = registerValidator.shape['password']._def.type
            expect(bodyErrorWrong.password![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathPassword}, received ${typeof errorValidatorWrongType.password}`);

            const typeValidatorPathEmail = registerValidator.shape['email']._def.type
            expect(bodyErrorWrong.email![0]).to.deep.equal(`Invalid input: expected ${typeValidatorPathEmail}, received ${typeof errorValidatorWrongType.email}`);
        })


        it("request with wrong value", async () => {

            const responseErrorValidatorWrongVlue = await request(app)
                .post("/auth/register")
                .send(errorValidator)

            expect(responseErrorValidatorWrongVlue.status).equal(400);

            const bodyError : IAuthValidationError["errors"] = responseErrorValidatorWrongVlue.body.errors

            expect(Object.keys(bodyError).length).equal(4);

            /** prendiamo tutti gli errori verificatosi dal validator per firstName che ci asppettiamo **/
            const rulesValidatorPathFirstName = registerValidator.shape["firstName"]._def.checks
            const errorFirstName = rulesValidatorPathFirstName!.map((check) => {
                const def = (check as any)._zod.def
                return {type:def.check, err: def.error && def.error()}
            }).filter((err) => {
                return err.err
            })

            /** verifichiamo se gli errori previsti da noi coincidono con quelli restituiti dal validator **/
            expect(errorFirstName.length).equal(2);
            expect(errorFirstName.some(e => e.type === "min_length")).equal(true)
            expect(errorFirstName.some(e => e.type === "string_format")).equal(true)

            /** verifichiamo se la rispsota dell' API coincide con il validator **/
            expect(bodyError.firstName!.every((value) => errorFirstName.map(e => e.err).includes(value))).equal(true)

            /** verifichiamo che il db sia vuoto **/

            /** verifichiamo che lo swagger coincida con le risposte previste **/
        })

    })
})

