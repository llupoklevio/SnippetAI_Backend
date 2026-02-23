import {describe, vi, it, expect} from "vitest"
import {createUser} from "./utilsRegisterTest";
import {UserService} from "../../../../src/auth/service/userService";
import {User} from "../../../../src/entities/postgres/user.entity";
import * as argon2 from "argon2";

const mockRepository = {
    save: vi.fn().mockImplementation((user: User) => Promise.resolve(user)),
    findOneBy: vi.fn().mockResolvedValue(null),
};


describe("AUTH API SERVICE", () => {

    describe("POST register", () => {

        it("should be able to hashed password", async () => {

            const user = createUser({})
            const registerService = new UserService(mockRepository as any)
            const response = await registerService.registerUserDB(user)

            expect(await argon2.verify(response.password, user.password)).equal(true);

        })

        it("worked with the currect data", async () => {
            const user = createUser({})
            const registerService = new UserService(mockRepository as any)
            const response = await registerService.registerUserDB(user)

            expect(response.email).equal(user.email);
            expect(response.firstName).equal(user.firstName);
            expect(response.lastName).equal(user.lastName);
        })

    })
})

