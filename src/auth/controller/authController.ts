import {Request, Response} from "express";
import {IregisterValidator} from "../type/validatorTypeRegister.js";
import * as argon2 from "argon2";
import {User} from "../../entities/postgres/user.entity.js";
import {getDataSource} from "../../type/data-source/getDataSourceByEnv.js";
import {UserService} from "../service/userService.js";
import {registerDTO, typeRegisterDTO} from "../type/registerDTO.js";

const userRepository = getDataSource().getRepository(User)

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

    /** Hashing per salvare la password hashata nel DB */
    const passwordHashed = await argon2.hash(dataToRegister.password, {
        type: argon2.argon2id,
        parallelism: 1
    })

    const userService = new UserService(userRepository)
    const userSaved = await userService.registerUserDB(dataToRegister,passwordHashed)

    /** Si elimina password dall'oggetto di ritorno **/
    const userResponse : typeRegisterDTO = await registerDTO.parseAsync(userSaved)

    res.status(200).json({
        user: userResponse
    })

}
