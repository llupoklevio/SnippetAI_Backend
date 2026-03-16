import {beforeAll, beforeEach, describe, expect,it} from "vitest";
import {getDataSource} from "../../../../src/type/data-source/getDataSourceByEnv";
import {User} from "../../../../src/entities/postgres/user.entity";
import {Repository} from "typeorm";
import {Snippet} from "../../../../src/entities/postgres/snippet.entity";
import {typeResponseLoginAPI} from "../../../../src/auth/type/loginDTO";
import {defaultUser, getTokenByLoggedUser} from "../../authTest/utilsAuthTest";
import request from "supertest";
import app from "../../../../src/app";
import { Server } from "socket.io"
import { io as ioClient, Socket } from "socket.io-client"
import {baseData, createSnippet, PostSnippetAPI, socketDesc, socketRAG} from "../utilsSnippetTest";
import http from "http"
import {socketSnippetIO} from "../../../../src/socket_IO/snippet";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {getContainer} from "../../../../src/ContainerAwilix/CompositionRoot";
import {asValue} from "awilix";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import {typeResponseAPIGETSnippets, typeResponseControllerSnippet} from "../../../../src/snippet/type/responseSnippet";
import {limiterStore} from "../../../../src/RateLimiting/rate";

let snippetRepository: Repository<Snippet>
let userRepository: Repository<User>;
let userSessionRepository: Repository<UserSession>;
let session : typeResponseLoginAPI["session"]
let socket: Socket
let httpServer : http.Server


beforeAll(async () => {
    const myDataSource = getDataSource()

    httpServer = http.createServer(app)
    const io = new Server(httpServer, { cors: { origin: "*" } })
    const snippetIO = socketSnippetIO(io)

    await new Promise<void>((resolve) => httpServer.listen(process.env.PORT_SERVER, resolve))

    snippetRepository = myDataSource.getRepository(Snippet)
    userRepository = myDataSource.getRepository(User)
    userSessionRepository = myDataSource.getRepository(UserSession)

    session = await getTokenByLoggedUser(request,app,expect)
    socket = ioClient(`http://localhost:${process.env.PORT_SERVER}/snippet`, {
        extraHeaders: {
            authorization: `Bearer ${session.accessToken}`
        }
    })

    getContainer().register({
        snippetIO: asValue(snippetIO),
    })

    getContainer().cradle.RAGWorker
    getContainer().cradle.DescriptionAIWorker

    await new Promise<void>((resolve, reject) => {
        socket.on("connect", () => resolve())
        socket.on("connect_error", (err) => reject(err))
        setTimeout(() => reject(new Error("socket timeout")), 5000)
    })
})

describe("Integration Post Snippet", () => {

    beforeEach(async () => {

        await snippetRepository
            .createQueryBuilder()
            .delete()
            .from(Snippet)
            .execute()

        await userSessionRepository
            .createQueryBuilder()
            .delete()
            .from(UserSession)
            .execute()

        await userRepository
            .createQueryBuilder()
            .delete()
            .from(User)
            .execute()


        session = await getTokenByLoggedUser(request,app,expect)
    })

    it("success with RAG", async () => {

        socket.emit("join", 1)

        const postSnippet = await request(httpServer)
            .post('/snippets')
            .set("Authorization", `Bearer ${session.accessToken}`)
            .send(baseData)

        expect(postSnippet.status).equal(200)

        /** viene chiamato il worker per il rag */
        const socketEvent : socketRAG = await new Promise((resolve, reject) => {
            socket.on("WorkerSuccess", resolve)
            setTimeout(() => reject(new Error("worker timeout")), 5000)
        })

        expect(socketEvent.message).equal("success RAG")
        expect(socketEvent.status).equal(200)

        expect(postSnippet.body.snippet.title).equal(baseData.title)
        expect(postSnippet.body.snippet.code).equal(baseData.code)
        expect(postSnippet.body.snippet.description).equal(baseData.description)

        expect(postSnippet.body.snippet.snippetOwner.email).equal(defaultUser.email)

        expect(postSnippet.body.message).equal("RAG")

        const vectorStore = await Chroma.fromExistingCollection(
            new OpenAIEmbeddings({ model: "text-embedding-3-large" }),
            { collectionName: `RagSnippetWorker${postSnippet.body.snippet.snippetOwner.id}` }
        );

        let titleVectorDB : string = ""

        const results = await vectorStore.similaritySearchWithScore(
            baseData.description,
            1
        );

       results[0]!.forEach(value => {
           if (typeof value !== "number") {
               titleVectorDB = value.metadata.title as any
           }
        });

       expect(titleVectorDB).equal(postSnippet.body.snippet.title);
    })

    it("success generated description by AI", async () => {

        socket.emit("join", 2)

        const { description, ...snippetWithoutDescription } = baseData

        const postSnippet = await request(httpServer)
            .post('/snippets')
            .set("Authorization", `Bearer ${session.accessToken}`)
            .send(snippetWithoutDescription)


        expect(postSnippet.status).equal(200)

        const socketEvent : socketDesc = await new Promise((resolve, reject) => {
            socket.on("description:completed", resolve)
            setTimeout(() => reject(new Error("worker timeout")), 10000)
        })

        expect(socketEvent.description).toBeTypeOf("string")
        expect(socketEvent.snippetId).equal(2)

        expect(postSnippet.body.message).equal("DESCRIPTIONAI")

    },15_000)
})

