import {ISnippetRepository} from "../repositoryTypeORM/interface/ISnippetRepository.js";
import {typeCreateSnippetValidator} from "../type/validatorPostSnippet.js";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {IAuthUserRepository} from "../../auth/repositoryTypeORM/interface/IauthUserRepository.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {Snippet} from "../../entities/postgres/snippet.entity.js";
import {QueueBase} from "../../bullMQ/base/queueBase.js";
import {TypeForDescriptionAIWorker} from "../type/responseSnippet.js";

export class SnippetService {
    constructor(
        private snippetRepository: ISnippetRepository,
        private userRepository: IAuthUserRepository,
        private RAGSnippetQueue: QueueBase<Snippet>,
        private DescriptionAIQueue: QueueBase<TypeForDescriptionAIWorker>
    ) {}

    async createSnippet(snippet : typeCreateSnippetValidator, auth: RequestJWT["auth"] ) {

        const {email,idUser} = auth!

        const user = await this.userRepository.findByEmailAndId(email,idUser)
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        /** user esiste
         *
         * Popolamento di snippetPost
         *
         * */

        const snippetToCreate = new Snippet()
        snippetToCreate.snippetOwner = user
        Object.assign(snippetToCreate,snippet)

        const snippetSaved = await this.snippetRepository.save(snippetToCreate)

        /** snipped created
         *
         * Inizio RAG
         *
         * */

        let operationWorker : "RAG" | "DESCRIPTIONAI"

        if(snippetSaved.description) {

            await this.RAGSnippetQueue.add("create_RAG", snippetToCreate)
            operationWorker = "RAG"

        } else {

            await this.DescriptionAIQueue.add("CreateDescriptionAI", {
                id: snippetToCreate.id,
                code: snippetToCreate.code,
            })
            operationWorker = "DESCRIPTIONAI"

        }

        return {
            snippet: snippetSaved,
            operation: operationWorker
        }
    }
}