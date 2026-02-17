import {getDataSource} from "../type/data-source/getDataSourceByEnv.js";
import { Snippet } from "../entities/postgres/snippet.entity.js"
import {Repository} from "typeorm";


export const snippetRepository = new Proxy({} as Repository<Snippet>, {
    get(_, prop) {
        const repo = getDataSource().getRepository(Snippet)
        return repo[prop as keyof Repository<Snippet>]
    }
})