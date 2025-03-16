CREATE TYPE "public"."energy_rating" AS ENUM('A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'building');--> statement-breakpoint
CREATE TABLE "property" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"postal_code" text NOT NULL,
	"city" text NOT NULL,
	"country" text DEFAULT 'Deutschland',
	"coordinates" jsonb NOT NULL,
	"energy_rating" "energy_rating" DEFAULT 'C',
	"property_type" "property_type" DEFAULT 'apartment',
	"square_meters" integer,
	"year_built" integer,
	"floors" integer,
	"has_garage" boolean,
	"has_basement" boolean,
	"has_garden" boolean,
	"heating_type" text,
	"description" text,
	"owner" text NOT NULL,
	"notes" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "property" ADD CONSTRAINT "property_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;