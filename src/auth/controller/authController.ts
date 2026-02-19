import {Request, Response} from "express";
import {IregisterValidator} from "../type/validatorTypeRegister.js";
import {User} from "../../entities/postgres/user.entity.js";
import {getDataSource} from "../../type/data-source/getDataSourceByEnv.js";
import {UserService} from "../service/userService.js";
import {registerDTO, typeRegisterDTO} from "../type/registerDTO.js";


export const register = async (req: Request, res: Response) => {
    /** validator verificated
     *
     * password ha una lunghezza minima di 6 , alemno una lettera maiuscola e almeno un numero
     * nome ha una lunghezza minimo di 1
     * cognome una lunghezza minimo di 1
     * email una lunghezza minima di 6, formato email
     *
     * **/

    const dataToRegister : IregisterValidator = (req as any).validDataBody

    req.log.info(`${dataToRegister.email} sta tentando di registrarsi`)

    const userSaved = await new UserService(getDataSource().getRepository(User)).registerUserDB(dataToRegister)

    /** Si elimina password dall'oggetto di ritorno **/
    const userResponse : typeRegisterDTO = await registerDTO.parseAsync(userSaved)
    req.log.info(`${userResponse.email} si è registrato`)

    res.status(200).json({
        user: userResponse
    })

}
