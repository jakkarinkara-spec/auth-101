CREATE TYPE "public"."item_maintenance_request_status" AS ENUM('PENDING', 'PROCESSING', 'REVIEW_REQUESTED', 'COMPLETED', 'FAILED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "item_maintenance_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"imr_number" text NOT NULL,
	"item_count" integer DEFAULT 0 NOT NULL,
	"buyer_info" jsonb,
	"request_status" "item_maintenance_request_status" DEFAULT 'PENDING' NOT NULL,
	"submitted_as_role" text,
	"requester_email_id" text,
	"requested_by_user_name" text,
	"submitted_at" timestamp,
	"last_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "item_maintenance_requests_imr_number_unique" UNIQUE("imr_number")
);
