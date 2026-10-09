CREATE TYPE "public"."owner_profile_edit_status" AS ENUM('approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TABLE "owner_profile_edits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"before" jsonb NOT NULL,
	"requested" jsonb NOT NULL,
	"status" "owner_profile_edit_status" NOT NULL,
	"reject_reason" text,
	"decided_by" text,
	"submitted_at" timestamp NOT NULL,
	"decided_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "owner_profile_edits" ADD CONSTRAINT "owner_profile_edits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_profile_edits" ADD CONSTRAINT "owner_profile_edits_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;