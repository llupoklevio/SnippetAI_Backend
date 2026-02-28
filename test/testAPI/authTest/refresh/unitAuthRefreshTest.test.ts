import {describe, it, expect, vi} from "vitest"
import request from "supertest";
import app from "../../../../src/app";
import {getToken} from "../utilsAuthTest";



vi.mock("../../../../src/auth/service/refreshService.js", () => {
    const RefreshService = vi.fn(function (){
        return {
            getAccessToken: vi.fn().mockResolvedValue(
                "JWT_Token",
            )
        }
    })

    return {RefreshService}
})

describe('AUTH POST REFRESH', () => {

    it("should responde 400 if req have no authorization", async () => {

        const refreshErrorNoToken = await request(app)
            .get("/auth/refresh")

        expect(refreshErrorNoToken.status).equal(400)
        expect(refreshErrorNoToken.body).toMatchObject({
            type: "BusinessLogic",
            message: "No authorization token was found"
        })
    })

    it("should responde 400 if req have an invalid format token", async () => {
        const refreshErrorNoToken = await request(app)
            .get("/auth/refresh")
            .set("Authorization", "invalid-token")

        expect(refreshErrorNoToken.status).equal(400)
        expect(refreshErrorNoToken.body).toMatchObject({
            type: "BusinessLogic",
            message: "Format is Authorization: Bearer [token]"
        })
    })

    it("should responde 400 if req have an invalid token", async () => {
        const refreshErrorNoToken = await request(app)
            .get("/auth/refresh")
            .set("Authorization", "Bearer invalid-token")

        expect(refreshErrorNoToken.status).equal(400)
        expect(refreshErrorNoToken.body).toMatchObject({
            type: "BusinessLogic",
            message: "jwt malformed"
        })
    })

    it("shoulde responde 200 and get access token", async () => {

        const accessToken = await request(app)
            .get("/auth/refresh")
            .set("Authorization", getToken())

        expect(accessToken.status).equal(200)
        expect(accessToken.body).toMatchObject({
            message: "success",
            accessToken: "JWT_Token"
        })
    })

})