import 'dotenv/config';

import {expressjwt} from "express-jwt"
import {NextFunction, Request, Response} from "express"
import {ErrorResponse} from "../error/ErrorResponse.js";

export const validateTJWT = expressjwt({
    algorithms:['HS256'],
    secret: process.env.SECRET_JWT!,
    credentialsRequired: true
})

export const jwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    await validateTJWT(req, res, (err) => {
        if(!err) return next()

        return next(new ErrorResponse("JWT_ERROR","BusinessLogic",`${err.message}`))

    })
}

export interface RequestJWT extends Request {
    auth?: {
        idUser: string,
        email: string,
    }

}