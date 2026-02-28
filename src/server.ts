import app from "./app.js"
import {instanceDataSource, isExistConnection} from "./app-data-source.js";
import type {DataSource} from "typeorm";
import {setDataSource} from "./type/data-source/getDataSourceByEnv.js";
import {buildContainer} from "./ContainerAwilix/CompositionRoot.js";

const schema = process.env.NODE_ENV === "development" ? process.env.SCHEMA_DEV! : process.env.SCHEMA_PROD!
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
                synchronize: false,
                database: db,
            })
        }else{
            console.log("Is not expected to have an open connection")
            process.exit(1);
        }

        const tempConn = await datasource.initialize();

        /** Avvio connessione con db **/
        if (process.env.NODE_ENV !== "production") {
            const schemaFullName = schema;

            await tempConn.query(`CREATE SCHEMA IF NOT EXISTS "${schemaFullName}";`);
            await tempConn.query(`SET search_path TO "${schemaFullName}";`);
            await tempConn.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

            await tempConn.synchronize();
            console.log(`✅ Database pronto sullo schema: ${schemaFullName}`);
        }

        setDataSource(datasource)

        console.log("Initializing...", datasource.options)

        /** DI */
        await buildContainer()

        /** Avvio software **/
        app.listen(process.env.PORT_SERVER)

        console.log("Server is running on port: " + process.env.PORT_SERVER)

    }catch(err){
        console.error(err)
        process.exit(1);

    }
}

await main()
