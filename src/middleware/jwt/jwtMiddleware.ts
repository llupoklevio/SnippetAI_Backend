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
        if(!err) next()

        return next(new ErrorResponse("JWT_ERROR","Token",`${err.message}`))

    })
}