import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772378274318 implements MigrationInterface {
    name = 'InitialSchema1772378274318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "snippetaiprod"."snippet" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "code" text NOT NULL, "description" character varying(255) NOT NULL, "dateCreation" TIMESTAMP NOT NULL DEFAULT now(), "dateUpdate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_70387b18f1ab2e9cdd22a710fcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "snippetaiprod"."user_session" ("id" uuid NOT NULL, "refreshToken" character varying(255) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_adf3b49590842ac3cf54cac451a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "snippetaiprod"."user" ("id" uuid NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" text NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "snippetaiprod"."user_session" ADD CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5" FOREIGN KEY ("userId") REFERENCES "snippetaiprod"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "snippetaiprod"."user_session" DROP CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5"`);
        await queryRunner.query(`DROP TABLE "snippetaiprod"."user"`);
        await queryRunner.query(`DROP TABLE "snippetaiprod"."user_session"`);
        await queryRunner.query(`DROP TABLE "snippetaiprod"."snippet"`);
    }

}
