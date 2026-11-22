const products = [
  {
    image: "https://m.media-amazon.com/images/I/71xiy1ika0L._AC_SL1500_.jpg",
    category: "Portable Chargers",
    name: "VRURC 10000mAh Power Bank",
    badge: "Travel Pick",
    link: "https://amzn.to/4hYPZle",
  },
  {
    image: "https://m.media-amazon.com/images/I/81k4rgqDv3L._AC_SL1500_.jpg",
    category: "Wireless Earbuds",
    name: "Bluetooth 5.4 Sport Wireless Earbuds",
    badge: "Trending Pick",
    link: "https://amzn.to/4hYFxdx",
  },
  {
    image: "/assets/tikom-l8000-plus.png",
    category: "Robot Vacuums",
    name: "Tikom L8000 Plus Robot Vacuum & Mop — 6000Pa, 90-Day Self-Emptying, LiDAR Navigation",
    badge: "90-Day Self-Empty",
    link: "https://amzn.to/4bDqqlQ",
    imageSize: "92%",
    nameLines: 2,
  },
  {
    image: "https://m.media-amazon.com/images/I/61%2BO1VNp1-L.jpg",
    category: "Gaming Keyboards",
    name: "60% Wired Mechanical Gaming Keyboard with Blue Switches and LED Backlight — 61-Key Ultra-Compact Black Keyboard",
    badge: "Compact Pick",
    link: "https://amzn.to/45B7O2F",
    imageSize: "90%",
    nameLines: 2,
  },
  {
    image: "/assets/yleebg-12-inch-tablet.webp",
    category: "Tablets & Accessories",
    name: "YLEEBG 12-inch Android 16 Tablet Bundle — Keyboard, Case, Mouse & Stylus",
    badge: "Complete Kit",
    link: "https://amzn.to/4fZ4TFx",
    imageSize: "90%",
    nameLines: 2,
  },
];

function addTrendingProduct() {
  const productGrid = document.querySelector("#products .grid");

  if (!productGrid) {
    return false;
  }

  const templateCard = productGrid.lastElementChild;

  if (!templateCard) {
    return false;
  }

  products.forEach((product) => {
    if (productGrid.querySelector(`[data-product-link="${product.link}"]`)) {
      return;
    }

    const productCard = templateCard.cloneNode(true);
    const image = productCard.querySelector("img");
    const category = productCard.querySelector("p");
    const name = productCard.querySelector("h3");
    const badge = productCard.querySelector(":scope > div:first-child");
    const button = productCard.querySelector("button");

    productCard.dataset.productLink = product.link;

    if (image) {
      image.src = product.image;
      image.alt = product.name;
      if (product.imageSize) {
        image.style.width = product.imageSize;
        image.style.height = product.imageSize;
      }
    }

    if (category) category.textContent = product.category;
    if (name) {
      name.textContent = product.name;
      if (product.nameLines) {
        name.style.display = "-webkit-box";
        name.style.webkitBoxOrient = "vertical";
        name.style.webkitLineClamp = String(product.nameLines);
        name.style.overflow = "hidden";
        name.style.minHeight = "3rem";
      }
    }
    if (badge) badge.textContent = product.badge;

    const openProduct = () => window.open(product.link, "_blank", "noopener,noreferrer");

    productCard.addEventListener("click", openProduct);
    button?.addEventListener("click", (event) => {
      event.stopPropagation();
      openProduct();
    });

    productGrid.append(productCard);
  });

  return true;
}

if (!addTrendingProduct()) {
  const observer = new MutationObserver(() => {
    if (addTrendingProduct()) observer.disconnect();
  });

  observer.observe(document.getElementById("root"), { childList: true, subtree: true });
}
