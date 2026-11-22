import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { reviews } from "../../db/schema.js";
import { productCatalog } from "../../assets/product-catalog.js";

const products = new Map(productCatalog.map(({ id, name }) => [id, name]));

const jsonHeaders = { "cache-control": "no-store" };
const maxRequestBytes = 4_096;

const errorResponse = (message: string, status: number) =>
  Response.json({ error: message }, { status, headers: jsonHeaders });

export default async (request: Request) => {
  if (request.method === "GET") {
    const savedReviews = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productName: reviews.productName,
        reviewerName: reviews.reviewerName,
        rating: reviews.rating,
        body: reviews.body,
        verifiedPurchase: reviews.verifiedPurchase,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .orderBy(desc(reviews.createdAt))
      .limit(100);

    return Response.json({ reviews: savedReviews }, { headers: jsonHeaders });
  }

  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405, headers: { ...jsonHeaders, allow: "GET, POST" } },
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxRequestBytes) {
    return errorResponse("Review details are too large.", 413);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return errorResponse("Send review details as JSON.", 415);
  }

  let rawPayload: string;
  try {
    rawPayload = await request.text();
  } catch {
    return errorResponse("Enter valid review details.", 400);
  }

  if (new TextEncoder().encode(rawPayload).byteLength > maxRequestBytes) {
    return errorResponse("Review details are too large.", 413);
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return errorResponse("Enter valid review details.", 400);
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return errorResponse("Enter valid review details.", 400);
  }

  if (typeof payload.website === "string" && payload.website.length > 0) {
    return errorResponse("Review could not be submitted.", 400);
  }

  const productId = typeof payload.productId === "string" ? payload.productId.trim() : "";
  const productName = products.get(productId);
  const reviewerName = typeof payload.reviewerName === "string" ? payload.reviewerName.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const rating = Number(payload.rating);

  if (!productName) return errorResponse("Select a product from the list.", 400);
  if (reviewerName.length < 2 || reviewerName.length > 50) {
    return errorResponse("Display name must be between 2 and 50 characters.", 400);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return errorResponse("Choose a rating from 1 to 5 stars.", 400);
  }
  if (body.length < 20 || body.length > 800) {
    return errorResponse("Review must be between 20 and 800 characters.", 400);
  }
  if (payload.confirmedPurchase !== true) {
    return errorResponse("Confirm that you purchased this product before reviewing it.", 400);
  }

  const [savedReview] = await db
    .insert(reviews)
    .values({
      productId,
      productName,
      reviewerName,
      rating,
      body,
      verifiedPurchase: true,
    })
    .returning();

  return Response.json({ review: savedReview }, { status: 201, headers: jsonHeaders });
};

export const config: Config = {
  path: "/api/reviews",
};
