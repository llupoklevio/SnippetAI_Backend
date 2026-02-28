import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import request from "supertest";
import app from "../../../../src/app";
import {getTokenByLoggedUser} from "../utilsAuthTest";
import {typeResponseLoginAPI} from "../../../../src/auth/type/loginDTO";

let userRepository : Repository<User>
let userSessionRepository : Repository<UserSession>
let session : typeResponseLoginAPI["session"]

beforeAll(async () => {
    const myDataSource = getDataSource()

    userRepository = myDataSource.getRepository(User)
    userSessionRepository = myDataSource.getRepository(UserSession)
})

describe("AUTH API REFRESH INTEGRATION", async () => {

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

        session = await getTokenByLoggedUser(request, app, expect);
    })

    it("success", async () => {

        const getToken = await request(app)
            .get("/auth/refresh")
            .set("Authorization", `Bearer ${session.refreshToken}`)

        expect(getToken.status).equal(200)
        expect(getToken.body.message).equal("success")
        expect(getToken.body.accessToken).toBeTypeOf("string")
    })
})