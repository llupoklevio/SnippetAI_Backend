import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class UserSession {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: "varchar", length: 255})
    refreshToken!: string;

    @Column({ type: "timestamp" })
    expiresAt!: Date;
}