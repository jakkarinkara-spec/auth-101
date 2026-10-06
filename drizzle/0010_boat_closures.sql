CREATE TABLE "boat_closures" (
	"id" text PRIMARY KEY NOT NULL,
	"boat_id" text NOT NULL,
	"date" date NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "boat_closures" ADD CONSTRAINT "boat_closures_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "boat_closures_boat_date" ON "boat_closures" USING btree ("boat_id","date");