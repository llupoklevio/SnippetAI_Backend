import {asClass, asValue, AwilixContainer, createContainer, InjectionMode} from "awilix";
import {UserService} from "../auth/service/userService.js";
import {LoginService} from "../auth/service/loginService.js";
import {RefreshService} from "../auth/service/refreshService.js";
import {AuthUserRepository} from "../auth/repositoryTypeORM/AuthUserRepository.js";
import {AuthUserSessionRepository} from "../auth/repositoryTypeORM/AuthUserSessionRepository.js";
import {DataSource} from "typeorm";
import {getDataSource} from "../type/data-source/getDataSourceByEnv.js";

let _container: AwilixContainer<Definitions> | null = null;

interface Definitions {
    dataSource: DataSource;
    userRepository: AuthUserRepository;
    userSessionRepository: AuthUserSessionRepository;
    userService: UserService;
    loginService: LoginService;
    refreshService: RefreshService;
}
export async function buildContainer() {

    _container = createContainer<Definitions>({
        injectionMode: InjectionMode.CLASSIC,
    })

    _container.register({
        dataSource: asValue(getDataSource()),

        userRepository: asClass(AuthUserRepository).singleton(),
        userSessionRepository: asClass(AuthUserSessionRepository).singleton(),

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