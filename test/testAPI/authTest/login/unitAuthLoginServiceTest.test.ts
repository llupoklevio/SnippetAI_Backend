import {describe, vi, it, expect} from "vitest";
import {LoginService} from "../../../../src/auth/service/loginService";
import {DateTime} from "luxon";

const mockUserRepository = {
    findOneByEmail: vi.fn().mockResolvedValue(null),
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

             expect(
                session.LogUser({
                    password: "UserTest20",
                    email: "user@test.com"
                })
            ).rejects.toThrow("user not found");
        })


    })
})