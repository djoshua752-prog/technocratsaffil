const NIMO_GRADIENT = "linear-gradient(135deg, #052e16 0%, #14532d 52%, #166534 100%)";

const categoryGradients = [
  "linear-gradient(135deg, #831843 0%, #db2777 55%, #fb7185 100%)",
  "linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #818cf8 100%)",
  "linear-gradient(135deg, #7f1d1d 0%, #dc2626 55%, #fb7185 100%)",
  "linear-gradient(135deg, #713f12 0%, #d97706 55%, #fbbf24 100%)",
  "linear-gradient(135deg, #172554 0%, #2563eb 55%, #38bdf8 100%)",
  "linear-gradient(135deg, #581c87 0%, #9333ea 55%, #c084fc 100%)",
  "linear-gradient(135deg, #7c2d12 0%, #ea580c 55%, #fb923c 100%)",
  "linear-gradient(135deg, #164e63 0%, #0891b2 55%, #22d3ee 100%)",
];

function shuffledGradients() {
  return [...categoryGradients].sort(() => Math.random() - 0.5);
}

let availableGradients = shuffledGradients();

function createRandomGradient() {
  let hue = Math.floor(Math.random() * 360);
  if (hue >= 75 && hue <= 165) hue = (hue + 120) % 360;
  const secondHue = (hue + 28 + Math.floor(Math.random() * 35)) % 360;
  return `linear-gradient(135deg, hsl(${hue} 65% 20%) 0%, hsl(${secondHue} 72% 42%) 100%)`;
}

function nextGradient() {
  return availableGradients.shift() || createRandomGradient();
}

function applyCategoryGradients() {
  const heading = [...document.querySelectorAll("h2")].find(
    (element) => element.textContent.trim() === "Shop by Category",
  );
  const section = heading?.closest(".container");
  const grid = section?.querySelector(".grid");

  if (!grid) return;

  [...grid.children].forEach((card) => {
    if (card.dataset.categoryGradient) return;

    const productName = card.textContent.toLowerCase();
    const isNimoLaptop = productName.includes("nimo") && productName.includes("laptop");
    const gradient = isNimoLaptop ? NIMO_GRADIENT : nextGradient();

    card.style.backgroundImage = gradient;
    card.dataset.categoryGradient = isNimoLaptop ? "nimo-dark-green" : "random";
  });
}

let updateQueued = false;
const observer = new MutationObserver(() => {
  if (updateQueued) return;
  updateQueued = true;
  requestAnimationFrame(() => {
    applyCategoryGradients();
    updateQueued = false;
  });
});

observer.observe(document.documentElement, { childList: true, subtree: true });
applyCategoryGradients();
