import {User} from "../../../entities/postgres/user.entity.js";

export interface IAuthUserRepository {
    findOneByEmail(email: string) : Promise<User | null>
    findByEmailAndId(email: string, id: string): Promise<User | null>
    save(user: User): Promise<User>
}