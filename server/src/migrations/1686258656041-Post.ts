import { MigrationInterface, QueryRunner } from "typeorm";

export class Post1686258656041 implements MigrationInterface {
    name = 'Post1686258656041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b"`);
        await queryRunner.query(`CREATE TABLE "user_subreddit" ("isModerator" boolean NOT NULL, "userId" integer NOT NULL, "subredditId" integer NOT NULL, CONSTRAINT "PK_dc07d215962af88c9862710c017" PRIMARY KEY ("userId", "subredditId"))`);
        await queryRunner.query(`CREATE TABLE "subreddit" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "rules" character varying NOT NULL, CONSTRAINT "PK_d6f6b72e517b607c8ab94204290" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_subreddit" ADD CONSTRAINT "FK_8bcb7de5f38f4ad97d983448534" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_subreddit" ADD CONSTRAINT "FK_f14ccf8af48290f00810413a5b4" FOREIGN KEY ("subredditId") REFERENCES "subreddit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_subreddit" DROP CONSTRAINT "FK_f14ccf8af48290f00810413a5b4"`);
        await queryRunner.query(`ALTER TABLE "user_subreddit" DROP CONSTRAINT "FK_8bcb7de5f38f4ad97d983448534"`);
        await queryRunner.query(`DROP TABLE "subreddit"`);
        await queryRunner.query(`DROP TABLE "user_subreddit"`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
