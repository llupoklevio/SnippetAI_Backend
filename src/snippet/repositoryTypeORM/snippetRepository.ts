import {ISnippetRepository} from "./interface/ISnippetRepository.js";
import {Snippet} from "../../entities/postgres/snippet.entity.js";
import {DataSource} from "typeorm";


export class SnippetRepository implements ISnippetRepository{

    constructor(
        private readonly dataSource: DataSource,
    ){}

    async save(snippet: Snippet): Promise<Snippet> {
         return this.dataSource.getRepository(Snippet).save(snippet)
    }
}