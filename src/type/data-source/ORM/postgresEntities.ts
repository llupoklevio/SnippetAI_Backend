import {Snippet} from "../../../entities/postgres/snippet.entity.js";
import {User} from "../../../entities/postgres/user.entity.js";
import {UserSession} from "../../../entities/postgres/userSession.js";

export const getEntitiesPostgresORM = [
    Snippet,
    User,
    UserSession
]
