import {QueueBase} from "./base/queueBase.js";
import {ConnectionOptions} from "bullmq";

export class DescriptionAIQueue<T> extends QueueBase<T> {

    constructor(
        redisConnection: ConnectionOptions,
    ){
        super(redisConnection, "DescriptionAIQueue")
    }
}