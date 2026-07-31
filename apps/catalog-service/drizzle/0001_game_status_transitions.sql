CREATE TABLE IF NOT EXISTS "catalog"."game_status_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"prior_status" varchar(20) NOT NULL,
	"next_status" varchar(20) NOT NULL,
	"reason" text,
	"correlation_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_game_status_transitions_game" ON "catalog"."game_status_transitions" ("game_id");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."game_status_transitions" ADD CONSTRAINT "game_status_transitions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "catalog"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
