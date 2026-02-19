import {beforeAll, afterAll, describe} from "vitest"
import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {setup, teardown} from "../../../setup";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";

let userRepository : Repository<User>

beforeAll(async () => {
    await setup()
    const myDataSource = getDataSource()
    userRepository = myDataSource.getRepository(User)

})

afterAll(async () => {
    await teardown()
})

describe("SNIPPET API", () => {

    describe("POST register", () => {

        beforeAll(async () => {
            await userRepository
                .createQueryBuilder()
                .delete()
                .from(User)
                .execute()
        })

    })
})