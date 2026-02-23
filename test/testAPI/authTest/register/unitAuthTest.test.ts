import {beforeAll, afterAll, describe, it, expect, vi} from "vitest"
import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {setup, teardown} from "../../../setup";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import request from "supertest";
import app from "../../../../src/app";
import {
    createUser,
    errorValidator,
    errorValidatorWrongType, getChecks, zodTypeMap,
} from "./utilsRegisterTest";
import {registerValidator} from "../../../../src/auth/type/validatorTypeRegister";
import {
    IAuthValidationError
} from "../../../../src/middleware/validation/validationSchemaBody";
import {typeResponseRegisterSuccess} from "../../../../src/auth/type/registerDTO";

let userRepository : Repository<User>

beforeAll(async () => {
    await setup()
    const myDataSource = getDataSource()
    userRepository = myDataSource.getRepository(User)

})

afterAll(async () => {
    await teardown()
})

vi.mock("../../../../src/auth/service/userService.js", () => {
    const UserService = vi.fn(function() {
        return {
            registerUserDB: vi.fn().mockResolvedValue({
                id: "123",
                firstName: "tester",
                lastName: "snippetAI",
                email: "test@snippet.it",
                password: "hashedpassword"
            })
        };
    });
    return { UserService };
});



describe("AUTH API CONTROLLER", () => {

    describe("POST register", () => {

        describe("Validator", () => {

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

                const bodyError = responseErrorValidator.body.errors
                expect(bodyError["path"].pop()).equal("Required");
            })

            it("request with empty body", async () => {

                const responseErrorValidator = await request(app)
                    .post("/auth/register")
                    .send({})

                expect(responseErrorValidator.status).equal(400);

                /** Messaggio di qualsiasi validator **/
                expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

                /** with empty body, expected for zod rules:
                 *
                 * Errors length n and default n string -- n is the number of path
                 *
                 **/

                const bodyError = responseErrorValidator.body.errors
                expect(Object.keys(bodyError).length).equal(4);

                expect(bodyError["firstName"].pop()).equal("Required");
                expect(bodyError["lastName"].pop()).equal("Required");
                expect(bodyError["email"].pop()).equal("Required");
                expect(bodyError["password"].pop()).equal("Required");

            })


            it("request with wrong type", async () => {

                const responseErrorValidatorWrongType = await request(app)
                    .post("/auth/register")
                    .send(errorValidatorWrongType)

                expect(responseErrorValidatorWrongType.status).equal(400);

                const bodyErrorWrong = responseErrorValidatorWrongType.body.errors
                expect(Object.keys(bodyErrorWrong).length).equal(4);


                const typeValidatorPathFirstName = registerValidator.shape['firstName']._def.typeName
                expect(bodyErrorWrong["firstName"].pop()).equal(`Expected ${zodTypeMap[typeValidatorPathFirstName]}, received ${typeof errorValidatorWrongType.firstName}`);

                const typeValidatorPathLastName = registerValidator.shape['lastName']._def.typeName
                expect(bodyErrorWrong["lastName"].pop()).equal(`Expected ${zodTypeMap[typeValidatorPathLastName]}, received ${typeof errorValidatorWrongType.lastName}`);

                const typeValidatorPathEmail = registerValidator.shape['email']._def.schema._def.typeName
                expect(bodyErrorWrong["email"].pop()).equal(`Expected ${zodTypeMap[typeValidatorPathEmail]}, received ${typeof errorValidatorWrongType.email}`);

                const typeValidatorPathPassword = registerValidator.shape['password']._def.typeName
                expect(bodyErrorWrong["password"].pop()).equal(`Expected ${zodTypeMap[typeValidatorPathPassword]}, received ${typeof errorValidatorWrongType.password}`);

            })


            it("request with wrong value", async () => {

                const responseErrorValidatorWrongVlue = await request(app)
                    .post("/auth/register")
                    .send(errorValidator)

                expect(responseErrorValidatorWrongVlue.status).equal(400);

                const bodyError : IAuthValidationError["errors"] = responseErrorValidatorWrongVlue.body.errors
                expect(Object.keys(bodyError).length).equal(4);

                /** prendiamo tutti gli errori verificatosi dal validator per firstName che ci asppettiamo **/
                const errorFirstName = getChecks('firstName')

                /** verifichiamo se gli errori previsti da noi coincidono con quelli restituiti dal validator **/
                expect(errorFirstName.length).equal(2);
                expect(errorFirstName.some(e => e.type === "min")).equal(true)
                expect(errorFirstName.some(e => e.type === "regex")).equal(true)

                /** verifichiamo se la rispsota dell' API coincide con il validator **/
                expect(bodyError.firstName!.every((value) => errorFirstName.map(e => e.err).includes(value))).equal(true)

                /** lastName **/
                const errorLastName = getChecks('lastName')
                expect(errorLastName.length).equal(2);
                expect(errorLastName.some(e => e.type === "min")).equal(true)
                expect(errorLastName.some(e => e.type === "regex")).equal(true)

                expect(bodyError.lastName!.every((value) => errorLastName.map(e => e.err).includes(value))).equal(true)

                /** email **/
                const errorEmail = getChecks('email')

                expect(errorEmail.length).equal(2);
                expect(errorEmail.some(e => e.type === "min")).equal(true)
                expect(errorEmail.some(e => e.type === "custom")).equal(true)

                expect(bodyError.email!.every((value) => errorEmail.map(e => e.err).includes(value))).equal(true)

                /** password **/
                const errorPassword = getChecks('password')

                expect(errorPassword.length).equal(3);
                expect(errorPassword.some(e => e.type === "min")).equal(true)
                expect(errorPassword.some(e => e.type === "regex")).equal(true)
                expect(errorPassword.some(e => (e.type !== "regex" && e.type !== "min"))).equal(false)

                expect(bodyError.password!.every((value) => errorPassword.map(e => e.err).includes(value)))

                /** verifichiamo che il db sia vuoto **/
                const user = await userRepository.find()
                expect(user.length).equal(0);

                /** verifichiamo che lo swagger coincida con le risposte previste **/
                const firstNameResponse = ["First name is required", "Only words"]
                const lastNameResponse = ["Last name is required","Only words"]
                const emailResponse = ["Email is required","Invalid email address"]
                const passwordResponse = ["Password is required with minimum 6 characters","One word must be uppercased","One ore more numbers must be on password"]

                expect(bodyError.firstName).to.deep.equal(firstNameResponse)
                expect(bodyError.lastName).to.deep.equal(lastNameResponse)
                expect(bodyError.email).to.deep.equal(emailResponse)
                expect(bodyError.password).to.deep.equal(passwordResponse)
            })
        })

        describe("DTO Response", () => {

            it("success response with hidden password", async () => {

                /** testa creando lo user.
                 * Regole di creazione scritte nel metodo
                 */

                const user = createUser({
                    firstName: "tester",
                    lastName: "snippetAI",
                    email: "test@snippet.it",
                    password: "Snippet20",
                })

                const responseUser = await request(app)
                   .post("/auth/register")
                   .send(user)

                expect(responseUser.status).equal(200);

                /** user creato con successo , verifichiamo solo il controller*/
                const userResponseBody : typeResponseRegisterSuccess = responseUser.body
                expect(userResponseBody.user).toStrictEqual({
                    id: expect.any(String),
                    email: expect.any(String),
                    firstName: expect.any(String),
                    lastName: expect.any(String),
                })

            })

        })


    })
})

