import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "exports");
const BASE = process.env.EXPORT_URL ?? "http://localhost:5189/";

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: 1 });
await page.goto(`${BASE}?view=hero`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const outPath = path.join(OUT_DIR, "mongle-hero-3x4.png");
await page.screenshot({ path: outPath });
console.log(`wrote ${outPath}`);

await browser.close();
