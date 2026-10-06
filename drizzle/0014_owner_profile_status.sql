CREATE TYPE "public"."owner_profile_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "owner_profiles" ADD COLUMN "status" "owner_profile_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "owner_profiles" ADD COLUMN "decided_at" timestamp;