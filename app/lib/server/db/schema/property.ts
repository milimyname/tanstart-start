import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const energyRatingEnum = pgEnum("energy_rating", [
  "A+",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
]);

export const propertyTypeEnum = pgEnum("property_type", ["apartment", "building"]);

export const property = pgTable("property", {
  id: serial("id").primaryKey(),
  // Basic information
  address: text("address").notNull(),
  postalCode: text("postal_code").notNull(),
  city: text("city").notNull(),
  country: text("country").default("Deutschland"),
  coordinates: jsonb("coordinates").notNull(), // Stores [longitude, latitude]

  // Property characteristics
  energyRating: energyRatingEnum("energy_rating").default("C"),
  propertyType: propertyTypeEnum("property_type").default("apartment"),
  squareMeters: integer("square_meters"),
  yearBuilt: integer("year_built"),
  floors: integer("floors"),
  hasGarage: boolean("has_garage"),
  hasBasement: boolean("has_basement"),
  hasGarden: boolean("has_garden"),
  heatingType: text("heating_type"),

  // Additional info
  description: text("description"),
  owner: text("owner").notNull(),
  notes: text("notes"),

  // Metadata
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});
