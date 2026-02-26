import {Repository} from "typeorm";
import {User} from "../../entities/postgres/user.entity.js";
import {typeLoginValidator} from "../type/validatorTypeLogin.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import * as argon2 from "argon2";
import jwt from 'jsonwebtoken';
import {DateTime} from "luxon";
import {UserSession} from "../../entities/postgres/userSession.js";

export class LoginService {

    constructor(
     private userRepository: Repository<User>,
     private userSessioneRepository: Repository<UserSession>,
    ){}

    async LogUser(dataToLogin : typeLoginValidator) {

        const user = await this.userRepository.findOneBy({
            email: dataToLogin.email,
        })
        if(!user) throw new ErrorResponse("NOT_FOUND","BusinessLogic","user not found")

        /** user esiste, ma va verifica la password */
        const verifyPassword = await argon2.verify(user.password, dataToLogin.password)
        if(!verifyPassword) throw new ErrorResponse("NOT_FOUND","BusinessLogic","user not found")

        /** password verificata */
        const payload = {
            idUser: user.id,
            email: dataToLogin.email,
        }

        const expiredRefreshTime = Number(process.env.JWT_REF_EXPIRES_MIN) * 60

        const accessToken = jwt.sign(payload, process.env.SECRET_JWT!,{expiresIn: Number(process.env.JWT_ACC_EXPIRES_MIN) * 60})
        const refreshToken = jwt.sign(payload, process.env.SECRET_JWT!,{expiresIn: expiredRefreshTime})

        /** Calcoliamo scadenza per sessionUser */
        const expiredToken = DateTime.now().plus({ second: expiredRefreshTime });

        /** Popoliamo sessionUser */
        const userSession = new UserSession()
        userSession.expiresAt = expiredToken.toJSDate();
        userSession.refreshToken = refreshToken;
        userSession.user = user

        const userSessionSaved = await this.userSessioneRepository.save(userSession)

        return {
            refreshToken: userSessionSaved.refreshToken,
            accessToken: accessToken,
            user: userSessionSaved.user
        }

    }

}