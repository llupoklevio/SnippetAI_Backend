import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import request from "supertest";
import app from "../../../../src/app";
import {createUser, defaultUser} from "../utilsAuthTest";
import jwt from 'jsonwebtoken';
import {DateTime} from "luxon";
import {getModelAI} from "../../../../src/AI/model";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {SchemaAuthLogin} from "../../../../src/auth/swagger/registerSchema";
import {loginAuth} from "../../../../src/auth/swagger/registerDefinition";
import z from "zod";

let userRepository : Repository<User>
let userSessionRepository : Repository<UserSession>

beforeAll(async () => {
    const myDataSource = getDataSource()

    userRepository = myDataSource.getRepository(User)
    userSessionRepository = myDataSource.getRepository(UserSession)
})

describe("AUTH API LOGIN INTEGRATION", () => {

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

        const register = await request(app)
            .post("/auth/register")
            .send(createUser({}))

        expect(register.status).equal(201)
    })

    it("success", async () => {

        const userLogged = await request(app)
            .post("/auth/login")
            .send(createUser({}))

        expect(userLogged.status).equal(200)

        /** Verifichiamo i dati salvati nel db:
         * - FK User
         * - Refresh Token
         * - Expired date e se coincide con quello del token
         * */

         const userSession = (await userSessionRepository.findOne({
            where: {
                id: userLogged.body.id,
            },
            relations: ["user"],
        }))!

        expect(userSession.refreshToken).toBeTypeOf("string")
        expect(userSession.id).toBeTypeOf("string")
        expect(userSession.expiresAt).toBeTypeOf("object")
        expect(userSession.user).toBeInstanceOf(User);

        const token = jwt.decode(userSession.refreshToken)!;

        // @ts-ignore
        const expDate = DateTime.fromSeconds(token.exp).set({ millisecond: 0 }).toJSDate();
        const sessionExp = DateTime.fromJSDate(userSession.expiresAt).set({ millisecond: 0 }).toJSDate();

        expect(expDate.getTime()).toBe(sessionExp.getTime());

        /** Verifichiamo la logica
         * - Se la sessione coincide con lo user giusto
         * */

        expect(userSession.user.email).equal(defaultUser.email)
        expect(userSession.user.firstName).equal(defaultUser.firstName)
        expect(userSession.user.lastName).equal(defaultUser.lastName)
    })

    const AI_TESTS = process.env.AI_TESTS === "true"
    const itAI = AI_TESTS ? it: it.skip

    itAI("Edge check AI", async () => {

        const model = getModelAI()
        if (!model) {
            console.error("Ai is not available")
            return
        }

        const modelWithStructuredResponse = model.withStructuredOutput(
            z.object({
                scenarios: z.array(z.object({
                    description: z.string(),
                    body: z.unknown(),
                }))
            }),
            {method: "functionCalling"}
        )

        const contract = loginAuth({
            path: "/auth/login",
            summary: "login a user",
            send: SchemaAuthLogin.Send,
            response: SchemaAuthLogin.Response,
            validator: SchemaAuthLogin.Validator,
            error404: SchemaAuthLogin.ErrorNotFound,
            error500: SchemaAuthLogin.ServerError
        })

        const context = [
            new SystemMessage(`Sei un senior QA engineer.
                                           Contratto dell'endpoint:
                                           ${JSON.stringify(contract, null, 2)}
                                           Genera scenari edge case che un tester umano non prevederebbe. 
                                           Dammi solo strutture javascript come ${SchemaAuthLogin.Send}`),
            new HumanMessage("Genera 10 scenari.")
        ]

        const result = await modelWithStructuredResponse.invoke(context)

        for (const scenario of result.scenarios) {
            if (typeof scenario.body !== 'object' || scenario.body === null) continue

            const res = await request(app)
                .post("/auth/login")
                .send(scenario.body)

            /** Il server non crasha mai */
            expect(res.status).not.equal(500)

            expect([200, 201, 400, 409].includes(res.status)).equal(true)

            console.log(result)

        }
    },30_000)
})