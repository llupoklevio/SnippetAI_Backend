import {asClass, asValue, AwilixContainer, createContainer, InjectionMode} from "awilix";
import {UserService} from "../auth/service/userService.js";
import {LoginService} from "../auth/service/loginService.js";
import {RefreshService} from "../auth/service/refreshService.js";
import {AuthUserRepository} from "../auth/repositoryTypeORM/AuthUserRepository.js";
import {AuthUserSessionRepository} from "../auth/repositoryTypeORM/AuthUserSessionRepository.js";
import {DataSource} from "typeorm";
import {getDataSource} from "../type/data-source/getDataSourceByEnv.js";
import {SnippetRepository} from "../snippet/repositoryTypeORM/snippetRepository.js";
import {SnippetService} from "../snippet/service/snippetService.js";

let _container: AwilixContainer<Definitions> | null = null;

interface Definitions {
    dataSource: DataSource;

    /** Auth */
    userRepository: AuthUserRepository;
    userSessionRepository: AuthUserSessionRepository;
    userService: UserService;
    loginService: LoginService;
    refreshService: RefreshService;

    /** Snippet */
    snippetRepository: SnippetRepository
    snippetService: SnippetService
}
export async function buildContainer() {

    _container = createContainer<Definitions>({
        injectionMode: InjectionMode.CLASSIC,
    })

    _container.register({
        dataSource: asValue(getDataSource()),

        /** Auth */
        userRepository: asClass(AuthUserRepository).singleton(),
        userSessionRepository: asClass(AuthUserSessionRepository).singleton(),

        userService: asClass(UserService).scoped(),
        loginService: asClass(LoginService).scoped(),
        refreshService: asClass(RefreshService).scoped(),

        /** Snippet */
        snippetRepository: asClass(SnippetRepository).singleton(),

        snippetService: asClass(SnippetService).scoped(),
    })

    return _container;
}

export function getContainer() : AwilixContainer<Definitions> {
    if (!_container) throw new Error("Container non inizializzato")
    return _container;
}