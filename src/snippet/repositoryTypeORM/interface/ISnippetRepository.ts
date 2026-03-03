import {Snippet} from "../../../entities/postgres/snippet.entity.js";

export interface ISnippetRepository {
    save(snippet : Snippet): Promise<Snippet>
}