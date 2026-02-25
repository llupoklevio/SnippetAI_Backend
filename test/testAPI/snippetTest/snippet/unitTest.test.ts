import {Snippet} from "../../../../src/entities/postgres/snippet.entity.js";
import {beforeAll, describe,it, expect} from "vitest"
import {Repository} from "typeorm";
import app from "../../../../src/app.js"
import request from "supertest";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";

let snippetRepository : Repository<Snippet>

beforeAll(async () => {
    const myDataSource = getDataSource()
    snippetRepository = myDataSource.getRepository(Snippet)
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