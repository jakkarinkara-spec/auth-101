ALTER TABLE "owner_applications" DROP CONSTRAINT "owner_applications_boat_id_boats_id_fk";
--> statement-breakpoint
DROP INDEX "owner_applications_pending";--> statement-breakpoint
ALTER TABLE "owner_applications" ALTER COLUMN "boat_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "owner_applications" ADD COLUMN "boat_data" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "owner_applications" ADD CONSTRAINT "owner_applications_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE set null ON UPDATE no action;