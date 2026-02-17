import app from "./app.js"
import dotenv from 'dotenv';
import {instanceDataSource, isExistConnection} from "./app-data-source.js";
import type {DataSource} from "typeorm";

dotenv.config();

const schema = process.env.SCHEMA_DEV!
const db = process.env.POSTGRES_DB!

if(!schema) throw new Error("SCHEMA_DEV is not defined in .env")
if(!db) throw new Error("SCHEMA_DEV is not defined in .env")

let datasource : DataSource | null = null;

const main = async () => {
    try{

        if(!isExistConnection(schema)){
           datasource = instanceDataSource({
                serverName: "postgres",
                dbName: schema,
                synchronize: true,
               database: db,
            })
        }else{
            throw new Error("only one connection for db by server starter");
        }

        /** Avvio connessione con db **/
        await datasource.initialize()
        /** Avvio software **/
        app.listen(process.env.PORT_SERVER)

        console.log("Server is running on port: " + process.env.PORT_SERVER)

    }catch(err){

        console.error(err)

        process.exit(1);

    }
}

main()
