CREATE TABLE IF NOT EXISTS "library"."entitlement_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game_id" uuid,
	"action" varchar(50) NOT NULL,
	"actor" varchar(50) NOT NULL,
	"correlation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library"."outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"publish_attempts" integer DEFAULT 0 NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"last_error" varchar(255),
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "library"."processed_events" ADD COLUMN "event_type" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "library"."processed_events" ADD COLUMN "correlation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "library"."user_licenses" ADD COLUMN "fulfillment_event_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "library"."user_licenses" ADD COLUMN "currency" varchar(5) NOT NULL;