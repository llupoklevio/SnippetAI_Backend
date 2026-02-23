import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation} from "typeorm";
import {User} from "./user.entity.js";

@Entity()
export class UserSession {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 255})
    refreshToken!: string;

    @Column({ type: "timestamp" })
    expiresAt!: Date;

    @ManyToOne(() => User, (user) => user.session)
    user!: Relation<User>;
}