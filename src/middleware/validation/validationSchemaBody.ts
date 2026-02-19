import {NextFunction, Request, Response} from "express";
import {z, ZodError} from "zod";

export const validationSchemaBody = (schema : z.ZodObject<z.ZodRawShape>) =>  async (req : Request, res: Response, next: NextFunction) => {

    try{

        (res as any).validDataBody = await schema.parseAsync(req.body);

        next()

    }catch(err){
        if(err instanceof ZodError){
            return res.status(400).json({
                message: "Error - Invalid data input",
                errors: err.issues.map(err => ({
                    path: err.path,
                    message: err.message,
                }))
            })
        }else if(err instanceof Error){
            return res.status(500).json({ type: 'SERVER_ERROR_VALIDATOR', message: err.message });
        }
    }
}