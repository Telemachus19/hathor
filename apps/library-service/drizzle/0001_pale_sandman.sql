CREATE TABLE IF NOT EXISTS "library"."processed_events" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now()
);
