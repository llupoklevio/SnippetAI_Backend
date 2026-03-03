import { ConnectionOptions } from "bullmq"

// lazy
export const getRedisConnection = (): ConnectionOptions => ({
    port: Number(process.env.REDIS_PORT!),
    host: process.env.REDIS_HOST!
})