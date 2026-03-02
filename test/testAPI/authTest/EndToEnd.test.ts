import {Repository} from "typeorm";
import {User} from "../../../src/entities/postgres/user.entity";
import {UserSession} from "../../../src/entities/postgres/userSession";
import {beforeAll, describe, it, expect, beforeEach} from "vitest";
import {getDataSource} from "../../../src/type/data-source/getDataSourceByEnv";
import app from "../../../src/app";
import request from "supertest";
import {IregisterValidator} from "../../../src/auth/type/validatorTypeRegister";
import {typeLoginValidator} from "../../../src/auth/type/validatorTypeLogin";
import jwt from "jsonwebtoken";

import { createAgent, tool, toolStrategy } from "langchain";
import {z} from "zod";

let userRepository: Repository<User>
let userSessionRepository : Repository<UserSession>

beforeAll(async () => {
    const myDataSource = getDataSource();

    userRepository = myDataSource.getRepository(User);
    userSessionRepository = myDataSource.getRepository(UserSession)
})

describe("E2E AUTH", () => {

    describe("Human Test - Auth Operation", () => {

        beforeEach(async () => {

            await userSessionRepository
                .createQueryBuilder()
                .delete()
                .from(UserSession)
                .execute()

            await userRepository
                .createQueryBuilder()
                .delete()
                .from(User)
                .execute()
        })

        it("expired token", async () => {

            /** l'utente prova a registrarsi */

            const user = await request(app)
                .post("/auth/register")
                .send({
                    firstName: "Test",
                    lastName: "E2E",
                    email: "Test@gmail.com",
                    password: "12345",
                } as IregisterValidator)

            expect(user.status).equal(400)
            expect(user.body.message).equal("Error - Invalid data input")

            const bodyErrorUserRegister = user.body.errors
            expect(Object.keys(bodyErrorUserRegister)).to.deep.equal(["lastName","password"]);

            expect(bodyErrorUserRegister["lastName"]).to.deep.equal(["Only words"])
            expect(bodyErrorUserRegister["password"]).to.deep.equal(["Password is required with minimum 6 characters","One word must be uppercased"])

            /** l'utente si registra */

            const userSuccess = await request(app)
                .post("/auth/register")
                .send({
                    firstName: "Test",
                    lastName: "ETwoE",
                    email: "Test@gmail.com",
                    password: "E12345E",
                } as IregisterValidator)

            expect(userSuccess.status).equal(201)

            /** l'utente si logga */

            const userLoggedSuccess = await request(app)
                .post("/auth/login")
                .send({
                    email: "Test@gmail.com",
                    password: "E12345E",
                } as typeLoginValidator)

            expect(userLoggedSuccess.status).equal(200)

            const expiredAccessToken = jwt.sign(
                { idUser: userLoggedSuccess.body.session.user.id, email: "Test@gmail.com" },
                process.env.SECRET_JWT!,
                { expiresIn: "1ms" }
            );

            await new Promise(r => setTimeout(r, 200));

            const response = await request(app)
                .get("/auth/refresh")
                .set("Authorization", `Bearer ${expiredAccessToken}`);

            expect(response.status).toBe(400);
            expect(response.body.type).equal("BusinessLogic")
            expect(response.body.message).equal("jwt expired")


            const successResponse = await request(app)
                .get("/auth/refresh")
                .set("Authorization", `Bearer ${userLoggedSuccess.body.session.refreshToken}`);

            expect(successResponse.status).equal(200);
            expect(successResponse.body.message).equal("success");
        })

        const AI_TESTS = process.env.AI_TESTS === "true"
        const itAI = AI_TESTS ? it : it.skip

        itAI("AI TEST - Auth Operation", async () => {

            const ResponseAPI = z.object({
                scenarios: z.array(z.object({
                    step: z.number(),
                    operation: z.string().describe("nome operazione es: register, login, refresh"),
                    status: z.number().describe("HTTP status code"),
                    body: z.unknown().describe("parsed JSON response body"),
                    passed: z.boolean(),
                    comment: z.string()
                })).describe("TUTTI gli scenari testati, uno per ogni tool chiamato"),
                overallComment: z.string().describe("commento generale su tutti i test")
            });

            const registerAPI = tool(
                async ({ firstName, lastName, email, password }) => {
                    const res = await request(app)
                        .post("/auth/register")
                        .send({ firstName, lastName, email, password });
                    return JSON.stringify({ status: res.status, body: res.body });
                },
                {
                    name: "registerAPI",
                    description: "API per registrare un utente",
                    schema: z.object({
                        firstName: z.string(),
                        lastName: z.string(),
                        email: z.string(),
                        password: z.string()
                    }),
                }
            );

            const loginAPI = tool(
                async ({ email, password }) => {
                    const res = await request(app)
                        .post("/auth/login")
                        .send({ email, password });
                    return JSON.stringify({ status: res.status, body: res.body });
                },
                {
                    name: "loginAPI",
                    description: "API per loggare un utente",
                    schema: z.object({
                        email: z.string(),
                        password: z.string()
                    }),
                }
            );

            const refreshAPI = tool(
                async ({ refreshToken }) => {
                    const res = await request(app)
                        .get("/auth/refresh")
                        .set("Authorization", `Bearer ${refreshToken}`);
                    return JSON.stringify({ status: res.status, body: res.body });
                },
                {
                    name: "refreshAPI",
                    description: `API per ottenere un nuovo accessToken. 
            IMPORTANTE: prendi il refreshToken dalla risposta del login -> body.session.refreshToken
            e passalo qui come parametro`,
                    schema: z.object({
                        refreshToken: z.string().describe("Il refreshToken ottenuto dalla risposta del login (body.session.refreshToken)")
                    }),
                }
            );

            const agentTesterE2E = createAgent({
                model:"gpt-4.1",
                tools: [registerAPI,loginAPI,refreshAPI],
                responseFormat: toolStrategy(ResponseAPI)
            });

            const result = await agentTesterE2E.invoke({
                messages: [{
                    role: "user",
                    content: `Sei un tester E2E. Esegui OBBLIGATORIAMENTE tutti questi scenari in ordine:

                        1. Registra un utente con dati validi (inventa dati italiani) -> deve tornare 201
                        2. Prova a registrare lo stesso utente di nuovo -> deve tornare 409
                        3. Prova a registrare un utente con dati invalidi (password senza uppercase, lastName con numeri) -> deve tornare 400
                        4. Logga l'utente registrato al punto 1 -> deve tornare 200
                        5. Usa il refreshToken dalla risposta del login (body.session.refreshToken) per ottenere un nuovo accessToken -> deve tornare 200
                        6. Prova il refresh con un token inventato/invalido -> deve tornare 400
                
                        Per ogni step chiama il tool corrispondente e annota status e risultato.
                        Alla fine commenta tutti i risultati ottenuti.`
                }],
            });

            console.log(result.structuredResponse);
        },30_000)

    })
})