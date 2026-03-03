import { ConnectionOptions } from "bullmq"

export const redisConnection: ConnectionOptions = {
    port: Number(process.env.REDIS_PORT!),
    host: process.env.REDIS_HOST!
}