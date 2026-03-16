import {Response} from "express";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {getContainer} from "../../ContainerAwilix/CompositionRoot.js";
import {
    typeCreateSnippetValidator,
    typeDescAIValidator,
    typeIdSnippetValidator,
    typeValidatorQuerySearch
} from "../type/validatorPostSnippet.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {
    IResponseSnippet,
    IResponseSnippets,
    ResponsePostSnippet,
    ResponseGetSnippets
} from "../type/responseSnippet.js";
import {Snippet} from "../../entities/postgres/snippet.entity.js";

export const getSingleSnippets = async (req: RequestJWT, res: Response) => {
    const email = req.auth?.email
    const idUser = req.auth?.idUser
    const {idSnippet} = (req as any).params

    if(!email || !idUser){
        throw new ErrorResponse("JWT_ERROR","BusinessLogic","Problem with JWT: see if you sending token")
    }

    const {snippetService} = getContainer().cradle
    const snippet : Snippet = await snippetService.getSingleSnippet({email, idUser} as RequestJWT["auth"], Number(idSnippet))

    const responseSnippetDTO : IResponseSnippet = await ResponsePostSnippet.parseAsync(snippet)

    res.json({
        snippet: responseSnippetDTO
    })
}

/** Per la V2
 *
 * Prendere gli snippet direttamente da user (personal Snippet)
 * Rendere getSnippets un API per vedere tutti gli snippet degli user iscritti
 *
 * */

export const getSnippets = async (req: RequestJWT, res: Response) => {

    const email = req.auth?.email
    const idUser = req.auth?.idUser

    if(!email || !idUser){
        throw new ErrorResponse("JWT_ERROR","BusinessLogic","Problem with JWT: see if you sending token")
    }

    req.log.info(`${email} sta ricevendo i propri snippet`)

    const {snippetService} = getContainer().cradle
    const snippets  = await snippetService.getSnippets({email, idUser} as RequestJWT["auth"])

    const responseSnippetsDTO : IResponseSnippets = await ResponseGetSnippets.parseAsync(snippets)

    res.json({
        snippets: responseSnippetsDTO
    })
}

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

    /** Manca salvataggio di descrizione su DB e dello snippet su VDB */
    if(snippetResult.operation === "DESCRIPTIONAI")
        req.log.info(`${email} sta facendo la descrizione dello snippet tramite AI `)

    const responseSnippet : IResponseSnippet = await ResponsePostSnippet.parseAsync(snippetResult.snippet)

    res.json({
        snippet: responseSnippet,
        message: snippetResult.operation,
    })

}

export const saveSnippetWithDescriptionAI = async (req: RequestJWT, res: Response) => {

    const email = req.auth?.email
    const idUser = req.auth?.idUser

    if(!email || !idUser){
        throw new ErrorResponse("JWT_ERROR","BusinessLogic","Problem with JWT: see if you sending token")
    }

    /** prendiamo i parametri e il body datosi dal validator */

    const {description} : typeDescAIValidator = (req as any).validDataBody
    const {idSnippet} : typeIdSnippetValidator= (req as any).params

    req.log.info(`${email} inizia a salvare la descrizione sul db `)

    /**
     * Prendiamo dal DB lo snippet
     * Aggiungiamo la descrizione
     * Una volta salvato nel DB, lo salviamo pure nel VDB
     **/

    const {snippetService} = getContainer().cradle
    const responseSnippet = await snippetService.addDescriptionAI(idSnippet,{email,idUser} as RequestJWT["auth"],description)

    const responseSnippetDTO : IResponseSnippet = await ResponsePostSnippet.parseAsync(responseSnippet)

    res.json({
        snippet: responseSnippetDTO,
    })

}

export const SearchVectorDbSnippet = async (req: RequestJWT, res: Response) => {

    const email = req.auth?.email
    const idUser = req.auth?.idUser

    if(!email || !idUser){
        throw new ErrorResponse("JWT_ERROR","BusinessLogic","Problem with JWT: see if you sending token")
    }

    const {query} : typeValidatorQuerySearch = (req as any).validDataBody

    req.log.info(`${email} sta facendo una ricerca semantica`)

    const {snippetService} = getContainer().cradle
    const snippets = await snippetService.similaritySearch({email,idUser} as RequestJWT["auth"],query)

    const responseSnippetsDTO : IResponseSnippets = await ResponseGetSnippets.parseAsync(snippets)

    res.json({
        snippets: responseSnippetsDTO
    })
}