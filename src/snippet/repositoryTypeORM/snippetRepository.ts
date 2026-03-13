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

    async getSingleSnippet(snippetId: number, idUser: string): Promise<Snippet | null> {
        return this.dataSource.getRepository(Snippet).findOne({
            relations:['snippetOwner'],
            where: {
                id: snippetId,
                snippetOwner: {
                    id: idUser,
                }
            }
        })
    }

    async getAllSnippet(id: string): Promise<Snippet[]> {
        return this.dataSource.getRepository(Snippet).find({
            relations: ['snippetOwner'],
            where: {
                snippetOwner: {
                    id: id
                }
            }
        })
    }

}