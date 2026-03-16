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
const getAllSnippetMock = vi.fn()
const getSingleSnippetMock = vi.fn()

const mockSnippetRepository : ISnippetRepository = {
    save: saveSnippetRepositoryMock,
    getAllSnippet: getAllSnippetMock,
    getSingleSnippet: getSingleSnippetMock
}

const mockRAGSnippetQueue = {
    add: vi.fn().mockResolvedValue({})
}

const mockDescriptionAIQueue = {
    add: vi.fn().mockResolvedValue({})
}

let serviceSnippet : SnippetService

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

describe("Snippet Service Post", () => {

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

describe("Snippet Get", () => {

    it("response with user not found", async () => {
        findByEmailAndIdMock.mockResolvedValue(null)

        await expect(serviceSnippet.getSnippets({
            email: defaultUser.email,
            idUser: "1"
        })).rejects.toThrow("User Not Found")
    })

    it("response with array of Snippet", async () => {

        getAllSnippetMock.mockResolvedValue([
            {
                id: 1,
                title: baseData.title,
                code: baseData.code,
                description: baseData.description,
                dateUpdate: DateTime.now().toJSDate(),
                dateCreation: DateTime.now().toJSDate(),
                snippetOwner: {
                    id: "1",
                    email: defaultUser.email,
                    password: "hashedpassword",
                    lastName: defaultUser.lastName,
                    firstName: defaultUser.firstName,
                    personalSnippets: undefined,
                    session: undefined
                }
            }
        ] as Snippet[])

       const responseSnippets = await serviceSnippet.getSnippets({
            email: defaultUser.email,
            idUser: "1"
       })

       responseSnippets.forEach(snippet => {
           expect(snippet.title).equal(baseData.title)
           expect(snippet.code).equal(baseData.code)
           expect(snippet.snippetOwner.email).equal(defaultUser.email)
       })
    })

})


describe("Single Snippet", () => {

    it("user not found", async () => {

        findByEmailAndIdMock.mockResolvedValue(null)

        await expect(serviceSnippet.getSingleSnippet({
            email: defaultUser.email,
            idUser: "1"
        }, 1)).rejects.toThrow("User Not Found")

    })

    it("snippet not found", async () => {

        getSingleSnippetMock.mockResolvedValue(null)

        await expect(serviceSnippet.getSingleSnippet({
            email: defaultUser.email,
            idUser: "1"
        }, 1)).rejects.toThrow("Snippet Not Found")

    })

    it("response with single Snippet", async () => {

        getSingleSnippetMock.mockResolvedValue({
            id: 1,
            title: baseData.title,
            code: baseData.code,
            description: baseData.description,
            dateUpdate: DateTime.now().toJSDate(),
            dateCreation: DateTime.now().toJSDate(),
            snippetOwner: {
                id: "20",
                email: defaultUser.email,
                password: "hashedpassword",
                lastName: defaultUser.lastName,
                firstName: defaultUser.firstName,
                personalSnippets: undefined,
            }
        } as Snippet)

        await serviceSnippet.getSingleSnippet({
            email: defaultUser.email,
            idUser: "20"
        }, 1)

        expect(getSingleSnippetMock).toHaveBeenCalledWith(1,"20")

    })

})


describe("Save Snippet With Description By AI", () => {

    beforeAll(async () => {

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

    })

    it("Response with snippet and called queue", async () => {

        const ragOperation = await serviceSnippet.addDescriptionAI(1,{
            idUser: "1",
            email: defaultUser.email,
        },baseData.description)

        expect(ragOperation.code).equal(baseData.code)
        expect(ragOperation.title).equal(baseData.title)
        expect(ragOperation.description).equal(baseData.description)

        expect(mockSnippetRepository.save).toHaveBeenCalledOnce()
    })
})