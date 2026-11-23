import { weeklyDeals } from "./product-catalog.js";

const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
const ROTATION_START = Date.UTC(2026, 6, 20);

function getCurrentDeal() {
  const elapsedWeeks = Math.floor((Date.now() - ROTATION_START) / WEEK_IN_MILLISECONDS);
  const dealIndex = ((elapsedWeeks % weeklyDeals.length) + weeklyDeals.length) % weeklyDeals.length;

  return weeklyDeals[dealIndex];
}

function openWeeklyDeal(event) {
  const card = event.currentTarget;

  event.preventDefault();
  event.stopPropagation();
  window.open(card.dataset.weeklyDealLink, "_blank", "noopener,noreferrer");
}

function updateWeeklyDeal() {
  const heading = [...document.querySelectorAll("h1")].find((element) =>
    /^Deal of the (Day|Week)$/.test(element.textContent.trim()),
  );

  if (!heading) return false;

  const section = heading.closest("section");
  const card = section?.querySelector('[class~="cursor-pointer"]');
  const images = card?.querySelectorAll("img");
  const eyebrow = card?.querySelector("span");
  const button = card?.querySelector("button");

  if (!card || !images || images.length < 2 || !eyebrow || !button) return false;

  const deal = getCurrentDeal();
  if (!deal || card.dataset.weeklyDealLink === deal.link) return;

  heading.textContent = "Deal of the Week";
  eyebrow.textContent = `This week's pick • ${deal.name}`;
  button.textContent = "Shop This Week's Deal";
  card.dataset.weeklyDealLink = deal.link;
  card.setAttribute("aria-label", `Shop this week's deal: ${deal.name}`);
  card.style.background = deal.background;

  images[0].src = deal.leftImage;
  images[0].alt = deal.name;
  images[1].src = deal.rightImage;
  images[1].alt = deal.name;

  if (!card.dataset.weeklyDealReady) {
    card.addEventListener("click", openWeeklyDeal, true);
    card.dataset.weeklyDealReady = "true";
  }

  return true;
}

const observer = new MutationObserver(updateWeeklyDeal);
observer.observe(document.getElementById("root"), { childList: true, subtree: true });
updateWeeklyDeal();
setInterval(updateWeeklyDeal, 60 * 60 * 1000);
