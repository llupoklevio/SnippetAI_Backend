import {Repository} from "typeorm";
import {User} from "../../entities/postgres/user.entity.js";
import {IregisterValidator} from "../type/validatorTypeRegister.js";
import * as argon2 from "argon2";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";

export class UserService {
    constructor(
        private repository: Repository<User>
    ) {}

    async registerUserDB(dataToRegister : IregisterValidator) : Promise<User> {

        const user = await this.repository.findOneBy({
            email: dataToRegister.email
        })
        if (user) {
            throw new ErrorResponse("EMAIL_ALREADY_EXISTS", "BusinessLogic", "L'email è già registrata");
        }


        /** Hashing per salvare la password hashata nel DB */
        const passwordHashed = await argon2.hash(dataToRegister.password, {
            type: argon2.argon2id,
            parallelism: 1
        })

        const userToSave : User = new User()
        userToSave.firstName= dataToRegister.firstName
        userToSave.lastName= dataToRegister.lastName
        userToSave.email = dataToRegister.email;
        userToSave.password = passwordHashed

        return await this.repository.save(userToSave)
    }
}