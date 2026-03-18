import {beforeAll, describe, expect, it, vi} from "vitest"
import request from "supertest";
import app from "../../../../src/app";
import {
    baseData,
    baseWrongData,
    baseWrongDataError,
    createSnippet,
    generateTestToken,
    getChecks,
    typeSnippetService
} from "../utilsSnippetTest";
import {createSnippetValidator, DescAIValidator} from "../../../../src/snippet/type/validatorPostSnippet";
import {defaultUser, zodTypeMap} from "../../authTest/utilsAuthTest";
import {IAuthValidationError} from "../../../../src/middleware/validation/validationSchemaBody";
import {getContainer} from "../../../../src/ContainerAwilix/CompositionRoot";
import {asValue} from "awilix";
import {SnippetService} from "../../../../src/snippet/service/snippetService";
import {
    IResponseSnippet,
    typeResponseAPIPostSnippetDescAI,
    typeResponseControllerSnippet
} from "../../../../src/snippet/type/responseSnippet";
import {Snippet} from "../../../../src/entities/postgres/snippet.entity";
import {DateTime} from "luxon";

const mockCreateSnippet = vi.fn()
const mockGetSnippets = vi.fn()
const mockGetSingleSnippet = vi.fn()
const mockAddDescriptionAI = vi.fn()

beforeAll(async () => {
    getContainer().register({
        snippetService: asValue({
            createSnippet: mockCreateSnippet,
            snippetRepository: vi.fn() as any,
            userRepository: vi.fn() as any,
            RAGSnippetQueue: vi.fn() as any,
            DescriptionAIQueue: vi.fn() as any,
            getSnippets: mockGetSnippets,
            addDescriptionAI: mockAddDescriptionAI,
            getSingleSnippet: mockGetSingleSnippet
        } as unknown as SnippetService),
    })
})

