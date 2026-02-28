import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {DateTime} from "luxon";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import jwt from 'jsonwebtoken';
import {IAuthUserRepository} from "../repositoryTypeORM/interface/IauthUserRepository.js";
import {IAuthUserSessionRepository} from "../repositoryTypeORM/interface/IauthUserSessionRepository.js";

export class RefreshService {

    constructor(
        private userSessionRepository: IAuthUserSessionRepository,
        private userRepository: IAuthUserRepository,
    ){}

    async getAccessToken(refreshToken : string, auth: RequestJWT["auth"]){

        const user = await this.userRepository.findByEmailAndId(auth!.email, auth!.idUser)
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        const session = await this.userSessionRepository.findByRefreshToken(refreshToken)
        if(!session) throw new ErrorResponse("NOT_FOUND","BusinessLogic","Token Not Found")

        if(DateTime.fromJSDate(session.expiresAt) < DateTime.now())
            throw new ErrorResponse("NOT_FOUND","BusinessLogic","Token Not Found")

        /** token esistente e valido */
        const payload : RequestJWT["auth"] = {
            idUser: auth?.idUser!,
            email: auth?.email!,
        }

       return jwt.sign(payload, process.env.SECRET_JWT!,{expiresIn: Number(process.env.JWT_ACC_EXPIRES_MIN) * 60})

    }
}