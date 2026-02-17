import {Response,Request} from "express";
import {SnippetService} from "../service/snippetService.js";
import {getDataSource} from "../../type/data-source/getDataSourceByEnv.js";
import {Snippet} from "../../entities/postgres/snippet.entity.js";


export const postSnippet = async (_req: Request, res: Response) => {

    const CreateSnippet = new SnippetService(getDataSource().getRepository(Snippet));

    await CreateSnippet.createSnippet({
        code: "g",
        title: "g",
        description: "g",
    })

    res.json({
        message: "ok"
    })
}