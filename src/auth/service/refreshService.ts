import {Repository} from "typeorm";
import {UserSession} from "../../entities/postgres/userSession.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {DateTime} from "luxon";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {User} from "../../entities/postgres/user.entity.js";
import jwt from 'jsonwebtoken';

export class RefreshService {

    constructor(
        private userSessionRepository: Repository<UserSession>,
        private userRepository: Repository<User>,
    ){}

    async getAccessToken(refreshToken : string, auth: RequestJWT["auth"]){

        const user = await this.userRepository.findOneBy({
            email: auth?.email,
            id: auth?.idUser
        })
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","User Not Found")

        const session = await this.userSessionRepository.findOneBy({
            refreshToken: refreshToken,
        })
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