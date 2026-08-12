// Ported 1:1 from frontend/constants/aquaTheme.ts and frontend/constants/theme.ts —
// this screenshot canvas is meant to look like the real app, not a separate brand.
export type GlassTone = { top: string; mid: string; rim: string; shadow?: string };

export const glass = {
  bg: "#F2F5F3",
  ink: "#3C4440",
  sub: "#828A84",
  subMuted: "#9FA69C",
  card: "#FDFDFB",
  border: "#E2E6DE",
  white: { top: "#FFFFFF", mid: "#F5F6F3", rim: "#D3D7CD", shadow: "#C3C8BC" } as GlassTone,
  gray: { top: "#EEF0EB", mid: "#DBDED5", rim: "#ABAFA2", shadow: "#9DA195" } as GlassTone,
  blue: { top: "#DCEEF5", mid: "#A9D3E2", rim: "#4E8CA0", shadow: "#4E8CA0" } as GlassTone,
  charcoal: { top: "#5B635D", mid: "#3C4440", rim: "#22271F", shadow: "#20241E" } as GlassTone,
  accent: "#3D7F97",
} as const;

export const sys = {
  bg: "#F5F4F1",
  card: "#FFFFFF",
  cardAlt: "#EAE9E5",
  border: "#E1DFDA",
  ink: "#1C1C1E",
  sub: "#75747A",
  subMuted: "#8B897F",
  blue: "#5670B0",
  blueTint: "#E4E9F5",
  blueGradient: ["#6C85C0", "#5670B0"] as const,
  common: "#5670B0",
  rare: "#7558B0",
  legendary: "#805E1D",
} as const;

// The one wordmark accent (matches app/(onboarding)/splash.tsx exactly).
export const wordmarkBlue = "#4FA8D8";

export const STREAK_TONE: GlassTone = {
  top: glass.blue.mid,
  mid: glass.blue.rim,
  rim: "#356B7D",
  shadow: "#356B7D",
};

// Cover-panel color — the one saturated moment in the whole set (matches the
// user-supplied simple.jpg reference: a single deep-color cover, then plain
// white screenshot panels). This is sys.blueGradient verbatim — the app's
// actual "point blue" gradient (theme.ts), not an invented brand color.
export const COVER_GRADIENT = sys.blueGradient;
