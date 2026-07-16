CREATE SCHEMA "library";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library"."user_licenses" (
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"source_order_id" uuid NOT NULL,
	"price_paid_egp" numeric(10, 2) NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_licenses_user_id_game_id_pk" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library"."user_wishlists" (
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_wishlists_user_id_game_id_pk" PRIMARY KEY("user_id","game_id")
);
