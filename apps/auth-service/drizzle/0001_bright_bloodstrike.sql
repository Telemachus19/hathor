CREATE TABLE IF NOT EXISTS "auth"."refresh_token_families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth"."role_change_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"target_id" uuid NOT NULL,
	"change" varchar(255) NOT NULL,
	"authorization_version" integer NOT NULL,
	"correlation_id" uuid NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ADD COLUMN "family_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ADD COLUMN "used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "auth"."users" ADD COLUMN "authorization_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_family_id_refresh_token_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "auth"."refresh_token_families"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."refresh_token_families" ADD CONSTRAINT "refresh_token_families_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."role_change_audit" ADD CONSTRAINT "role_change_audit_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth"."role_change_audit" ADD CONSTRAINT "role_change_audit_target_id_users_id_fk" FOREIGN KEY ("target_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
