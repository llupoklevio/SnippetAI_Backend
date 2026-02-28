import {Request, Response} from "express";
import {IregisterValidator} from "../type/validatorTypeRegister.js";
import {registerDTO, typeRegisterDTO} from "../type/registerDTO.js";
import {getContainer} from "../../ContainerAwilix/CompositionRoot.js";


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

    const { userService } = getContainer().cradle
    const userSaved = await userService.registerUserDB(dataToRegister)

    /** Si elimina password dall'oggetto di ritorno **/
    const userResponse : typeRegisterDTO = await registerDTO.parseAsync(userSaved)
    req.log.info(`${userResponse.email} si è registrato`)

    res.status(201).json({
        user: userResponse
    })

}
