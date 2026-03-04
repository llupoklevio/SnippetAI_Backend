import {Response} from "express";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {getContainer} from "../../ContainerAwilix/CompositionRoot.js";
import {typeCreateSnippetValidator} from "../type/validatorPostSnippet.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {IResponseSnippet, ResponsePostSnippet} from "../type/responseSnippet.js";

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
    const snippetResult = await snippetService.createSnippet(SnippetToSave, {email, idUser} as RequestJWT["auth"])

    if(snippetResult.operation === "RAG")
        req.log.info(`${email} ha scritto lo snippet sia in DB che nel VDB`)

    /** Manca salvataggio di descrizione su db e dello snippet su VDB */
    if(snippetResult.operation === "DESCRIPTIONAI")
        req.log.info(`${email} sta facendo la descrizione dello snippet tramite AI `)


    const responseSnippet : IResponseSnippet = await ResponsePostSnippet.parseAsync(snippetResult.snippet)

    res.json({
        snippet: responseSnippet,
        message: snippetResult.operation,
    })


}