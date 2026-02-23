import {describe, it, expect, beforeAll, afterAll,beforeEach} from "vitest"
import {User} from "../../../../src/entities/postgres/user.entity";
import {Repository} from "typeorm";
import {setup, teardown} from "../../../setup";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import request from "supertest";
import app from "../../../../src/app";
import {createUser} from "./utilsRegisterTest";
import * as argon2 from "argon2";
import {getModelAI} from "../../../../src/AI/model";
import {HumanMessage, SystemMessage} from "@langchain/core/messages";
import {registerAuth} from "../../../../src/auth/swagger/registerDefinition";
import {SchemaAuthRegister} from "../../../../src/auth/swagger/registerSchema";
import {z} from "zod";
import {authLimiterStore} from "../../../../src/RateLimiting/rate";

let userRepository : Repository<User>

beforeAll(async () => {
    await setup()
    const myDataSource = getDataSource()
    userRepository = myDataSource.getRepository(User)

})

afterAll(async () => {
    await userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
        .execute()

    await teardown()
})

describe("AUTH API INTEGRATION", () => {

    beforeEach(async () => {
        await userRepository
            .createQueryBuilder()
            .delete()
            .from(User)
            .execute()

        await authLimiterStore.resetAll()
    })

        it("success", async () => {

            const user = createUser({})

            const successResponse = await request(app)
                .post("/auth/register")
                .send(user)


            expect(successResponse.status).equal(201)

            /** controllaimo che il db abbia salvato la password in formato hash */
            const responseUserDB = (await userRepository.findOneBy({id: successResponse.body.user.id}))!
            expect(await argon2.verify(responseUserDB.password, user.password)).equal(true);

            /** verifica per vedere se id è un UUID*/
            expect(successResponse.body.user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        })

        it("should return 409 if email was already exist", async () => {
            const user = createUser({})

            const successResponse = await request(app)
                .post("/auth/register")
                .send(user)

            expect(successResponse.status).equal(201)

            const failureResponse = await request(app)
            .post("/auth/register")
            .send(user)

            expect(failureResponse.status).equal(409)
            expect(failureResponse.body.message).deep.equal("L'email è già registrata")
        })



})

const AI_TESTS = process.env.AI_TESTS === "true"
const describeAI = AI_TESTS ? describe : describe.skip

describeAI("AUTH API AI INTEGRATION", () => {
    it("edge AI check", async () => {
        await authLimiterStore.resetAll()

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

        const contract = registerAuth({
            path: "/auth/register",
            summary: "Register a new user",
            send: SchemaAuthRegister.Send,
            response: SchemaAuthRegister.Response,
            validator: SchemaAuthRegister.Validator,
            error409: SchemaAuthRegister.ErrorDuplicated,
            error500: SchemaAuthRegister.ServerError,
        })

        const context = [
            new SystemMessage(`Sei un senior QA engineer.
                                           Contratto dell'endpoint:
                                           ${JSON.stringify(contract, null, 2)}
                                           Genera scenari edge case che un tester umano non prevederebbe. 
                                           Dammi solo strutture javascript come ${SchemaAuthRegister.Send}`),
            new HumanMessage("Genera 10 scenari.")
        ]

        const result = await modelWithStructuredResponse.invoke(context)

        for (const scenario of result.scenarios) {
            console.log(scenario.body, "----", scenario.description)
            const res = await request(app)
                .post("/auth/register")
                .send(scenario.body)

            console.log(res.body, res.status)
            /** Il server non crasha mai */
            expect(res.status).not.equal(500)

            expect([200, 201, 400, 409].includes(res.status)).equal(true)

        }


    }, 30_000)
})

