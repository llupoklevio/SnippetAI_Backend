import type {IConnectionType} from "./connectionType.js";
import {getEntitiesPostgresORM} from "./ORM/postgresEntities.js";

export const getEntities = (orm : IConnectionType["serverName"]) => {
    switch (orm){
        case "postgres":
            return getEntitiesPostgresORM
        case "mysql":
            return null
    }
}