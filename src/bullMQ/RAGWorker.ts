import {WorkerBase} from "./base/workerBase.js";
import {ConnectionOptions, Job} from "bullmq";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {OpenAIEmbeddings} from "@langchain/openai";
import {Document} from "@langchain/core/documents";
import {Snippet} from "../entities/postgres/snippet.entity.js";
import {Chroma} from "@langchain/community/vectorstores/chroma";
import {Namespace} from "socket.io";
import {DateTime} from "luxon";


export class RAGWorker extends WorkerBase<Snippet> {

    private readonly _embeddings: OpenAIEmbeddings

    constructor(
        redisConnection: ConnectionOptions,
        protected snippetIO: Namespace
    ) {
        super("RAGSnippetQueue",redisConnection,snippetIO);
        this._embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large"
        })
    }

    private getVector = (id: string) : Chroma  => {
        return new Chroma(this._embeddings, {
            collectionName: `RagSnippetWorker${id}`
        })
    }

    async operation(job: Job<Snippet>) : Promise<void> {

        const vectorStore = this.getVector(job.data.snippetOwner.id)

        const docs = new Document({
        pageContent: `${job.data.code}\n${job.data.description ?? ""}`,
        metadata: {
            snippetId: job.data.id,
            creator: job.data.snippetOwner.email,
            title: job.data.title,
            dateCreation: DateTime.fromJSDate(new Date(job.data.dateCreation)).toString()
        }
    })

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100
        })
        const allSplits = await splitter.splitDocuments([docs])

        await vectorStore.addDocuments(allSplits)

        this.snippetIO.to(`snippet:${job?.data.id}`).emit("WorkerSuccess", {
            message: "success RAG",
            status: 200
        })
    }
}
