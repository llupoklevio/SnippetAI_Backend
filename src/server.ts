import app from "./app.js"
import {instanceDataSource, isExistConnection} from "./app-data-source.js";
import type {DataSource} from "typeorm";
import {setDataSource} from "./type/data-source/getDataSourceByEnv.js";
import {buildContainer, getContainer} from "./ContainerAwilix/CompositionRoot.js";
import {Server} from "socket.io"
import {socketSnippetIO} from "./socket_IO/snippet.js";
import {asValue} from "awilix";

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
                migrationsSetup: {
                    migrations: process.env.NODE_ENV === "production" ? ["dist/migrations/*.js"] : []
                }
            })
        }else{
            console.log("Is not expected to have an open connection")
            process.exit(1);
        }

        const tempConn = await datasource.initialize();

        /** Avvio connessione con db **/
        if (process.env.NODE_ENV !== "production") {

            await tempConn.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
            await tempConn.query(`SET search_path TO "${schema}";`);
            await tempConn.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

            await tempConn.synchronize();
            console.log(`Database pronto sullo schema: ${schema}`);
        }else if(process.env.NODE_ENV === "production"){
            await tempConn.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
            await tempConn.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

            await tempConn.runMigrations();
            console.log(`Migrazioni eseguite`);
        }

        setDataSource(datasource)

        console.log("Initializing...", datasource.options)

        /** DI */
        await buildContainer()

        /**
         * Avvio software
         * Avvio socket
         * **/
        const startServer = app.listen(process.env.PORT_SERVER)
        const io = new Server(startServer, {
            cors: { origin: "*"},
        });
        socketSnippetIO(io)

        getContainer().register({
            snippetIO: asValue(socketSnippetIO(io))
        })

        getContainer().cradle.RAGWorker
        getContainer().cradle.DescriptionAIWorker


        console.log("Server is running on port: " + process.env.PORT_SERVER)

    }catch(err){
        console.error(err)
        process.exit(1);

    }
}

await main()
