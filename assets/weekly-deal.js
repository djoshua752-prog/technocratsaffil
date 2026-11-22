const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
const ROTATION_START = Date.UTC(2026, 6, 20);

const weeklyDeals = [
  {
    name: "Samsung Galaxy Buds",
    leftImage: "/assets/sampods-dkfve4ky.png",
    rightImage: "/assets/sampods2-cjc9kd7r.png",
    link: "https://amzn.to/3NfKj9G",
    background: "linear-gradient(90deg, #6b21a8, #9333ea, #4338ca)",
  },
  {
    name: "Beats Solo Wireless Headset",
    leftImage: "/assets/headphones-cf46-s1a.png",
    rightImage: "/assets/headphones-cf46-s1a.png",
    link: "https://amzn.to/4cJR1Pv",
    background: "linear-gradient(90deg, #9f1239, #e11d48, #7e22ce)",
  },
  {
    name: "Logitech C930e HD Webcam",
    leftImage: "/assets/webcam-5-v5j_bn.png",
    rightImage: "/assets/webcam-5-v5j_bn.png",
    link: "https://amzn.to/4cJgAAk",
    background: "linear-gradient(90deg, #0f766e, #0891b2, #3730a3)",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    leftImage: "/assets/sams24-bx24xtdy.png",
    rightImage: "/assets/sams24-bx24xtdy.png",
    link: "https://amzn.to/3NoYJUO",
    background: "linear-gradient(90deg, #334155, #4f46e5, #7e22ce)",
  },
  {
    name: "NIMO 15.6-inch AI-Ready Laptop",
    leftImage: "https://m.media-amazon.com/images/I/71Ndm-aYeBL._AC_SL1500_.jpg",
    rightImage: "https://m.media-amazon.com/images/I/71Ndm-aYeBL._AC_SL1500_.jpg",
    link: "https://amzn.to/3RJgFvQ",
    background: "linear-gradient(90deg, #0f172a, #1d4ed8, #0891b2)",
  },
  {
    name: "WIWB Ryzen 7 Gaming Desktop",
    leftImage: "https://m.media-amazon.com/images/I/71LmDvckPFL._AC_SL1500_.jpg",
    rightImage: "https://m.media-amazon.com/images/I/71LmDvckPFL._AC_SL1500_.jpg",
    link: "https://amzn.to/45Q8ykk",
    background: "linear-gradient(90deg, #3b0764, #7e22ce, #be123c)",
  },
  {
    name: "60% Wired Mechanical Gaming Keyboard with Blue Switches",
    leftImage: "https://m.media-amazon.com/images/I/61%2BO1VNp1-L.jpg",
    rightImage: "https://m.media-amazon.com/images/I/61%2BO1VNp1-L.jpg",
    link: "https://amzn.to/45B7O2F",
    background: "linear-gradient(90deg, #78350f, #d97706, #7c2d12)",
  },
  {
    name: "YLEEBG 12-inch Android 16 Tablet Bundle",
    leftImage: "/assets/yleebg-12-inch-tablet.webp",
    rightImage: "/assets/yleebg-12-inch-tablet.webp",
    link: "https://amzn.to/4fZ4TFx",
    background: "linear-gradient(90deg, #831843, #db2777, #7e22ce)",
  },
];

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

if (!updateWeeklyDeal()) {
  const observer = new MutationObserver(() => {
    if (updateWeeklyDeal()) observer.disconnect();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

setInterval(updateWeeklyDeal, 60 * 60 * 1000);
