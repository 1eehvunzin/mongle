import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "exports");
const BASE = process.env.EXPORT_URL ?? "http://localhost:5189/";

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 10, height: 10 }, deviceScaleFactor: 1 });
await page.goto(`${BASE}?view=phone`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const box = await page.evaluate(() => {
  const el = document.getElementById("root").firstElementChild;
  return { width: Math.ceil(el.getBoundingClientRect().width), height: Math.ceil(el.getBoundingClientRect().height) };
});
await page.setViewportSize(box);
await page.waitForTimeout(100);

const outPath = path.join(OUT_DIR, "mongle-home-phone-tilted.png");
await page.screenshot({ path: outPath, omitBackground: true });
console.log(`wrote ${outPath} (${box.width}x${box.height}, transparent bg)`);

await browser.close();
