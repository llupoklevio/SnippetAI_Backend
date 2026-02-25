import {Request, Response} from "express"
import {LoginService} from "../service/loginService.js";
import {getDataSource} from "../../type/data-source/getDataSourceByEnv.js";
import {User} from "../../entities/postgres/user.entity.js";
import {UserSession} from "../../entities/postgres/userSession.js";
import {registerDTO} from "../type/registerDTO.js";

export const login = async(req: Request, res: Response) => {
    /** validator verificated
     *
     * password ha una lunghezza minima di 6 , alemno una lettera maiuscola e almeno un numero
     * email una lunghezza minima di 6, formato email
     *
     * **/

    const dataToLogin = (req as any).validDataBody;
    req.log.info(`${dataToLogin.email} sta tentando di loggarsi`)

    /**
     * Service:
     *      controllo che email è nel db
     *      che la password coincida
     *      generare token
     * */

    const userToLog = new LoginService(
        getDataSource().getRepository(User),
        getDataSource().getRepository(UserSession)
        )

    const userLogged = await userToLog.LogUser(dataToLogin)
    req.log.info(`${dataToLogin.email} si è loggato`)

    /** DTO per non mostrare password */
    const userDTO = {...userLogged, user: await registerDTO.parseAsync(userLogged.user)}

    res.json({
        message: "success",
        session: userDTO,
    })
}