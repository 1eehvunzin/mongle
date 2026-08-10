// Client-side port of server/routers/profile.py's _level() — see
// LEVEL_SYSTEM.md for the design rationale. Index 0 is level 1 (the
// starting level, 0 catches).

export const LEVEL_THRESHOLDS = [0, 3, 7, 12, 18, 26, 36, 48, 63, 80];
export const LEVEL_TITLES = [
  "몽글 새싹",
  "구름 초보",
  "하늘 관찰가",
  "구름 수집가",
  "몽글 애호가",
  "하늘 탐험가",
  "구름 박사",
  "몽글 장인",
  "하늘 지킴이",
  "구름 그랜드마스터",
];
const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export type LevelInfo = {
  level: number;
  levelTitle: string;
  levelProgressPct: number;
  catchesToNextLevel: number;
};

export function computeLevel(total: number): LevelInfo {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (total >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  if (level >= MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      levelTitle: LEVEL_TITLES[MAX_LEVEL - 1],
      levelProgressPct: 100,
      catchesToNextLevel: 0,
    };
  }
  const span = LEVEL_THRESHOLDS[level] - LEVEL_THRESHOLDS[level - 1];
  const into = total - LEVEL_THRESHOLDS[level - 1];
  return {
    level,
    levelTitle: LEVEL_TITLES[level - 1],
    levelProgressPct: (into / span) * 100,
    catchesToNextLevel: LEVEL_THRESHOLDS[level] - total,
  };
}
