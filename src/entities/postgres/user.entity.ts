import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryColumn({ type: "uuid", default: () => "gen_random_uuid()" })
    id!: string;

    @Column({type: "varchar", length: 255})
    firstName!:string;

    @Column({type: "varchar", length: 255})
    lastName!:string;

    @Column({type: "varchar", length: 255})
    email!:string;

    @Column({type: "varchar", length: 255})
    password!:string;

}