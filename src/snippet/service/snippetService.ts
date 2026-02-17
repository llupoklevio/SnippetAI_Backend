import {Repository} from "typeorm";
import {Snippet} from "../../entities/postgres/snippet.entity.js";

export class SnippetService {
    constructor(
        private repository: Repository<Snippet>
    ) {}

    async createSnippet(data: { title: string; code: string; description: string }) {

        const snippet = new Snippet()
        snippet.title = data.title
        snippet.code = data.code
        snippet.description = data.description

        return await this.repository.save(snippet)
    }
}