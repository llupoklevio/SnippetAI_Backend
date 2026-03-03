import {ISnippetRepository} from "../repositoryTypeORM/interface/ISnippetRepository.js";
import {typeCreateSnippetValidator} from "../type/validatorPostSnippet.js";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {IAuthUserRepository} from "../../auth/repositoryTypeORM/interface/IauthUserRepository.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {Snippet} from "../../entities/postgres/snippet.entity.js";


export class SnippetService {
    constructor(
        private snippetRepository: ISnippetRepository,
        private userRepository: IAuthUserRepository
    ) {}

    async createSnippet(snippet : typeCreateSnippetValidator, auth: RequestJWT["auth"] ) {

        const {email,idUser} = auth!

        const user = await this.userRepository.findByEmailAndId(email,idUser)
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        /** user esiste
         *
         * Popolamento di snippet
         *
         * */

        const snippetToCreate = new Snippet()
        Object.assign(snippetToCreate,snippet)

        /** snipped created
         *
         * Inizio RAG
         *
         * */

        
    }
}