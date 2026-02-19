import {Request, Response} from "express";

export const register = async (req: Request, res: Response) => {

    return res.json({
        message: "ok"
    })
}
