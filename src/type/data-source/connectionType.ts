import {z} from "zod";

const connectionType = z.object({
    dbName: z.string(),
    serverName: z.enum(["postgres", "mysql"]),
    synchronize: z.boolean(),
    database: z.string(),
    migrationsSetup: z.object({
        migrations: z.array(z.string()),
        migrationsRun: z.boolean().optional(),
        migrationsTableName: z.string().optional(),
        migrationsTransactionMode: z.string().optional(),
    }).optional()
})

export type IConnectionType = z.infer<typeof connectionType>;