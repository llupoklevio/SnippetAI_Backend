import {Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn} from "typeorm";
import {User} from "./user.entity.js";

@Entity()
export class Snippet {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 255})
    title!: string;

    @Column({type: 'text'})
    code!: string

    @Column({type: 'text', nullable: true})
    description?: string | null;

    @CreateDateColumn({ type: "timestamptz" })
    dateCreation!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    dateUpdate!: Date;

    @ManyToOne(() => User, (user) => user.personalSnippets)
    snippetOwner!: Relation<User>;
}