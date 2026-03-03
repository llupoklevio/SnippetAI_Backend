import {ConnectionOptions, Job, Queue} from "bullmq";

export class QueueBase<T> {

    protected _queue: Queue

    constructor(
        private redisConnection : ConnectionOptions,
        name: string,
    ) {
        this._queue = new Queue(name,{
            connection: this.redisConnection,
        })
    }

    async add(name: string, data: T): Promise<Job<T>> {
        return await this._queue.add(name, data);
    }

}