import { productCatalog } from "/assets/product-catalog.js";

const form = document.querySelector("#review-form");
const status = document.querySelector("#form-status");
const reviewsGrid = document.querySelector("#reviews-grid");
const reviewCount = document.querySelector("#review-count");
const bodyField = document.querySelector("#review-body");
const characterCount = document.querySelector("#character-count");
const productSelect = document.querySelector("#product");

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function populateProductSelect() {
  const requestedProduct = new URLSearchParams(window.location.search).get("product");
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select your product";

  const productsByGroup = new Map();
  const seenProductIds = new Set();

  productCatalog.forEach((product) => {
    if (seenProductIds.has(product.id)) return;
    seenProductIds.add(product.id);

    if (!productsByGroup.has(product.group)) productsByGroup.set(product.group, []);
    productsByGroup.get(product.group).push(product);
  });

  productSelect.replaceChildren(placeholder);

  productsByGroup.forEach((products, group) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = group;

    products.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = product.name;
      option.defaultSelected = product.id === requestedProduct;
      optgroup.append(option);
    });

    productSelect.append(optgroup);
  });
}

populateProductSelect();

bodyField.addEventListener("input", () => {
  characterCount.textContent = bodyField.value.length;
});

function createReviewCard(review) {
  const card = document.createElement("article");
  card.className = "review-card";

  const top = document.createElement("div");
  top.className = "review-card-top";

  const product = document.createElement("span");
  product.className = "product-pill";
  product.textContent = review.productName;

  const stars = document.createElement("span");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
  stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;

  const quote = document.createElement("p");
  quote.className = "review-copy";
  quote.textContent = review.body;

  const meta = document.createElement("div");
  meta.className = "review-meta";

  const person = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = review.reviewerName;
  const verified = document.createElement("span");
  verified.textContent = review.verifiedPurchase ? "Buyer-confirmed purchase" : "Community review";
  person.append(name, verified);

  const date = document.createElement("time");
  date.dateTime = review.createdAt;
  date.textContent = dateFormatter.format(new Date(review.createdAt));

  top.append(product, stars);
  meta.append(person, date);
  card.append(top, quote, meta);
  return card;
}

function renderReviews(reviews) {
  reviewsGrid.replaceChildren();
  reviewCount.textContent = `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;

  if (reviews.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<span>✦</span><h3>No reviews yet</h3><p>Purchased something from the product list? Be the first to share an honest review.</p>";
    reviewsGrid.append(empty);
    return;
  }

  reviews.forEach((review) => reviewsGrid.append(createReviewCard(review)));
}

async function loadReviews() {
  try {
    const response = await fetch("/api/reviews", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Reviews are unavailable right now.");
    const data = await response.json();
    renderReviews(data.reviews);
  } catch (error) {
    reviewsGrid.replaceChildren();
    reviewCount.textContent = "Unable to load";
    const message = document.createElement("div");
    message.className = "empty-state error-state";
    message.textContent = error.message;
    reviewsGrid.append(message);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const payload = {
    productId: formData.get("productId"),
    reviewerName: formData.get("reviewerName"),
    rating: Number(formData.get("rating")),
    body: formData.get("body"),
    website: formData.get("website"),
    confirmedPurchase: formData.get("confirmedPurchase") === "on",
  };

  button.disabled = true;
  status.className = "form-status";
  status.textContent = "Publishing your review…";

  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Review could not be submitted.");

    form.reset();
    characterCount.textContent = "0";
    status.className = "form-status success";
    status.textContent = "Your review is live. Thanks for helping other shoppers.";
    await loadReviews();
    document.querySelector("#reviews-title").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    status.className = "form-status error";
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

loadReviews();
