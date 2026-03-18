import {z, ZodError} from "zod";
import {NextFunction, Request, Response} from "express";

export const validationSchemaParams = (params : z.ZodObject<z.ZodRawShape>) => async (req : Request, res: Response, next: NextFunction) => {
    
    try{

        (req as any).params = await params.parseAsync(req.params);
        next()

    }catch(err){

        if(err instanceof ZodError){

            const errors = err.errors.map(err => ({
                 error: err.message,
            }))

            return res.status(400).json(errors)

        }else if(err instanceof Error){

            return res.status(500).json({ type: 'SERVER_ERROR_VALIDATOR', message: err.message });

        }
    }
}
