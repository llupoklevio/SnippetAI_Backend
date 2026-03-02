import "reflect-metadata"
import dotenv from 'dotenv';
dotenv.config({ path: ".env.test" });
import {DataSource} from "typeorm";
import {closeConnection, instanceDataSource, isExistConnection, openConnection} from "../src/app-data-source.js";
import {setDataSource} from "../src/type/data-source/getDataSourceByEnv";
import {buildContainer} from "../src/ContainerAwilix/CompositionRoot";

let myDataSource: DataSource | null = null;
const mainDbNameTest = `${process.env.POSTGRES_TEST!}_${process.env.VITEST_WORKER_ID ?? "0"}`

console.log(process.env.POSTGRES_TEST!,"test db")

export async function setup() {
    if(isExistConnection(mainDbNameTest)){
        myDataSource = await openConnection(mainDbNameTest)
        setDataSource(myDataSource)
    }else{
        myDataSource = instanceDataSource({
            serverName: "postgres",
            dbName: mainDbNameTest,
            synchronize: false,
            database: process.env.POSTGRES_DB!,
        })

        const tempConn = await myDataSource.initialize()

        const schemaName = mainDbNameTest;

        await tempConn.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
        await tempConn.query(`SET search_path TO "${schemaName}";`);
        await tempConn.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        await tempConn.synchronize();
        setDataSource(myDataSource)
        await buildContainer()
    }
}

export async function teardown() {
    if(isExistConnection(mainDbNameTest)){
        if(!myDataSource){
            throw new Error("Invalid datasource")
        }
        await myDataSource.query(`DROP SCHEMA IF EXISTS "${mainDbNameTest}" CASCADE`)

        await closeConnection(mainDbNameTest,myDataSource)
    }else{
        throw new Error("Non si può chiudere una connessione non disponibile")
    }
}




