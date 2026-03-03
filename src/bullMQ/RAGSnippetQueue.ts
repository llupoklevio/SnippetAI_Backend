import {ConnectionOptions} from "bullmq";
import {QueueBase} from "./base/queueBase.js";

export class RAGSnippetQueue<T> extends QueueBase<T>{

    constructor(
        redisConnection: ConnectionOptions,
    ) {
        super(redisConnection, "RAGSnippetQueue")
    }
}