import {ConnectionOptions, Job, Worker} from "bullmq";
import {Namespace} from "socket.io";

export abstract class WorkerBase<T> {
    protected _worker: Worker

    protected constructor(
        queueName: string,
        redisConnection : ConnectionOptions,
        snippetIO: Namespace
    ) {
        this._worker = new Worker<T>(queueName,async (job: Job<T>)  => {
            return await this.operation(job)
        },{
            connection: redisConnection,
            concurrency: 3
        })

        this._worker.on('failed', (job, _err) => {
            snippetIO.to(`snippet:${job?.data.id}`).emit("WorkerError", {
                error: "Error RAG",
                snippetAI: job?.data.id,
                status: 500
            })
        })
    }

    abstract operation(job: Job<T>): Promise<void>;

}

