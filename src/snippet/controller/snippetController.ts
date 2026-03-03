import {Response} from "express";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {getContainer} from "../../ContainerAwilix/CompositionRoot.js";
import {typeCreateSnippetValidator} from "../type/validatorPostSnippet.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";

export const postSnippet = async (req: RequestJWT, res: Response) => {

    /** validator verificated
     *
     * verificata title: lunghezza minima di 1 richiesta
     * verificata code: lunghezza minima di 1 richiesta
     * verificata description: opzionale, e lunghezza di minimo 20 richiesta
     *
     * **/

    const email = req.auth?.email
    const idUser = req.auth?.idUser

    if(!email || !idUser){
        throw new ErrorResponse("JWT_ERROR","BusinessLogic","Problem with JWT: see if you sending token")
    }

    /** prendo i dati dal validator */
    const SnippetToSave: typeCreateSnippetValidator = (req as any).validDataBody

    req.log.info(`${email} sta tentando di scrivere uno snippet`)

    /** chiamo il service per il business logic */
    const { snippetService } = getContainer().cradle
    await snippetService.createSnippet(SnippetToSave, {email, idUser} as RequestJWT["auth"])

}