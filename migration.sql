CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"reviewer_name" text NOT NULL,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"verified_purchase" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("rating" between 1 and 5)
);
