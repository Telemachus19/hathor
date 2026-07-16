CREATE SCHEMA "commerce";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commerce"."cart_items" (
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "cart_items_user_id_game_id_pk" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commerce"."order_items" (
	"order_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"price_paid_egp" numeric(10, 2) NOT NULL,
	CONSTRAINT "order_items_order_id_game_id_pk" PRIMARY KEY("order_id","game_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commerce"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_amount_egp" numeric(10, 2) NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"payment_reference" varchar(100) NOT NULL,
	"status" varchar(30) DEFAULT 'created',
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "orders_payment_reference_unique" UNIQUE("payment_reference")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_user_status" ON "commerce"."orders" ("user_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_payment_ref" ON "commerce"."orders" ("payment_reference");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commerce"."order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "commerce"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
