// Exports each screen mockup in its device bezel (no caption, no marketing
// panel, transparent background) at true resolution — the individual
// sections/*.tsx screens as used inside App.tsx's phone frames, isolated.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "exports", "mockups");
const URL = process.env.EXPORT_URL ?? "http://localhost:5189/";
const MOCKUP_W = 1284;
const MOCKUP_H = Math.round((MOCKUP_W * 19.5) / 9);

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: MOCKUP_W * 7, height: MOCKUP_H },
  deviceScaleFactor: 1,
});
await page.goto(`${URL}?view=mockups`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const panels = await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll("[data-mockup]"));
  return nodes.map((el) => {
    const r = el.getBoundingClientRect();
    return { name: el.getAttribute("data-mockup"), x: r.left, y: r.top, width: r.width, height: r.height };
  });
});

if (panels.length === 0) {
  throw new Error("No [data-mockup] panels found");
}

for (const panel of panels) {
  const outPath = path.join(OUT_DIR, `mongle-mockup-${panel.name}.png`);
  await page.screenshot({ path: outPath, clip: { x: panel.x, y: panel.y, width: panel.width, height: panel.height }, omitBackground: true });
  console.log(`wrote ${outPath} (${Math.round(panel.width)}x${Math.round(panel.height)})`);
}

await browser.close();
