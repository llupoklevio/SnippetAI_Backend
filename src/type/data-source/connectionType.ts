import {z} from "zod";

const connectionType = z.object({
    dbName: z.string(),
    serverName: z.enum(["postgres", "mysql"]),
    synchronize: z.boolean(),
    database: z.string()
})

export type IConnectionType = z.infer<typeof connectionType>;