import {describe, vi, it, expect} from "vitest";
import {LoginService} from "../../../../src/auth/service/loginService";
import * as argon2 from "argon2";
import { defaultUser} from "../utilsAuthTest";
import jwt from 'jsonwebtoken';
import {DateTime} from "luxon";

const mockUserRepository = {
    findOneBy: vi.fn().mockResolvedValue(null),
}

const mockUserSessionRepository = {
    findOneBy: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue({
        id: 20,
        refreshToken: "mocked-jwt-for-user@test.com",
        expiresAt:  DateTime.now().toJSDate(),
        user: {
            id: 20,
            firstName: "User",
            lastName: "Test",
            password: "UserTest20",
            email: "user@test.com"
        },
    }),
}

vi.mock("argon2", () => {
    return {
        verify: vi.fn()
    };
});

vi.mock("jsonwebtoken", () => {
    return {
        default: {
            sign: vi.fn()
        }
    };
});

describe("AUTH API SERVICE", () => {

    describe("POST LOGIN", () => {

        it("should not be able to save session if user is not registered", async () => {

            const session = new LoginService(mockUserRepository as any, mockUserSessionRepository as any);

            await expect(
                session.LogUser({
                    password: "UserTest20",
                    email: "user@test.com"
                })
            ).rejects.toThrow("user not found");
        })

        it("should be responde user not found if password not equal", async () => {

            const session = new LoginService(mockUserRepository as any, mockUserSessionRepository as any);

            /** faccio il mock di findOneBy facendo finta che lo user sia stato registrato */
            mockUserRepository.findOneBy.mockResolvedValueOnce(defaultUser);

            /** mock che la verifica della password sia falsa */
            (argon2.verify as any).mockResolvedValueOnce(false);

            await expect(
                session.LogUser({
                    password: "UserTest20",
                    email: "user@test.com"
                })
            ).rejects.toThrow("user not found");

        })

        it("should return tokens and user if login successful", async () => {
            mockUserRepository.findOneBy.mockResolvedValueOnce(defaultUser);
            (argon2.verify as any).mockResolvedValueOnce(true);
            (jwt.sign as any).mockImplementation((payload: any) => `mocked-jwt-for-${payload.email}`);

            const session = new LoginService(mockUserRepository as any, mockUserSessionRepository as any);
            const userSessione = await session.LogUser({
                password: "UserTest20",
                email: "user@test.com"
            })

            expect(userSessione.accessToken).equal(`mocked-jwt-for-${defaultUser.email}`)
            expect(userSessione.refreshToken).equal(`mocked-jwt-for-${defaultUser.email}`)
            expect(userSessione.user.id).equal(20)
            expect(userSessione.user.firstName).equal("User");
            expect(userSessione.user.lastName).equal("Test");
            expect(userSessione.user.email).equal("user@test.com")
            expect(userSessione.user.password).equal("UserTest20");

        })
    })
})