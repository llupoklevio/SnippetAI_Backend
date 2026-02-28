import {IAuthUserSessionRepository} from "./interface/IauthUserSessionRepository.js";
import {UserSession} from "../../entities/postgres/userSession.js";
import {DataSource} from "typeorm";

export class AuthUserSessionRepository implements IAuthUserSessionRepository {

    constructor(
        private readonly dataSource: DataSource
    ) {}

    findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
        return this.dataSource.getRepository(UserSession).findOneBy({
            refreshToken,
        })
    }

    save(session: UserSession): Promise<UserSession> {
        return this.dataSource.getRepository(UserSession).save(session)
    }
}