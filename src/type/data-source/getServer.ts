import type {IConnectionType} from "./connectionType.js";

export const getServer = (serverName : IConnectionType["serverName"]) => {
    switch (serverName) {
        case "postgres":
            return {
                host: process.env.POSTGRES_HOST,
                username: process.env.POSTGRES_USER,
                password: process.env.POSTGRES_PASSWORD,
                port: Number(process.env.POSTGRES_PORT),
            }
        case "mysql":
            return {
                host: process.env.MYSQL_HOST ,
                username: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                port: Number(process.env.MYSQL_PORT),
                connectorPackage: "mysql2" as const,
            }
    }
}
