// Shared map helpers for the web (Leaflet) and native (react-native-maps)
// screens: rarity → pin colors, species filtering, and per-neighborhood
// discovery counts.
import { glass, GlassTone } from "../constants/aquaTheme";
import type { CatchOut } from "./localStore";

// The pin is a small glossy "Aqua glass" badge — the same fill-gradient +
// specular-highlight + rim recipe as every other button/FAB in the app (see
// components/Glass.tsx, and the tab bar's camera button, which this pin
// mirrors almost exactly) — rather than a flat bordered disc. Rarity is the
// tone of the glass itself; 일반 reuses glass.blue (the app's one interactive
// accent, which already doubles as the "default" tier), 희귀/전설 are muted
// siblings pitched at the same pastel-dusty saturation, not candy pastels.
export const RARITY_TONE: Record<string, GlassTone> = {
  일반: glass.blue,
  희귀: { top: "#E5DEF2", mid: "#B7A3D6", rim: "#6F5A96", shadow: "#6F5A96" },
  전설: { top: "#F3E6C6", mid: "#D9B96C", rim: "#8C6D26", shadow: "#8C6D26" },
};

export function rarityTone(rarity: string): GlassTone {
  return RARITY_TONE[rarity] ?? RARITY_TONE["일반"];
}

// Flat swatch color pulled from the same tone, for places that show rarity
// as a small dot or tint rather than a whole glass badge (the bottom sheet's
// thumbnails and selected-card border).
export function raritySwatch(rarity: string): string {
  return rarityTone(rarity).rim;
}

// A cluster of several catches isn't a rarity of its own, so it stays out of
// the pastel family. Dark enough that the white count text on it stays
// clearly readable, but lighter than the near-black glass.charcoal this
// started as.
export const CLUSTER_TONE: GlassTone = {
  top: "#7B8078",
  mid: "#585D56",
  rim: "#3F433D",
  shadow: "#3F433D",
};

// Pixel sizes shared between the web (Leaflet divIcon) and native
// (MapPinBadge) pin renderers, and reused by MapScreen.tsx's own iconSize /
// iconAnchor math so the anchor point always matches what's actually drawn.
export const PIN_SIZE = { base: 32, selected: 38, cluster: 44 } as const;

export function hasCoords(p: CatchOut): boolean {
  return p.lat != null && p.lng != null;
}

// Species that appear among the user's own pins, in first-seen order. Only
// discovered species ever show up here, so the filter never hints at ones the
// user hasn't found.
export function speciesInPins(pins: CatchOut[]): string[] {
  return [...new Set(pins.map((p) => p.cloud_name))];
}

export function filterPinsBySpecies(
  pins: CatchOut[],
  species: string | null,
): CatchOut[] {
  return species ? pins.filter((p) => p.cloud_name === species) : pins;
}

// ---- Clustering + pin markup ------------------------------------------------

export const RARITY_RANK: Record<string, number> = {
  일반: 0,
  희귀: 1,
  전설: 2,
};

export type PinCluster = {
  key: string;
  lat: number;
  lng: number;
  pins: CatchOut[];
  // Highest rarity among the clustered pins — colors the cluster bubble.
  rarity: string;
};

// Simple grid clustering: pins whose coordinates fall in the same `cell`
// (degrees) collapse into one bubble. Callers derive `cell` from the zoom
// level so clusters split apart as the user zooms in.
export function clusterPins(pins: CatchOut[], cell: number): PinCluster[] {
  const size = Math.max(cell, 0.0001);
  const groups = new Map<string, CatchOut[]>();
  for (const p of pins) {
    if (!hasCoords(p)) continue;
    const key = `${Math.floor((p.lat as number) / size)}:${Math.floor((p.lng as number) / size)}`;
    const group = groups.get(key);
    if (group) group.push(p);
    else groups.set(key, [p]);
  }
  const grid = [...groups.entries()].map(([key, list]) => ({
    key,
    pins: list,
  }));

  // Grid cells split one visual group in two when it straddles a cell
  // boundary, leaving two bubbles stacked on top of each other. Fold any
  // cluster whose center is close to an already-kept one into it.
  const merged: { key: string; pins: CatchOut[] }[] = [];
  const center = (list: CatchOut[]) => ({
    lat: list.reduce((s, p) => s + (p.lat as number), 0) / list.length,
    lng: list.reduce((s, p) => s + (p.lng as number), 0) / list.length,
  });
  for (const g of grid) {
    const c = center(g.pins);
    const near = merged.find((m) => {
      const mc = center(m.pins);
      return Math.hypot(mc.lat - c.lat, mc.lng - c.lng) < size * 0.8;
    });
    if (near) near.pins = [...near.pins, ...g.pins];
    else merged.push({ key: g.key, pins: [...g.pins] });
  }

  return merged.map(({ key, pins: list }) => {
    const { lat, lng } = center(list);
    const rarity = list.reduce(
      (best, p) =>
        (RARITY_RANK[p.rarity_label] ?? 0) > (RARITY_RANK[best] ?? 0)
          ? p.rarity_label
          : best,
      list[0].rarity_label,
    );
    return {
      key: list.length === 1 ? `pin-${list[0].id}` : `cluster-${key}`,
      lat,
      lng,
      pins: list,
      rarity,
    };
  });
}

const CLOUD_SVG =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>';

// Leaflet divIcons can't render an actual <Glass> component, so this hand-
// rolls the same recipe in CSS: a fill gradient, a specular highlight streak
// over the top ~48%, and a shadow tinted to the tone's own rim color —
// matching every glossy badge/button elsewhere in the app (see
// components/Glass.tsx and the tab bar's camera button, which the single pin
// below mirrors almost exactly) instead of a flat bordered disc.
function glassBadgeHtml(tone: GlassTone, size: number, inner: string, ring?: string) {
  const border = ring ? `border:2.5px solid ${ring};` : "";
  return `<div style="position:relative;width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;background:linear-gradient(180deg,${tone.top},${tone.mid});${border}box-shadow:0 3px 8px ${tone.shadow}66,0 1px 2px rgba(20,24,22,.3)">
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${inner}</div>
    <div style="position:absolute;top:0;left:0;right:0;height:48%;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0))"></div>
  </div>`;
}

// The web map draws the same look with raw CSS here; the native map draws it
// with the real <Glass> component — see components/MapPinBadge.tsx. Rarity
// is the badge's own glass tone; the sky-blue accent ring (the app's only
// interactive color) marks the selected state instead of a rarity-tinted
// halo.
export function pinHtml(rarity: string, selected: boolean): string {
  const size = selected ? PIN_SIZE.selected : PIN_SIZE.base;
  const icon = `<span style="color:${glass.ink}">${CLOUD_SVG}</span>`;
  return glassBadgeHtml(
    rarityTone(rarity),
    size,
    icon,
    selected ? glass.accent : undefined,
  );
}

export function clusterHtml(count: number): string {
  const size = PIN_SIZE.cluster;
  const label = `<span style="color:#fff;font:700 14px/1 sans-serif">${count}</span>`;
  return glassBadgeHtml(CLUSTER_TONE, size, label);
}
