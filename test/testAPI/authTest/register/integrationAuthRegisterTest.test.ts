import {describe, it, expect, beforeAll, afterAll,beforeEach} from "vitest"
import {User} from "../../../../src/entities/postgres/user.entity";
import {Repository} from "typeorm";
import {setup, teardown} from "../../../setup";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import request from "supertest";
import app from "../../../../src/app";
import {createUser} from "./utilsRegisterTest";
import * as argon2 from "argon2";

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
            expect(failureResponse.body.message).deep.equal("Risorsa già esistente (duplicato).")
        })

})

