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

import { createAgent, tool } from "langchain";

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
        const itAI = AI_TESTS ? describe : describe.skip

        itAI("AI TEST - Auth Operation", async () => {



            const agentTesterE2E = createAgent({
                model: "gpt-4.1"
            })
        })

    })
})