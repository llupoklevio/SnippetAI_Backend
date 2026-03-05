import {beforeAll, describe, it, vi, expect,beforeEach} from "vitest";
import {IAuthUserRepository} from "../../../../src/auth/repositoryTypeORM/interface/IauthUserRepository";
import {ISnippetRepository} from "../../../../src/snippet/repositoryTypeORM/interface/ISnippetRepository";
import {SnippetService} from "../../../../src/snippet/service/snippetService";
import {baseData, createSnippet} from "../utilsSnippetTest";
import {defaultUser} from "../../authTest/utilsAuthTest";
import {User} from "../../../../src/entities/postgres/user.entity";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {DateTime} from "luxon";
import {Snippet} from "../../../../src/entities/postgres/snippet.entity";

const findByEmailAndIdMock = vi.fn()
const mockUserRepository : IAuthUserRepository = {
    findOneByEmail: vi.fn(),
    save: vi.fn(),
    findByEmailAndId:findByEmailAndIdMock
}

const saveSnippetRepositoryMock = vi.fn()
const mockSnippetRepository : ISnippetRepository = {
    save: saveSnippetRepositoryMock
}

const mockRAGSnippetQueue = {
    add: vi.fn().mockResolvedValue({})
}

const mockDescriptionAIQueue = {
    add: vi.fn().mockResolvedValue({})
}

let serviceSnippet : SnippetService

describe("Snippet Service Post", () => {

    beforeEach(() => {
        vi.clearAllMocks()

        findByEmailAndIdMock.mockResolvedValue({
            id: "1",
            email: defaultUser.email,
            password: "hashedpassword",
            lastName: defaultUser.lastName,
            firstName: defaultUser.firstName,
            personalSnippets: undefined,
            session: [{
                id: "1",
                expiresAt: DateTime.now().set({day:2}),
                user: undefined,
                refreshToken: "token"
            }] as unknown as UserSession[]
        } as unknown as User)
    })

    beforeAll(() => {
        serviceSnippet = new SnippetService(
            mockSnippetRepository as any,
            mockUserRepository as any,
            mockRAGSnippetQueue as any,
            mockDescriptionAIQueue as any
        )
    })

    it("User not found", async () => {
        findByEmailAndIdMock.mockResolvedValue(null)

        await expect(
            serviceSnippet.createSnippet(createSnippet(), {
                idUser: "1",
                email: defaultUser.email
            })
        ).rejects.toThrow("User Not Found")

    })

    it("response with rag operation", async () => {

        saveSnippetRepositoryMock.mockResolvedValue({
            id: 1,
            dateUpdate: DateTime.now().toJSDate(),
            dateCreation: DateTime.now().toJSDate(),
            snippetOwner: {
                id: "1",
                email: defaultUser.email,
                password: "hashedpassword",
                lastName: defaultUser.lastName,
                firstName: defaultUser.firstName,
                personalSnippets: undefined,
                session: [{
                    id: "1",
                    expiresAt: DateTime.now().set({day:2}).toJSDate(),
                    user: undefined,
                    refreshToken: "token"
                }] as unknown as UserSession[]
            } as User,
            title: baseData.title,
            description: baseData.description,
            code: baseData.code,
        } as Snippet)

        const ragResponse = await serviceSnippet.createSnippet(createSnippet(), {
            idUser: "1",
            email: defaultUser.email
        })

        expect(ragResponse.operation).equal("RAG")
        expect(ragResponse.snippet).toMatchObject({
            id: 1,
            title: baseData.title,
            code: baseData.code,
            description: baseData.description,
        })

        expect(mockSnippetRepository.save).toHaveBeenCalledOnce()
        expect(mockUserRepository.findByEmailAndId).toHaveBeenCalledOnce()
        expect(mockRAGSnippetQueue.add).toHaveBeenCalledOnce()
        expect(mockDescriptionAIQueue.add).not.toHaveBeenCalled()
    })

    it("response with description operation", async () => {

        saveSnippetRepositoryMock.mockResolvedValue({
            id: 1,
            dateUpdate: DateTime.now().toJSDate(),
            dateCreation: DateTime.now().toJSDate(),
            snippetOwner: {
                id: "1",
                email: defaultUser.email,
                password: "hashedpassword",
                lastName: defaultUser.lastName,
                firstName: defaultUser.firstName,
                personalSnippets: undefined,
                session: [{
                    id: "1",
                    expiresAt: DateTime.now().set({day:2}).toJSDate(),
                    user: undefined,
                    refreshToken: "token"
                }] as unknown as UserSession[]
            } as User,
            title: baseData.title,
            code: baseData.code,
        } as Snippet)

        const ragResponse = await serviceSnippet.createSnippet(createSnippet(), {
            idUser: "1",
            email: defaultUser.email
        })

        expect(ragResponse.operation).equal("DESCRIPTIONAI")
        expect(ragResponse.snippet).toMatchObject({
            id: 1,
            title: baseData.title,
            code: baseData.code,
        })
        expect(ragResponse.snippet.description).equal(undefined)

        expect(mockSnippetRepository.save).toHaveBeenCalledOnce()
        expect(mockUserRepository.findByEmailAndId).toHaveBeenCalledOnce()
        expect(mockRAGSnippetQueue.add).not.toHaveBeenCalledOnce()
        expect(mockDescriptionAIQueue.add).toHaveBeenCalled()

    })
})