const reviewLabels = new Set(["Testimonials", "Reviews"]);

function updateReviewNavigation(root = document) {
  root.querySelectorAll("a, button").forEach((element) => {
    const label = element.textContent.trim();
    if (!reviewLabels.has(label)) return;
    if (label !== "Reviews") element.textContent = "Reviews";
    if (element.dataset.reviewsLink !== "true") element.dataset.reviewsLink = "true";
    if (element.tagName === "A") element.href = "/reviews.html";
  });
}

function replaceTestimonials() {
  const section = document.querySelector("#testimonials");
  if (!section || section.dataset.reviewReplacement === "true") return;

  section.dataset.reviewReplacement = "true";
  section.className = "reviews-home-cta";
  section.innerHTML = `
    <div class="reviews-home-glow"></div>
    <div class="reviews-home-copy">
      <span class="reviews-home-label">Purchase-based reviews</span>
      <h2>Already tried one of our picks?</h2>
      <p>Choose the product you bought and share an honest review to help the next shopper.</p>
    </div>
    <a class="reviews-home-button" href="/reviews.html"><span>Write a product review</span><span aria-hidden="true">→</span></a>
  `;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-reviews-link='true']");
  if (!target) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.location.assign("/reviews.html");
}, true);

const observer = new MutationObserver(() => {
  updateReviewNavigation();
  replaceTestimonials();
});

observer.observe(document.documentElement, { childList: true, subtree: true });
updateReviewNavigation();
replaceTestimonials();
