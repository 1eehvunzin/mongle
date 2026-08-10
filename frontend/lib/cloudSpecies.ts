// Client-side port of server/cloud_species.py — single source of truth for
// dex numbering, rarity, and card-finish grading now that catches live in
// local storage instead of the backend DB.

export type CloudTier = "bronze" | "silver" | "gold" | "holo";

export type CloudSpeciesDef = {
  name: string;
  type: string;
  rarityLabel: "일반" | "희귀" | "전설";
  stars: number;
};

export const KNOWN_CLOUDS: CloudSpeciesDef[] = [
  { name: "뭉게구름", type: "적운", rarityLabel: "일반", stars: 1 },
  { name: "새털구름", type: "권운", rarityLabel: "일반", stars: 1 },
  { name: "양떼구름", type: "권적운", rarityLabel: "희귀", stars: 2 },
  { name: "비늘구름", type: "고적운", rarityLabel: "희귀", stars: 2 },
  { name: "먹구름", type: "적란운", rarityLabel: "전설", stars: 3 },
  { name: "안개구름", type: "층운", rarityLabel: "일반", stars: 1 },
  { name: "렌즈구름", type: "렌즈운", rarityLabel: "전설", stars: 3 },
];

export const CLOUD_BY_NAME: Record<string, CloudSpeciesDef> = Object.fromEntries(
  KNOWN_CLOUDS.map((c) => [c.name, c]),
);

const FINISH_ORDER: CloudTier[] = ["bronze", "silver", "gold", "holo"];

export function starsToStr(n: number): string {
  return "★".repeat(n) + "☆".repeat(3 - n);
}

export function finishForConfidence(confidence: number | null): CloudTier {
  if (confidence == null || confidence < 0.5) return "bronze";
  if (confidence < 0.7) return "silver";
  if (confidence < 0.9) return "gold";
  return "holo";
}

export function bestFinish(finishes: CloudTier[]): CloudTier {
  let best: CloudTier = "bronze";
  for (const f of finishes) {
    if (FINISH_ORDER.indexOf(f) > FINISH_ORDER.indexOf(best)) best = f;
  }
  return best;
}

export function dexNo(cloudName: string): string {
  const i = KNOWN_CLOUDS.findIndex((c) => c.name === cloudName);
  return i === -1 ? "No.???" : `No.${String(i + 1).padStart(3, "0")}`;
}
