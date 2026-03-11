import {Column, Entity, OneToMany, PrimaryColumn, Relation, Unique} from "typeorm";
import {UserSession} from "./userSession.js";
import {Snippet} from "./snippet.entity.js";

@Entity()
@Unique(["email"])
export class User {

    @PrimaryColumn("uuid")
    id: string = crypto.randomUUID();

    @Column({type: "varchar", length: 255})
    firstName!:string;

    @Column({type: "varchar", length: 255})
    lastName!:string;

    @Column({type: "varchar", length: 255})
    email!:string;

    @Column({type: "text"})
    password!:string;

    @OneToMany(() => UserSession, (session) => session.user, {cascade:["remove"]})
    session?: Relation<UserSession[]>;

    @OneToMany(() => Snippet, (snippet) =>  snippet.snippetOwner, {cascade:["remove"]})
    personalSnippets?: Relation<Snippet[]>
}