import {describe, vi, it, expect} from "vitest";
import {RefreshService} from "../../../../src/auth/service/refreshService";
import {defaultUser} from "../utilsAuthTest";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {DateTime} from "luxon";

const mockUserRepository = {
    findOneBy: vi.fn().mockResolvedValue(null),
}

const mockUserSessionRepository = {
    findOneBy: vi.fn().mockResolvedValue(null),
}

vi.mock("jsonwebtoken", () => ({
    default: {
        sign: vi.fn().mockReturnValue("token"),
    }
}))
describe("AUTH API SERVICE", () => {

    describe("GET ACCESS TOKEN", () => {

        it("should be able to give a token", async () => {

            const access = new RefreshService(mockUserSessionRepository as any,mockUserRepository as any)
            expect(
                access.getAccessToken("Token", {
                    idUser: "20",
                    email: defaultUser.email
                })
            ).rejects.toThrow("User Not Found");
        })

        it("token is not on db", async () => {

            const access = new RefreshService(mockUserSessionRepository as any,mockUserRepository as any)

            mockUserRepository.findOneBy.mockResolvedValueOnce(defaultUser);

            expect(
                access.getAccessToken("Token", {
                    idUser: "20",
                    email: defaultUser.email
                })
            ).rejects.toThrow("Token Not Found");
        })

        it("token is not on db but expired", async () => {

            const access = new RefreshService(mockUserSessionRepository as any,mockUserRepository as any)

            mockUserRepository.findOneBy.mockResolvedValueOnce(defaultUser);

            mockUserSessionRepository.findOneBy.mockResolvedValueOnce({
                user: defaultUser,
                expiresAt: DateTime.now().minus({day:1}).toJSDate(),
                refreshToken: "token",
                id: "20"
            } as UserSession);

            expect(
                access.getAccessToken("Token", {
                    idUser: "20",
                    email: defaultUser.email
                })
            ).rejects.toThrow("Token Not Found");
        })

        it("should return token", async () => {
            const access = new RefreshService(mockUserSessionRepository as any,mockUserRepository as any)

            mockUserRepository.findOneBy.mockResolvedValueOnce(defaultUser);

            mockUserSessionRepository.findOneBy.mockResolvedValueOnce({
                user: defaultUser,
                expiresAt: DateTime.now().plus({day:1}).toJSDate(),
                refreshToken: "token",
                id: "20"
            } as UserSession);

            const getToken = await access.getAccessToken("Token", {
                idUser: "20",
                email: defaultUser.email
            })

            expect(getToken).equal("token");
        })
    })
})