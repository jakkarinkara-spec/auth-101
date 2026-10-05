CREATE TABLE "plots" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"area_rai" numeric(10, 2),
	"location" text,
	"crop_id" text,
	"planted_at" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plots" ADD CONSTRAINT "plots_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE set null ON UPDATE no action;