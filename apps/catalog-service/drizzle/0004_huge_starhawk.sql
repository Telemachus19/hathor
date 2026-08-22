CREATE TABLE IF NOT EXISTS "catalog"."game_reviews" (
	"game_id" uuid NOT NULL,
	"review_id" uuid NOT NULL,
	CONSTRAINT "game_reviews_game_id_review_id_pk" PRIMARY KEY("game_id","review_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catalog"."reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_name" varchar(100),
	"sentiment" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE "catalog"."reviews" ADD COLUMN IF NOT EXISTS "user_name" varchar(100);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_game_reviews_game_id" ON "catalog"."game_reviews" ("game_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_game_reviews_review_id" ON "catalog"."game_reviews" ("review_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reviews_user_id" ON "catalog"."reviews" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_reviews_sentiment" ON "catalog"."reviews" ("sentiment");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_games_genre_id" ON "catalog"."games" ("genre_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."game_reviews" ADD CONSTRAINT "game_reviews_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "catalog"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "catalog"."game_reviews" ADD CONSTRAINT "game_reviews_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "catalog"."reviews"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
