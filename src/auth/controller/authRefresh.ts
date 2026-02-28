import {Response} from "express";
import {RequestJWT} from "../../middleware/jwt/jwtMiddleware.js";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {getContainer} from "../../ContainerAwilix/CompositionRoot.js";

export const refresh = async(req: RequestJWT, res: Response) => {

    const auth : RequestJWT["auth"] = req.auth
    const authorization = req?.headers?.authorization?.split(" ")[1]

    if(!auth || !authorization){
       throw new ErrorResponse("JWT_ERROR","BusinessLogic","Problem with JWT: see if you sending token")
    }

    req.log.info(`${req?.auth?.email} sta tentando di ricreare access token`)

    const { refreshService } = getContainer().cradle
    const accessToken = await refreshService.getAccessToken(authorization,auth)

    req.log.info(`${req?.auth?.email} ha ricevuto access token`)

    res.json({
        message: "success",
        accessToken
    })
}