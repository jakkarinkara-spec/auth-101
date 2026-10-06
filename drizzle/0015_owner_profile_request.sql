CREATE TYPE "public"."owner_profile_request" AS ENUM('new', 'edit', 'resubmit');--> statement-breakpoint
ALTER TABLE "owner_profiles" ADD COLUMN "request_type" "owner_profile_request" DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "owner_profiles" ADD COLUMN "approved_data" jsonb;--> statement-breakpoint
-- ใบสมัครที่อนุมัติไปแล้วก่อนมีคอลัมน์นี้: เก็บข้อมูลปัจจุบันเป็นชุดที่อนุมัติ
UPDATE "owner_profiles" SET "approved_data" = jsonb_build_object('fullName', "full_name", 'phone', "phone", 'address', "address") WHERE "status" = 'approved';