describe("Integration Get Snippet", async () => {

    beforeEach(async () => {

        await snippetRepository
            .createQueryBuilder()
            .delete()
            .from(Snippet)
            .execute()

        await userSessionRepository
            .createQueryBuilder()
            .delete()
            .from(UserSession)
            .execute()

        await userRepository
            .createQueryBuilder()
            .delete()
            .from(User)
            .execute()


        session = await getTokenByLoggedUser(request,app,expect)
    })

    it("Get All snippet", async () => {

        const firstAPI : typeResponseControllerSnippet = await PostSnippetAPI(request,httpServer,session.accessToken, createSnippet())

        const secondAPI : typeResponseControllerSnippet = await PostSnippetAPI(request,httpServer,session.accessToken, createSnippet({
            description: "Deep example of description 2",
            title: "secondTitle",
            code: "secondCode",
        }))

        const thirdAPI = await PostSnippetAPI(request,httpServer,session.accessToken, createSnippet({
            description: "Deep example of description 3",
            title: "thridTitle",
            code: "thridCode",
        }))

        const snippetToCheck : typeResponseControllerSnippet[] = []
        snippetToCheck.push(firstAPI, secondAPI, thirdAPI)

        const getSnippet = await request(httpServer)
            .get('/snippets')
            .set("Authorization", `Bearer ${session.accessToken}`)

        expect(getSnippet.status).equal(200)

        const getSnippetBody : typeResponseAPIGETSnippets = getSnippet.body

        getSnippetBody.snippets.forEach((snippet, index) => {
            expect(snippet.title).equal(snippetToCheck[index]!.snippet.title)
            expect(snippet.code).equal(snippetToCheck[index]!.snippet.code)
            expect(snippet.description).equal(snippetToCheck[index]!.snippet.description)
            expect(snippet.snippetOwner.email).equal(snippetToCheck[index]!.snippet.snippetOwner.email)
        })

    })

})

describe("Integtration Get Single Snippet", () => {

    beforeEach(async () => {

        await snippetRepository
            .createQueryBuilder()
            .delete()
            .from(Snippet)
            .execute()

        await userSessionRepository
            .createQueryBuilder()
            .delete()
            .from(UserSession)
            .execute()

        await userRepository
            .createQueryBuilder()
            .delete()
            .from(User)
            .execute()


        session = await getTokenByLoggedUser(request,app,expect)
    })

    it("Get Single Snippet", async () => {

        await PostSnippetAPI(request,httpServer,session.accessToken, createSnippet())

        const secondAPI : typeResponseControllerSnippet = await PostSnippetAPI(request,httpServer,session.accessToken, createSnippet({
            description: "Deep example of description 2",
            title: "secondTitle",
            code: "secondCode",
        }))

         await PostSnippetAPI(request,httpServer,session.accessToken, createSnippet({
            description: "Deep example of description 3",
            title: "thridTitle",
            code: "thridCode",
        }))

        const singleSnippet = await request(httpServer)
            .get(`/snippets/${secondAPI.snippet.id}`)
            .set("Authorization", `Bearer ${session.accessToken}`)

        expect(singleSnippet.status).equal(200)
        expect(singleSnippet.body.snippet.id).equal(secondAPI.snippet.id)

        expect(singleSnippet.body.snippet.title).equal(secondAPI.snippet.title)
    })
})

describe("Integtration Post Snippet Description with AI", () => {

    beforeEach(async () => {

        await snippetRepository
            .createQueryBuilder()
            .delete()
            .from(Snippet)
            .execute()

        await userSessionRepository
            .createQueryBuilder()
            .delete()
            .from(UserSession)
            .execute()

        await userRepository
            .createQueryBuilder()
            .delete()
            .from(User)
            .execute()


        session = await getTokenByLoggedUser(request,app,expect)

        socket.off("WorkerSuccess")
        socket.off("WorkerError")
        socket.off("description:completed")

        await limiterStore.resetAll()
    })

    it("Success", async () => {

       const snippetSaved = await PostSnippetAPI(request,httpServer,session.accessToken, createSnippet({
            title: "thridTitle",
            code: "thridCode",
        }))

        const response = await request(httpServer)
            .post(`/snippets/${snippetSaved.snippet.id}/saveDescAI`)
            .set("Authorization", `Bearer ${session.accessToken}`)
            .send({
                description: "Deep example of description 3",
            })

        expect(response.status).equal(200)

        socket.emit("join", snippetSaved.snippet.id)

        const socketEvent : socketRAG = await new Promise((resolve, reject) => {
            socket.on("WorkerSuccess", resolve)
            socket.on("WorkerError", reject)
            setTimeout(() => reject(new Error("worker timeout")), 5000)
        })

        expect(socketEvent.status).equal(200)
        expect(socketEvent.message).equal("success RAG")

        expect(response.body.snippet.title).equal("thridTitle")
        expect(response.body.snippet.code).equal("thridCode")
        expect(response.body.snippet.description).equal(baseData.description+" 3")

        expect(response.body.snippet.snippetOwner.email).equal(defaultUser.email)

        const vectorStore = await Chroma.fromExistingCollection(
            new OpenAIEmbeddings({ model: "text-embedding-3-large" }),
            { collectionName: `RagSnippetWorker${response.body.snippet.snippetOwner.id}` }
        );

        let titleVectorDB : string = ""

        const results = await vectorStore.similaritySearchWithScore(
            baseData.description,
            1
        );

        results[0]!.forEach(value => {
            if (typeof value !== "number") {
                titleVectorDB = value.metadata.title as any
            }
        });

        expect(titleVectorDB).equal(response.body.snippet.title);

    },20_000)
})
