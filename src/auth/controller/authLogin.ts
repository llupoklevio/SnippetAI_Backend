import {Request, Response} from "express"

export const login = async(req: Request, res: Response) => {
    /** validator verificated
     *
     * password ha una lunghezza minima di 6 , alemno una lettera maiuscola e almeno un numero
     * email una lunghezza minima di 6, formato email
     *
     * **/

    const dataToLogin = (req as any).validDataBody;
    req.log.info(`${dataToLogin.email} sta tentando di loggarsi`)

    /**
     * Service:
     *      controllo che email è nel db
     *      che la password coincida
     *      generare token
     * */

    req.log.info(`${dataToLogin.email} si è loggato`)

    res.json({
        message: "ok"
    })
}