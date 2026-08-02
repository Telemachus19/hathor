CREATE TABLE IF NOT EXISTS "commerce"."carts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commerce"."cart_items" ADD CONSTRAINT "cart_items_user_id_carts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "commerce"."carts"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
