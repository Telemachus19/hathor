CREATE SCHEMA "catalog";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog"."game_tags" (
	"game_id" uuid NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "game_tags_game_id_tag_id_pk" PRIMARY KEY("game_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog"."games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_description" text NOT NULL,
	"full_description" text NOT NULL,
	"price_egp" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"discount_percent" integer DEFAULT 0,
	"banner_url" text,
	"screenshots" text[],
	"trailer_url" text,
	"system_requirements" jsonb DEFAULT '{}'::jsonb,
	"page_theme" jsonb DEFAULT '{}'::jsonb,
	"status" varchar(20) DEFAULT 'draft',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog"."tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_games_slug" ON "catalog"."games" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_games_status_price" ON "catalog"."games" ("status","price_egp");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."game_tags" ADD CONSTRAINT "game_tags_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "catalog"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."game_tags" ADD CONSTRAINT "game_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "catalog"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
