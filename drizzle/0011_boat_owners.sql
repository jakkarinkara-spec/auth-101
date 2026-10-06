CREATE TYPE "public"."owner_application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'owner';--> statement-breakpoint
CREATE TABLE "owner_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"boat_id" text NOT NULL,
	"phone" text NOT NULL,
	"note" text,
	"status" "owner_application_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"decided_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "boats" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "owner_applications" ADD CONSTRAINT "owner_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_applications" ADD CONSTRAINT "owner_applications_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "owner_applications_pending" ON "owner_applications" USING btree ("user_id","boat_id") WHERE "owner_applications"."status" = 'pending';--> statement-breakpoint
ALTER TABLE "boats" ADD CONSTRAINT "boats_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;