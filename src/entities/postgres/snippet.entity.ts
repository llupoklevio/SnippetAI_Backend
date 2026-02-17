import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Snippet {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    code!: string

    @Column()
    description!: string;

    @CreateDateColumn()
    dateCreation!: Date;

    @UpdateDateColumn()
    dateUpdate!: Date;
}