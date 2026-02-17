import type {IConnectionType} from "./type/data-source/connectionType.js";
import {DataSource, type DataSourceOptions} from "typeorm";
import {getServer} from "./type/data-source/getServer.js";

let connectionMap = new Map<string, DataSource>();

const isExistConnection = (dbName: string) : boolean => {
    return connectionMap.has(dbName)
}

const openConnection = async (dataSource: DataSource, dbName: string)  => {
    try{

        if(connectionMap.has(dbName)) {
            return connectionMap.get(dbName)!
        }

        await dataSource.initialize()
    }catch(e){
        console.error(e);
        throw e;
    }
}

const closeConnection  = async (dbName: string, dataSource: DataSource) => {

    try{
        await dataSource.destroy()
    }catch (error) {
        console.error(error);
        throw error;
    }

    try{
        connectionMap.delete(dbName)
    }catch(e){
        console.error("Failed to delete from map, reopening connection:", e)
        await dataSource.initialize()
        throw e;
    }

}

const instanceDataSource = ({dbName,serverName, synchronize, database} : IConnectionType) : DataSource => {

    const instance = new DataSource({
        type: serverName,
        synchronize: synchronize,
        entities: [],
        schema: dbName,
        database: database,
        ...getServer(serverName)
    } as DataSourceOptions)

    if(instance === undefined || instance === null) {
        throw new Error(`No connection found for database ${dbName}`)
    }

    try {
        connectionMap.set(dbName, instance)
        return instance;
    }catch(err){
        console.error(err)
        throw err
    }
}

export {
    instanceDataSource,
    isExistConnection,
    closeConnection,
    openConnection
}