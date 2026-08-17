import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "exports");
const BASE = process.env.EXPORT_URL ?? "http://localhost:5189/";

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
// Viewport large enough to fit the un-clipped coordinate space PhoneMockups'
// positions were authored against (Hero.tsx's 1200x1600 canvas), plus
// margin for rotation overhang past its edges.
const page = await browser.newPage({ viewport: { width: 1400, height: 1800 }, deviceScaleFactor: 1 });
await page.goto(`${BASE}?view=phones`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

// Union bounding box of both phone mockups — not a fixed canvas — since the
// two are rotated by different amounts and their combined extent isn't a
// simple sum of either one's own box.
const box = await page.evaluate(() => {
  const wrapper = document.getElementById("root").firstElementChild;
  const rects = Array.from(wrapper.children).map((el) => el.getBoundingClientRect());
  const left = Math.min(...rects.map((r) => r.left));
  const top = Math.min(...rects.map((r) => r.top));
  const right = Math.max(...rects.map((r) => r.right));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  return { left, top, width: right - left, height: bottom - top };
});

const PAD = 8;
const clip = {
  x: Math.max(0, Math.floor(box.left - PAD)),
  y: Math.max(0, Math.floor(box.top - PAD)),
  width: Math.ceil(box.width + PAD * 2),
  height: Math.ceil(box.height + PAD * 2),
};

const outPath = path.join(OUT_DIR, "mongle-hero-phones.png");
await page.screenshot({ path: outPath, clip, omitBackground: true });
console.log(`wrote ${outPath} (${clip.width}x${clip.height}, transparent bg)`);

await browser.close();
