// Exports each of the App Store screenshot panels as a standalone PNG at
// true 1290x2796 resolution — driven by a real headless browser (Playwright)
// rather than the flaky screenshot tooling, since this needs exact,
// deterministic full-resolution output, not a preview.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "exports");
const URL = process.env.EXPORT_URL ?? "http://localhost:5189/";

const NAMES = ["1-cover", "2-feed", "3-recognition", "4-share", "5-map", "6-closing"];

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 7740, height: 2796 }, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
// Let @font-face swaps + images settle after fonts.ready resolves.
await page.waitForTimeout(500);

const panels = await page.evaluate(() => {
  const canvas = document.getElementById("root").firstElementChild;
  const nodes = Array.from(canvas.children).filter(
    (el) => el.tagName === "DIV" && getComputedStyle(el).position === "relative" && getComputedStyle(el).flexShrink === "0",
  );
  return nodes.map((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });
});

if (panels.length !== NAMES.length) {
  throw new Error(`Expected ${NAMES.length} panels, found ${panels.length}`);
}

for (let i = 0; i < panels.length; i++) {
  const clip = panels[i];
  const outPath = path.join(OUT_DIR, `mongle-appstore-${NAMES[i]}.png`);
  await page.screenshot({ path: outPath, clip });
  console.log(`wrote ${outPath} (${Math.round(clip.width)}x${Math.round(clip.height)})`);
}

await browser.close();
