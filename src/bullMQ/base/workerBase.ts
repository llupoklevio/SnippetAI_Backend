import {ConnectionOptions, Job, Worker} from "bullmq";

export abstract class WorkerBase<T> {
    protected _worker: Worker

    protected constructor(
        queueName: string,
        redisConnection : ConnectionOptions,
    ) {
        this._worker = new Worker<T>(queueName,async (job: Job<T>)  => {
            return await this.operation(job)
        },{connection: redisConnection})
    }

    abstract operation(job: Job<T>): Promise<T>;

}

