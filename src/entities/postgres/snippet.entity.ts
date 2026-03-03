import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {User} from "./user.entity.js";

@Entity()
export class Snippet {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 255})
    title!: string;

    @Column({type: 'text'})
    code!: string

    @Column({type: 'varchar', length: 255, nullable: true})
    description?: string;

    @CreateDateColumn({ type: "timestamp" })
    dateCreation!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    dateUpdate!: Date;

    @ManyToOne(() => User, (user) => user.personalSnippets)
    snippetOwner!: User;
}