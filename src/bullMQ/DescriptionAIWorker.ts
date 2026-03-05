import {WorkerBase} from "./base/workerBase.js";
import {ConnectionOptions, Job} from "bullmq";
import {Namespace} from "socket.io";
import {TypeForDescriptionAIWorker} from "../snippet/type/responseSnippet.js";
import {getModelAI} from "../AI/model.js";
import {initChatModel} from "langchain";
type ModelAI = Awaited<ReturnType<typeof initChatModel>>

export class DescriptionAIWorker extends WorkerBase<TypeForDescriptionAIWorker> {

    private _model : ModelAI

    constructor(
        redisConnection: ConnectionOptions,
        protected snippetIO: Namespace

    ) {
        super("DescriptionAIQueue", redisConnection, snippetIO);
        this._model = getModelAI()
    }

    async operation(job: Job<TypeForDescriptionAIWorker>): Promise<void> {

        const stream = await this._model.stream(
            `Genera una descrizione per questo codice:\n${job.data.code}`
        )

        let fullDescription = ""

        for await (const chunk of stream) {
            fullDescription += chunk.content

            this.snippetIO.to(`snippet:${job.data.id}`).emit("description:chunk", {
                chunk: chunk.content
            })
        }

        this.snippetIO.to(`snippet:${job.data.id}`).emit("description:completed", {
            description: fullDescription,
            snippetId: job.data.id
        })
    }

}