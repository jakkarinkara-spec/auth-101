CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."trip_type" AS ENUM('half', 'full', 'night');--> statement-breakpoint
CREATE TABLE "boats" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"port" text NOT NULL,
	"length_m" integer NOT NULL,
	"seats" integer NOT NULL,
	"kind" text NOT NULL,
	"captain" text NOT NULL,
	"description" text,
	"engine" text,
	"equipment" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"price_half" integer,
	"price_full" integer,
	"price_night" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"boat_id" text NOT NULL,
	"trip_type" "trip_type" NOT NULL,
	"trip_date" date NOT NULL,
	"guests" integer NOT NULL,
	"addons" text[] DEFAULT '{}'::text[] NOT NULL,
	"total" integer NOT NULL,
	"deposit" integer NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_boat_date_active" ON "bookings" USING btree ("boat_id","trip_date") WHERE "bookings"."status" <> 'cancelled';