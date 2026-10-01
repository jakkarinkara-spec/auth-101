DROP TABLE "item_maintenance_requests" CASCADE;--> statement-breakpoint
ALTER TABLE "crops" ADD COLUMN "day_grow" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "crops" DROP COLUMN "email";--> statement-breakpoint
DROP TYPE "public"."item_maintenance_request_status";