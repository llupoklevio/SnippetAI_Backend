import {NextFunction, Request, Response} from "express";
import {z, ZodError} from "zod";

export const validationSchemaBody = (schema : z.ZodObject<z.ZodRawShape>) =>  async (req : Request, res: Response, next: NextFunction) => {

    try{

        (req as any).validDataBody =  await schema.parseAsync(req.body);
        next()

    }catch(err){
        if(err instanceof ZodError){

            const errors = err.issues.map(err => ({
                path: err.path.map(p => String(p)),
                message: err.message,
            }))

            const grouped = errors.reduce((acc, error) => {
                const key = error.path[0]!
                if (!acc[key]) acc[key] = []
                acc[key].push(error.message)
                return acc
            }, {} as Record<string, string[]>)

            const responseError : IAuthValidationError = {
                message: "Error - Invalid data input",
                errors: grouped
            }

            return res.status(400).json(responseError)
        }else if(err instanceof Error){
            return res.status(500).json({ type: 'SERVER_ERROR_VALIDATOR', message: err.message });
        }
    }
}

export const AuthValidationBodyError = z.object({
    message: z.string(),
    errors: z.record(z.string(), z.array(z.string()))
})

export type IAuthValidationError = z.infer<typeof AuthValidationBodyError>;
