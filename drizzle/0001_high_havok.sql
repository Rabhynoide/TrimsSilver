CREATE TABLE "character" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "character_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "character_skill" (
	"id" text PRIMARY KEY NOT NULL,
	"character_id" text NOT NULL,
	"skill_key" text NOT NULL,
	"fame" bigint NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "character_skill_character_skill_unique" UNIQUE("character_id","skill_key")
);
--> statement-breakpoint
ALTER TABLE "character" ADD CONSTRAINT "character_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skill" ADD CONSTRAINT "character_skill_character_id_character_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."character"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "character_userId_idx" ON "character" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "character_skill_characterId_idx" ON "character_skill" USING btree ("character_id");