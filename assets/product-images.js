const MAX_PROCESSING_SIZE = 1000;
const WHITE_EDGE_MINIMUM = 218;
const WHITE_EDGE_VARIANCE = 36;
const MINIMUM_WHITE_BORDER_RATIO = 0.18;
const MAX_CONCURRENT_IMAGES = 2;
const processedSources = new Map();
const objectUrls = new Set();
const pendingImages = [];
let activeImageCount = 0;

function hasProductContext(image) {
  if (image.closest("#home, #products, [data-product-link], [data-weekly-deal-link]")) return true;

  const card = image.closest(".group, [class*='cursor-pointer']");
  if (/Check Price|Shop Now|Shop (?:The|This) Deal/i.test(card?.textContent || "")) return true;

  const section = image.closest("section, .container");
  return [...(section?.querySelectorAll("h1, h2") || [])].some((heading) =>
    /Shop by Category|Deal of the (?:Day|Week)/i.test(heading.textContent.trim()),
  );
}

function isEdgeWhite(pixels, offset) {
  const red = pixels[offset];
  const green = pixels[offset + 1];
  const blue = pixels[offset + 2];
  const alpha = pixels[offset + 3];
  const minimum = Math.min(red, green, blue);
  const maximum = Math.max(red, green, blue);

  return alpha > 16 && minimum >= WHITE_EDGE_MINIMUM && maximum - minimum <= WHITE_EDGE_VARIANCE;
}

function collectBorderPixels(width, height) {
  const borderPixels = [];

  for (let x = 0; x < width; x += 1) {
    borderPixels.push(x, (height - 1) * width + x);
  }

  for (let y = 1; y < height - 1; y += 1) {
    borderPixels.push(y * width, y * width + width - 1);
  }

  return borderPixels;
}

function removeConnectedWhiteBackground(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const borderPixels = collectBorderPixels(width, height);
  const whiteBorderPixels = borderPixels.filter((pixelIndex) => isEdgeWhite(pixels, pixelIndex * 4));

  if (whiteBorderPixels.length / borderPixels.length < MINIMUM_WHITE_BORDER_RATIO) return false;

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let queueStart = 0;
  let queueEnd = 0;

  whiteBorderPixels.forEach((pixelIndex) => {
    if (visited[pixelIndex]) return;
    visited[pixelIndex] = 1;
    queue[queueEnd] = pixelIndex;
    queueEnd += 1;
  });

  while (queueStart < queueEnd) {
    const pixelIndex = queue[queueStart];
    queueStart += 1;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const neighbors = [];

    if (x > 0) neighbors.push(pixelIndex - 1);
    if (x < width - 1) neighbors.push(pixelIndex + 1);
    if (y > 0) neighbors.push(pixelIndex - width);
    if (y < height - 1) neighbors.push(pixelIndex + width);

    neighbors.forEach((neighborIndex) => {
      if (visited[neighborIndex] || !isEdgeWhite(pixels, neighborIndex * 4)) return;
      visited[neighborIndex] = 1;
      queue[queueEnd] = neighborIndex;
      queueEnd += 1;
    });
  }

  for (let pixelIndex = 0; pixelIndex < visited.length; pixelIndex += 1) {
    if (!visited[pixelIndex]) continue;

    const offset = pixelIndex * 4;
    const minimum = Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    const softenedAlpha = Math.max(0, Math.min(255, (248 - minimum) * 12));
    pixels[offset + 3] = Math.min(pixels[offset + 3], softenedAlpha);
  }

  context.putImageData(imageData, 0, 0);
  return true;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

async function createTransparentProductImage(source) {
  const loader = new Image();
  loader.crossOrigin = "anonymous";
  loader.decoding = "async";
  loader.src = source;
  await loader.decode();

  const scale = Math.min(1, MAX_PROCESSING_SIZE / Math.max(loader.naturalWidth, loader.naturalHeight));
  const width = Math.max(1, Math.round(loader.naturalWidth * scale));
  const height = Math.max(1, Math.round(loader.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(loader, 0, 0, width, height);
  if (!removeConnectedWhiteBackground(context, width, height)) return null;

  const blob = await canvasToBlob(canvas);
  if (!blob) return null;

  const objectUrl = URL.createObjectURL(blob);
  objectUrls.add(objectUrl);
  return objectUrl;
}

function getProcessedSource(source) {
  if (!processedSources.has(source)) {
    processedSources.set(source, createTransparentProductImage(source).catch(() => null));
  }

  return processedSources.get(source);
}

async function applyProductImageBackground(image, source) {
  const processedSource = await getProcessedSource(source);

  if (!image.isConnected) return;

  if (processedSource) {
    image.src = processedSource;
    image.dataset.productImageState = "ready";
  } else {
    image.dataset.productImageState = "unchanged";
  }
}

function processNextProductImage() {
  while (activeImageCount < MAX_CONCURRENT_IMAGES && pendingImages.length > 0) {
    const { image, source } = pendingImages.shift();
    activeImageCount += 1;

    applyProductImageBackground(image, source).finally(() => {
      activeImageCount -= 1;
      processNextProductImage();
    });
  }
}

function processProductImage(image) {
  if (image.dataset.productImageState || !hasProductContext(image)) return;

  const source = image.currentSrc || image.src;
  if (!source || source.startsWith("blob:") || source.startsWith("data:")) return;

  image.dataset.productImageState = "processing";
  pendingImages.push({ image, source });
  processNextProductImage();
}

function processProductImages(root = document) {
  const images = root instanceof HTMLImageElement ? [root] : root.querySelectorAll?.("img") || [];
  images.forEach((image) => processProductImage(image));
}

let updateQueued = false;
const observer = new MutationObserver((mutations) => {
  if (updateQueued) return;
  updateQueued = true;

  requestAnimationFrame(() => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) processProductImages(node);
      });
    });
    processProductImages();
    updateQueued = false;
  });
});

observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("beforeunload", () => objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl)));
processProductImages();
