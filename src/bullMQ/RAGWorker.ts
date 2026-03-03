import {WorkerBase} from "./base/workerBase.js";
import {ConnectionOptions, Job} from "bullmq";

export class RAGWorker<T> extends WorkerBase<T> {

    constructor(
        redisConnection: ConnectionOptions
    ) {
        super("RAGSnippetQueue",redisConnection);
    }

    async operation(job: Job<T>): Promise<T> {
        console.log("Job", job);
        return Promise.resolve(undefined as unknown as T);
    }
}