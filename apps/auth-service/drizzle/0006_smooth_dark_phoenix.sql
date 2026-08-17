ALTER TABLE "auth"."users" ADD COLUMN "status" varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "auth"."users" ADD COLUMN "last_login_at" timestamp with time zone;