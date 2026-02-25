import {Repository} from "typeorm";
import {User} from "../../../../src/entities/postgres/user.entity";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {beforeAll, describe} from "vitest";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";

let userRepository : Repository<User>
let userSessionRepository : Repository<UserSession>

beforeAll(async () => {
    const myDataSource = getDataSource()

    userRepository = myDataSource.getRepository(User)
    userSessionRepository = myDataSource.getRepository(UserSession)
})

describe("AUTH API LOGIN INTEGRATION")