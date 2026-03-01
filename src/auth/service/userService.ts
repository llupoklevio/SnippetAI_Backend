import {User} from "../../entities/postgres/user.entity.js";
import {IregisterValidator} from "../type/validatorTypeRegister.js";
import * as argon2 from "argon2";
import {ErrorResponse} from "../../middleware/error/ErrorResponse.js";
import {IAuthUserRepository} from "../repositoryTypeORM/interface/IauthUserRepository.js";

export class UserService {
    constructor(
        private userRepository: IAuthUserRepository
    ) {}

    async registerUserDB(dataToRegister : IregisterValidator) : Promise<User> {

        const user = await this.userRepository.findOneByEmail(dataToRegister.email)
        if (user) {
            throw new ErrorResponse("EMAIL_ALREADY_EXISTS", "BusinessLogic", "L'email è già registrata");
        }


        /** Hashing per salvare la password hashata nel DB */
        const passwordHashed = await argon2.hash(dataToRegister.password, {
            type: argon2.argon2id,
            parallelism: 1,
            timeCost: 3,
            memoryCost: 4096
        })

        const userToSave : User = new User()
        userToSave.firstName= dataToRegister.firstName
        userToSave.lastName= dataToRegister.lastName
        userToSave.email = dataToRegister.email;
        userToSave.password = passwordHashed

        return await this.userRepository.save(userToSave)
    }
}