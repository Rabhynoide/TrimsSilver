ALTER TABLE "character_skill" DROP COLUMN "fame";--> statement-breakpoint
ALTER TABLE "character_skill" ADD COLUMN "level" smallint NOT NULL;
