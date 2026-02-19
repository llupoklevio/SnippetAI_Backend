import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Snippet {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 255})
    title!: string;

    @Column({type: 'text'})
    code!: string

    @Column({type: 'varchar', length: 255})
    description!: string;

    @CreateDateColumn({ type: "timestamp" })
    dateCreation!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    dateUpdate!: Date;
}