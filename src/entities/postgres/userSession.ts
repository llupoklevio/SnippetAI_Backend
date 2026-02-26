import {Column, Entity, ManyToOne, PrimaryColumn, Relation} from "typeorm";
import {User} from "./user.entity.js";

@Entity()
export class UserSession {

    @PrimaryColumn("uuid")
    id: string = crypto.randomUUID();

    @Column({type: "varchar", length: 255})
    refreshToken!: string;

    @Column({ type: "timestamp" })
    expiresAt!: Date;

    @ManyToOne(() => User, (user) => user.session)
    user!: Relation<User>;
}