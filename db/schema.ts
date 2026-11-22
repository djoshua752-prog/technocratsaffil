import { boolean, check, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    reviewerName: text("reviewer_name").notNull(),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    verifiedPurchase: boolean("verified_purchase").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("reviews_rating_range", sql`${table.rating} between 1 and 5`)],
);
