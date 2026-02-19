import {Repository} from "typeorm";
import {User} from "../../entities/postgres/user.entity.js";
import {IregisterValidator} from "../type/validatorTypeRegister.js";

export class UserService {
    constructor(
        private repository: Repository<User>
    ) {}

    async registerUserDB(dataToRegister : IregisterValidator, passwordHashed: string) : Promise<User> {

        const userToSave : User = new User()
        userToSave.firstName= dataToRegister.firstName
        userToSave.lastName= dataToRegister.lastName
        userToSave.email = dataToRegister.email;
        userToSave.password = passwordHashed

        return await this.repository.save(userToSave)
    }
}