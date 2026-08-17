CREATE TABLE IF NOT EXISTS "catalog"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog"."game_builds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"version" varchar(50) NOT NULL,
	"object_key" varchar(512) NOT NULL,
	"checksum_sha256" varchar(64) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"state" varchar(20) DEFAULT 'published' NOT NULL,
	"published_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog"."genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name"),
	CONSTRAINT "genres_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "catalog"."games" ADD COLUMN "genre_id" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_catalog_audit_target" ON "catalog"."audit_logs" ("target_type","target_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_catalog_audit_actor" ON "catalog"."audit_logs" ("actor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_game_builds_game_version" ON "catalog"."game_builds" ("game_id","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_game_builds_object_key" ON "catalog"."game_builds" ("object_key");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."games" ADD CONSTRAINT "games_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "catalog"."genres"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."game_builds" ADD CONSTRAINT "game_builds_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "catalog"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
