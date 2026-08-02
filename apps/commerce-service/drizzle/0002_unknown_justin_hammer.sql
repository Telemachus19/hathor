CREATE TABLE IF NOT EXISTS "commerce"."idempotency_records" (
	"key" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"order_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commerce"."order_state_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" varchar(30),
	"to_status" varchar(30) NOT NULL,
	"correlation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "commerce"."orders" ALTER COLUMN "status" SET DEFAULT 'payment_pending';--> statement-breakpoint
ALTER TABLE "commerce"."order_items" ADD COLUMN "title_snapshot" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."order_items" ADD COLUMN "price_version_snapshot" varchar(50);--> statement-breakpoint
ALTER TABLE "commerce"."order_items" ADD COLUMN "currency" varchar(5) DEFAULT 'EGP' NOT NULL;--> statement-breakpoint
ALTER TABLE "commerce"."orders" ADD COLUMN "idempotency_key" varchar(36);--> statement-breakpoint
ALTER TABLE "commerce"."orders" ADD COLUMN "cart_version" integer;--> statement-breakpoint
ALTER TABLE "commerce"."orders" ADD COLUMN "currency" varchar(5) DEFAULT 'EGP' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commerce"."idempotency_records" ADD CONSTRAINT "idempotency_records_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "commerce"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commerce"."order_state_transitions" ADD CONSTRAINT "order_state_transitions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "commerce"."orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "commerce"."orders" ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key");