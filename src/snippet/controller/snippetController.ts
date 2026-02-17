import {Response,Request} from "express";

export const createSnippet = async (_req: Request, res: Response) => {
    res.json({
        message: "ok"
    })
}