import {UserSession} from "../../../entities/postgres/userSession.js";

export interface IAuthUserSessionRepository {
    findByRefreshToken(refreshToken: string): Promise<UserSession | null>
    save(session: UserSession): Promise<UserSession>
}