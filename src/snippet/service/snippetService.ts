import {ISnippetRepository} from "../repositoryTypeORM/interface/ISnippetRepository.js";
import {typeCreateSnippetValidator} from "../type/validatorPostSnippet.js";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {IAuthUserRepository} from "../../auth/repositoryTypeORM/interface/IauthUserRepository.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {Snippet} from "../../entities/postgres/snippet.entity.js";
import {QueueBase} from "../../bullMQ/base/queueBase.js";
import {TypeForDescriptionAIWorker} from "../type/responseSnippet.js";
import {Chroma} from "@langchain/community/vectorstores/chroma";
import {OpenAIEmbeddings} from "@langchain/openai";

export class SnippetService {

    private readonly _embeddings : OpenAIEmbeddings

    constructor(
        private snippetRepository: ISnippetRepository,
        private userRepository: IAuthUserRepository,
        private RAGSnippetQueue: QueueBase<Snippet>,
        private DescriptionAIQueue: QueueBase<TypeForDescriptionAIWorker>
    ) {
        this._embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large"
        })
    }

    private getVector = (id: string) : Chroma => {

            return new Chroma(this._embeddings, {
                collectionName: `RagSnippetWorker${id}`
            })
    }

    async getSnippets(auth: RequestJWT["auth"]){
        const {email,idUser} = auth!

        const user = await this.userRepository.findByEmailAndId(email,idUser)
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        return await this.snippetRepository.getAllSnippet(idUser) as Snippet[]
    }

    async getSingleSnippet(auth: RequestJWT["auth"], idSnippet : number){
        const {email,idUser} = auth!

        const user = await this.userRepository.findByEmailAndId(email,idUser)
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        const snippet = await this.snippetRepository.getSingleSnippet(idSnippet,idUser)
        if(!snippet) throw new ErrorResponse("NOT_FOUND","BusinessLogic","Snippet Not Found")

        return snippet
    }

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

            await this.RAGSnippetQueue.add("create_RAG", snippetSaved)
            operationWorker = "RAG"

        } else {

            await this.DescriptionAIQueue.add("CreateDescriptionAI", {
                id: snippetSaved.id,
                code: snippetSaved.code,
            })
            operationWorker = "DESCRIPTIONAI"

        }

        return {
            snippet: snippetSaved,
            operation: operationWorker
        }
    }

    /** PATCH PARZIALE */

    async patchSnippet(snippet: Partial<Snippet>,auth: RequestJWT["auth"],idSnippet: number){

        const {email,idUser} = auth!

        const user = await this.userRepository.findByEmailAndId(email,idUser)
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        const snippetToUpdate = await this.getSingleSnippet(auth,idSnippet)
        /**
         * Prende solo il singolo snippet che appartiene all'utente
         * Eccezione se non appartiene allo user lo snippet
         **/

        Object.assign(snippetToUpdate,snippet)

        return this.snippetRepository.save(snippetToUpdate)
    }

    async addDescriptionAI(idSnippet : number, auth: RequestJWT["auth"] , descriptionAI : string) {

        const snippetToAddDesc = await this.getSingleSnippet(auth!,idSnippet)

        /**
         * Prende solo il singolo snippet che appartiene all'utente
         * Eccezione se non appartiene allo user lo snippet
         **/

        snippetToAddDesc.description = descriptionAI

        const snippetSaved = await this.snippetRepository.save(snippetToAddDesc)

        await this.RAGSnippetQueue.add("create_RAG", snippetSaved)

        return snippetSaved

    }

    async similaritySearch(auth: RequestJWT["auth"], query: string){

        const {email,idUser} = auth!

        const user = await this.userRepository.findByEmailAndId(email,idUser)
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        const vectorSearch = this.getVector(user.id)

        const resultByVDB = await vectorSearch.similaritySearchWithScore(query, 10, {
            creator: user.email,
        })

        console.log(resultByVDB)

        /** Mi restituisce solo i personali snipppet */

        const minScore = Math.min(...resultByVDB.map(([, score]) => score))

        if(minScore > 1.2){
           throw new ErrorResponse("NOT_FOUND","BusinessLogic","Snippets Not Found")
        }

        const resultSnippetToSave = resultByVDB.filter(([doc, score]) =>  score <= minScore * 1.2 && doc.metadata.creator === user.email).map(doc => {
            return doc[0].metadata.snippetId
        }) as number[]

        return this.snippetRepository.getSnippetsById(resultSnippetToSave)
    }

}