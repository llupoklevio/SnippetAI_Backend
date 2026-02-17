import dotenv from 'dotenv';
dotenv.config();
import app from "./app.js"
import {instanceDataSource, isExistConnection} from "./app-data-source.js";
import type {DataSource} from "typeorm";



const schema = process.env.SCHEMA_DEV!
const db = process.env.POSTGRES_DB!

if(!schema) throw new Error("SCHEMA_DEV is not defined in .env")
if(!db) throw new Error("SCHEMA_DEV is not defined in .env")

let datasource : DataSource | null = null;

const main = async () => {
    try{

        console.log(process.env.NODE_ENV, "in che stato sono");

        if(!isExistConnection(schema)){
           datasource = instanceDataSource({
                serverName: "postgres",
                dbName: schema,
                synchronize: process.env.NODE_ENV === "development",
               database: db,
            })
        }else{
            console.log("Is not expected to have an open connection")
            process.exit(1);
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

await main()
