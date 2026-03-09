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
import {baseData, socketDesc, socketRAG} from "../utilsSnippetTest";
import http from "http"
import {socketSnippetIO} from "../../../../src/socket_IO/snippet";
import {UserSession} from "../../../../src/entities/postgres/userSession";
import {getContainer} from "../../../../src/ContainerAwilix/CompositionRoot";
import {asValue} from "awilix";
import {RAGWorker} from "../../../../src/bullMQ/RAGWorker";
import {getRedisConnection} from "../../../../src/redisConnection";
import {DescriptionAIWorker} from "../../../../src/bullMQ/DescriptionAIWorker";

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
        RAGWorker: asValue(new RAGWorker(getRedisConnection(), snippetIO)),
        DescriptionAIWorker: asValue(new DescriptionAIWorker(getRedisConnection(), snippetIO))
    })

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