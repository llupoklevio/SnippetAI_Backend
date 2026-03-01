import "reflect-metadata"
import dotenv from "dotenv"
import {instanceDataSource} from "./app-data-source.js";
dotenv.config()

export default instanceDataSource({
    serverName: "postgres",
    dbName: process.env.SCHEMA_PROD!,
    synchronize: false,
    database: process.env.POSTGRES_DB!,
})