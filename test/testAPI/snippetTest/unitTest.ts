import {Snippet} from "../../../src/entities/postgres/snippet.entity.js";
import { setup, teardown} from "../../setup";
import {beforeAll, afterAll, describe,it, expect} from "vitest"
import {Repository} from "typeorm";
import app from "../../../src/app.js"
import request from "supertest";
import {getDataSource} from "../../../src/type/data-source/getDataSourceByEnv";

let snippetRepository : Repository<Snippet>

beforeAll(async () => {
    await setup()
    const myDataSource = getDataSource()
    snippetRepository = myDataSource.getRepository(Snippet)

})

afterAll(async () => {
    await teardown()
})

describe("SNIPPET API", () => {

    describe("POST Snippet", () => {

        beforeAll(async () => {
            await snippetRepository
                .createQueryBuilder()
                .delete()
                .from(Snippet)
                .execute()
        })

        it("success", async () => {
            const responseSuccess = await request(app)
                .post("/snippets")

            expect(responseSuccess.status).equal(200);
        })
    })
})