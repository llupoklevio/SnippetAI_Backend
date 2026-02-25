import {beforeAll, describe, it, beforeEach, expect} from "vitest"
import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import {createUser} from "../utilsAuthTest";
import request from "supertest";
import app from "../../../../src/app";

let userRepository : Repository<User>

beforeAll(async () => {
    const myDataSource = getDataSource()
    userRepository = myDataSource.getRepository(User)
})


describe("AUTH POST LOGIN", () => {

    describe("Validator", () => {

        beforeEach(async () => {

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

        it("request with undefined body", async () => {

            const responseErrorValidator = await request(app)
                .post("/auth/login")
                .send(undefined)

            expect(responseErrorValidator.status).equal(400)
        })
    })
})