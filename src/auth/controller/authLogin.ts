import {Request, Response} from "express"
import {registerDTO} from "../type/registerDTO.js";
import {getContainer} from "../../ContainerAwilix/CompositionRoot.js";

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

    const { loginService } = getContainer().cradle
    const userLogged = await loginService.LogUser(dataToLogin)
    req.log.info(`${dataToLogin.email} si è loggato`)

    /** DTO per non mostrare password */
    const userDTO = {...userLogged, user: await registerDTO.parseAsync(userLogged.user)}

    res.json({
        message: "success",
        session: userDTO,
    })
}