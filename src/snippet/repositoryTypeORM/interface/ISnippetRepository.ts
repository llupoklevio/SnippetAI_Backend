import {Snippet} from "../../../entities/postgres/snippet.entity.js";

export interface ISnippetRepository {
    save(snippet : Snippet): Promise<Snippet>
    getAllSnippet(id: string): Promise<Snippet[]>
    getSingleSnippet(snippetId: number, idUser: string): Promise<Snippet | null>
    getSnippetsById(snippetId: number[]): Promise<Snippet[]>
}