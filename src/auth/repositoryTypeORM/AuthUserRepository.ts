import {IAuthUserRepository} from "./interface/IauthUserRepository.js";
import {User} from "../../entities/postgres/user.entity.js";
import {DataSource} from "typeorm";

export class AuthUserRepository implements IAuthUserRepository{

    constructor(
        private readonly dataSource: DataSource,
    ){}

    findOneByEmail(email: string): Promise<User | null> {
        return this.dataSource.getRepository(User).findOneBy({
            email: email,
        })
    }

    findByEmailAndId(email: string, id: string): Promise<User | null> {
        return this.dataSource.getRepository(User).findOneBy({
            email: email,
            id: id,
        })
    }

    save(user: User): Promise<User> {
        return this.dataSource.getRepository(User).save(user)
    }
}