describe("SNIPPET API", () => {

    describe("Validator", () => {

        it("Error validator with undefined body", async () => {

            const responseErrorValidator = await request(app)
                .post("/snippets")
                .set("Authorization", `Bearer ${generateTestToken()}`)
                .send(undefined)

            expect(responseErrorValidator.status).equal(400)

            /** Messaggio di qualsiasi validator **/
            expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

            const bodyError = responseErrorValidator.body.errors
            expect(bodyError["path"].pop()).equal("Required");
        })

        it("request with empty body", async () => {
            const responseErrorValidator = await request(app)
                .post("/snippets")
                .set("Authorization", `Bearer ${generateTestToken()}`)
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
            expect(Object.keys(bodyError).length).equal(2);

            expect(bodyError["title"].pop()).equal("Required");
            expect(bodyError["code"].pop()).equal("Required");
        })

        it("request with wrong type", async () => {

            const responseErrorValidator = await request(app)
                .post("/snippets")
                .set("Authorization", `Bearer ${generateTestToken()}`)
                .send(baseWrongData)

            expect(responseErrorValidator.status).equal(400);

            const bodyError = responseErrorValidator.body.errors
            expect(Object.keys(bodyError).length).equal(3);

            const typeValidatorPathTitle = createSnippetValidator.shape['title']._def.typeName
            expect(bodyError["title"].pop()).equal(`Expected ${zodTypeMap[typeValidatorPathTitle]}, received ${typeof baseWrongData.title}`);

            const typeValidatorCode = createSnippetValidator.shape['code']._def.typeName
            expect(bodyError["code"].pop()).equal(`Expected ${zodTypeMap[typeValidatorCode]}, received ${typeof baseWrongData.code}`);

            const typeValidatorDescription = createSnippetValidator.shape['description'].unwrap()._def.typeName
            expect(bodyError["description"].pop()).equal(`Expected ${zodTypeMap[typeValidatorDescription]}, received ${typeof baseWrongData.description}`);
        })

        it("request with wrong value", async () => {

            const responseErrorValidator = await request(app)
                .post("/snippets")
                .set("Authorization", `Bearer ${generateTestToken()}`)
                .send(baseWrongDataError)

            expect(responseErrorValidator.status).equal(400);

            const bodyError : IAuthValidationError["errors"] = responseErrorValidator.body.errors;
            expect(Object.keys(bodyError).length).equal(3);

            const errorTitle = getChecks('title')
            expect(errorTitle.length).equal(1);
            expect(errorTitle.some(e => e.type === "min")).equal(true);

            const errorCode = getChecks('code')
            expect(errorCode.length).equal(1);
            expect(errorCode.some(e => e.type === "min")).equal(true);

            const errorDescription = getChecks('description')
            expect(errorDescription.length).equal(1);
            expect(errorDescription.some(e => e.type === "min")).equal(true);
        })
    })

    describe("Response with worker RAG", () => {

        beforeAll(async () => {

            mockCreateSnippet.mockResolvedValue({
                snippet: {
                    code: baseData.code,
                    description: baseData.description,
                    title: baseData.title,
                    snippetOwner: {
                        id: "123",
                        firstName: "tester",
                        lastName: "snippetAI",
                        email: defaultUser.email,
                        password: "hashedpassword"
                    },
                    id: 1,
                    dateCreation: new Date(),
                    dateUpdate: new Date()
                },
                operation: "RAG"
            } as typeSnippetService)
            })

            it("success", async () => {

                const responseCreateSnippet = await request(app)
                    .post("/snippets")
                    .set("Authorization", `Bearer ${generateTestToken()}`)
                    .send(createSnippet())

                expect(responseCreateSnippet.status).equal(200)

                const responseSnippet : typeResponseControllerSnippet = responseCreateSnippet.body
                expect(responseSnippet.message).equal("RAG")

                expect(responseSnippet.snippet.snippetOwner.email).equal(defaultUser.email)
                expect(responseSnippet.snippet.snippetOwner.id).equal("123")
                expect((responseSnippet.snippet.snippetOwner as any).password).equal(undefined)

                expect(responseSnippet.snippet.title).equal(baseData.title)
                expect(responseSnippet.snippet.code).equal(baseData.code)
                expect(responseSnippet.snippet.description).equal(baseData.description)

            })
    })

    describe("Response with worker Description", () => {

        beforeAll(async () => {

            mockCreateSnippet.mockResolvedValue({
                snippet: {
                    code: baseData.code,
                    description: null,
                    title: baseData.title,
                    snippetOwner: {
                        id: "123",
                        firstName: "tester",
                        lastName: "snippetAI",
                        email: defaultUser.email,
                        password: "hashedpassword"
                    },
                    id: 1,
                    dateCreation: new Date(),
                    dateUpdate: new Date()
                },
                operation: "DESCRIPTIONAI"
            } as typeSnippetService)
        })

        it("success", async () => {

            const responseCreateSnippet = await request(app)
                .post("/snippets")
                .set("Authorization", `Bearer ${generateTestToken()}`)
                .send(createSnippet())

            expect(responseCreateSnippet.status).equal(200)

            const responseSnippet : typeResponseControllerSnippet = responseCreateSnippet.body
            expect(responseSnippet.message).equal("DESCRIPTIONAI")

            expect(responseSnippet.snippet.snippetOwner.email).equal(defaultUser.email)
            expect(responseSnippet.snippet.snippetOwner.id).equal("123")
            expect((responseSnippet.snippet.snippetOwner as any).password).equal(undefined)

            expect(responseSnippet.snippet.title).equal(baseData.title)
            expect(responseSnippet.snippet.code).equal(baseData.code)
            expect(responseSnippet.snippet.description).equal(null)

        })
    })

    describe("Get Snippets", () => {

        describe("Controller ", () => {

            it("no token send", async () => {

                const responseGetSnippet = await request(app)
                    .get("/snippets")

                expect(responseGetSnippet.status).equal(400)
                expect(responseGetSnippet.body.message).equal("No authorization token was found")
            })

            it("response", async () => {

                mockGetSnippets.mockResolvedValue([{
                    code: baseData.code,
                    description: baseData.description,
                    title: baseData.title,
                    snippetOwner: {
                        id: "123",
                        firstName: "tester",
                        lastName: "snippetAI",
                        email: defaultUser.email,
                        password: "hashedpassword"
                    },
                    id: 1,
                    dateCreation: new Date(),
                    dateUpdate: new Date()
                }] as Snippet[])

                const responseGetSnippet = await request(app)
                    .get("/snippets")
                    .set("Authorization", `Bearer ${generateTestToken()}`)

                expect(responseGetSnippet.status).equal(200)
                expect(responseGetSnippet.body.snippets).toMatchObject([
                    {
                        id: 1,
                        code: baseData.code,
                        description: baseData.description,
                        title: baseData.title,
                    }
                ])
                expect(responseGetSnippet.body.snippets.snippetOwner?.password).equal(undefined)
            })

        })

    })

    describe("Get Single Snippets", () => {

        it("validator params error", async () => {

            const response = await request(app)
                .get(`/snippets/test`)
                .set("Authorization", `Bearer ${generateTestToken()}`)

            expect(response.status).equal(400)
            expect(response.body[0].error).equal("is not number")

            const responseNegative = await request(app)
                .get(`/snippets/${-20}`)
                .set("Authorization", `Bearer ${generateTestToken()}`)

            expect(responseNegative.status).equal(400)
            expect(responseNegative.body[0].error).equal("is not positive")

        })

        it("jwt", async () => {
            const response = await request(app)
            .get(`/snippets/${1}`)

            expect(response.status).equal(400)
            expect(response.status).equal(400)
            expect(response.body.message).equal("No authorization token was found")
        })

        it("response", async () => {

            mockGetSingleSnippet.mockResolvedValue({
                id: 1,
                title: baseData.title,
                code: baseData.code,
                description: baseData.description,
                dateUpdate: DateTime.now().toJSDate(),
                dateCreation: DateTime.now().toJSDate(),
                snippetOwner: {
                    id: "123",
                    personalSnippets: undefined,
                    session: undefined,
                    firstName: defaultUser.firstName,
                    lastName: defaultUser.lastName,
                    email: defaultUser.email,
                    password: defaultUser.password,
                }
            } as Snippet)

            const response = await request(app)
                .get(`/snippets/${1}`)
                .set("Authorization", `Bearer ${generateTestToken()}`)


            expect(response.status).equal(200)
            expect(typeof response.body).equal("object")
            expect(response.body.snippet).to.not.equal(undefined)
            expect(response.body.snippet).to.not.equal(null)

            const responseBody : IResponseSnippet = response.body.snippet
            expect(responseBody.code).equal(baseData.code)
            expect(responseBody.description).equal(baseData.description)
            expect(responseBody.snippetOwner.email).equal(defaultUser.email)
            expect((responseBody.snippetOwner as any).password).to.be.equal(undefined)
        })
    })

    describe("Add Snippets with description", () => {

        it("validator params error", async () => {

            const response = await request(app)
                .post(`/snippets/test/saveDescAI`)
                .set("Authorization", `Bearer ${generateTestToken()}`)

            console.log(response,"###########")

            expect(response.status).equal(400)
            expect(response.body[0].error).equal("is not number")


            const responseNegative = await request(app)
                .post(`/snippets/-20/saveDescAI`)
                .set("Authorization", `Bearer ${generateTestToken()}`)

            expect(responseNegative.status).equal(400)
            expect(responseNegative.body[0].error).equal("is not positive")
        })


        describe("validator body error", async () => {

            it("validator body error not send", async () => {

                const responseErrorValidator = await request(app)
                    .post(`/snippets/1/saveDescAI`)
                    .set("Authorization", `Bearer ${generateTestToken()}`)

                expect(responseErrorValidator.status).equal(400)

                expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

                const bodyError = responseErrorValidator.body.errors
                expect(bodyError["path"].pop()).equal("Required");
            })

            it("validator body error empty", async () => {

                const responseErrorValidator = await request(app)
                    .post(`/snippets/1/saveDescAI`)
                    .set("Authorization", `Bearer ${generateTestToken()}`)
                    .send({})

                expect(responseErrorValidator.status).equal(400)

                expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

                const bodyError = responseErrorValidator.body.errors
                expect(Object.keys(bodyError).length).equal(1);

                expect(bodyError["description"].pop()).equal("Required");
            })

            it("validator body error wrong type", async () => {

                const responseErrorValidator = await request(app)
                    .post(`/snippets/1/saveDescAI`)
                    .set("Authorization", `Bearer ${generateTestToken()}`)
                    .send({
                        description: 20,
                    })

                expect(responseErrorValidator.status).equal(400)
                expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

                const bodyError = responseErrorValidator.body.errors
                expect(Object.keys(bodyError).length).equal(1);

                const typeValidatorDescription = DescAIValidator.shape['description']._def.typeName
                expect(bodyError["description"].pop()).equal(`Expected ${zodTypeMap[typeValidatorDescription]}, received ${typeof baseWrongData.description}`);

            })

            it("validator body error wrong value", async () => {

                const responseErrorValidator = await request(app)
                    .post(`/snippets/1/saveDescAI`)
                    .set("Authorization", `Bearer ${generateTestToken()}`)
                    .send({
                        description: "description",
                    })

                expect(responseErrorValidator.status).equal(400)
                expect(responseErrorValidator.body.message).equal("Error - Invalid data input");

                const bodyError = responseErrorValidator.body.errors
                expect(Object.keys(bodyError).length).equal(1);

                const errorDescription = getChecks('description')
                expect(errorDescription.length).equal(1);
                expect(errorDescription.some(e => e.type === "min")).equal(true);
            })

        })

        it("success", async () => {

            mockAddDescriptionAI.mockResolvedValue({
                description: baseData.description,
                title: baseData.title,
                code: baseData.code,
                id:1,
                dateCreation: DateTime.now().toJSDate(),
                dateUpdate: DateTime.now().toJSDate(),
                snippetOwner: {
                    id: "1",
                    firstName: defaultUser.firstName,
                    lastName: defaultUser.lastName,
                    email: defaultUser.email,
                    password: "hashed",
                    session: undefined,
                    personalSnippets: undefined,
                }
            } as Snippet)

            const response = await request(app)
                .post(`/snippets/1/saveDescAI`)
                .set("Authorization", `Bearer ${generateTestToken()}`)
                .send({
                    description: baseData.description,
                })

            expect(response.status).equal(200)

            const responseSnippet : typeResponseAPIPostSnippetDescAI = response.body

            expect(responseSnippet.snippet.snippetOwner.email).equal(defaultUser.email)
            expect(responseSnippet.snippet.snippetOwner.id).equal("1")
            expect((responseSnippet.snippet.snippetOwner as any).password).equal(undefined)

            expect(responseSnippet.snippet.title).equal(baseData.title)
            expect(responseSnippet.snippet.code).equal(baseData.code)
            expect(responseSnippet.snippet.description).equal(baseData.description)
        })


    })
})