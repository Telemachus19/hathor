CREATE TABLE IF NOT EXISTS "catalog"."catalog_recommendation_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"context_game_id" uuid,
	"ranked_game_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source" varchar(50) DEFAULT 'cached' NOT NULL,
	"refreshed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog"."game_embeddings" (
	"game_id" uuid PRIMARY KEY NOT NULL,
	"embedding" jsonb NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_catalog_rec_cache_context" ON "catalog"."catalog_recommendation_cache" ("context_game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_game_embeddings_game_id" ON "catalog"."game_embeddings" ("game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_games_genre_id" ON "catalog"."games" ("genre_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."catalog_recommendation_cache" ADD CONSTRAINT "catalog_recommendation_cache_context_game_id_games_id_fk" FOREIGN KEY ("context_game_id") REFERENCES "catalog"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."game_embeddings" ADD CONSTRAINT "game_embeddings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "catalog"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
