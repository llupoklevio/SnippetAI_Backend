import "reflect-metadata"
import dotenv from 'dotenv';
dotenv.config();
import {DataSource} from "typeorm";
import {closeConnection, instanceDataSource, isExistConnection, openConnection} from "../src/app-data-source.js";
import {setDataSource} from "../src/type/data-source/getDataSourceByEnv";

let myDataSource: DataSource | null = null;
const mainDbNameTest = process.env.POSTGRES_TEST!

console.log(process.env.POSTGRES_TEST!,"test db")

export async function setup() {
    if(isExistConnection(mainDbNameTest)){
        myDataSource = await openConnection(mainDbNameTest)
    }else{
        myDataSource = instanceDataSource({
            serverName: "postgres",
            dbName: mainDbNameTest,
            synchronize: true,
            database: process.env.POSTGRES_DB!,
        })

        await myDataSource.initialize()
        setDataSource(myDataSource)
    }
}

export async function teardown() {
    if(isExistConnection(mainDbNameTest)){
        if(!myDataSource){
            throw new Error("Invalid datasource")
        }
        await closeConnection(mainDbNameTest,myDataSource)
    }else{
        throw new Error("Non si può chiudere una connessione non disponibile")
    }
}



