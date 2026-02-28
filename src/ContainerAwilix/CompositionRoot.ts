import {asClass, asValue, AwilixContainer, createContainer, InjectionMode} from "awilix";
import {getDataSource} from "../type/data-source/getDataSourceByEnv.js";
import {User} from "../entities/postgres/user.entity.js";
import {UserSession} from "../entities/postgres/userSession.js";
import {UserService} from "../auth/service/userService.js";
import {LoginService} from "../auth/service/loginService.js";
import {RefreshService} from "../auth/service/refreshService.js";
import {Repository} from "typeorm";

let _container: AwilixContainer<Definitions> | null = null;

interface Definitions {
    userRepository: Repository<User>;
    userSessionRepository: Repository<UserSession>;
    userService: UserService;
    loginService: LoginService;
    refreshService: RefreshService;
}

export async function buildContainer() {

    const dataSource = getDataSource();

    _container = createContainer<Definitions>({
        injectionMode: InjectionMode.CLASSIC,
    })

    _container.register({
        userRepository: asValue(dataSource.getRepository(User)),
        userSessionRepository: asValue(dataSource.getRepository(UserSession)),

        userService: asClass(UserService).singleton(),
        loginService: asClass(LoginService).singleton(),
        refreshService: asClass(RefreshService).singleton(),
    })

    return _container;
}

export function getContainer() : AwilixContainer<Definitions> {
    if (!_container) throw new Error("Container non inizializzato")
    return _container;
}