// "모양 구름" (shape clouds) — collected not by species but by the shape the
// user drew onto them, per RETENTION_DISCOVERY.md §E. Deliberately reuses
// the ordinary catch pipeline instead of a parallel data model: a shape
// cloud is just a catch whose cloud_type marks it as one and whose
// cloud_name is the shape's name — every screen that already knows how to
// show a catch (feed folders, map pins, home's recent row, the share card)
// handles it for free, with no species entry in cloudSpecies.ts and no dex
// number (dexNo() already falls back to "No.???" for an unknown name, which
// reads right here — this isn't part of the numbered dex).
export const SHAPE_CLOUD_TYPE = "모양 구름";

// Collection unit definition (the "leap of faith" decision in the discovery
// doc): free drawing alone isn't a collectible, it's a doodle. Picking a
// name from this preset list is the "official" version of a shape — typing
// your own keeps it, but as a personal one-off rather than a shared target.
// No AI verification of whether the cloud actually looks like the shape —
// self-certified, matching the app's own low-pressure principle.
export const SHAPE_PRESETS = [
  "하트",
  "토끼",
  "고래",
  "강아지",
  "물고기",
  "용",
  "손",
  "얼굴",
  "별",
  "꽃",
  "나비",
  "우산",
  "왕관",
  "나무",
  "새",
  "곰",
  "고양이",
  "오리",
  "달팽이",
  "리본",
  "달",
  "번개",
  "우주선",
  "하트눈",
] as const;

export function shapeCloudName(label: string): string {
  const trimmed = label.trim();
  return trimmed.endsWith("구름") ? trimmed : `${trimmed}구름`;
}

export function isShapeCloud(cloudType: string): boolean {
  return cloudType === SHAPE_CLOUD_TYPE;
}
