import Icon from "../components/Icon";
import FilterPill from "../components/FilterPill";
import { glass } from "../theme";
import recognitionSky from "../assets/photos/recognition-sky.jpg";
import shareDusk from "../assets/photos/share-dusk.jpg";
import streakSunset from "../assets/photos/streak-sunset.jpg";
import cumulusPole from "../assets/photos/cumulus-pole.jpg";
import cumulusBird from "../assets/photos/cumulus-bird.jpg";

// Ported from components/FolderGrid.tsx: each folder is a small pile of its
// newest photos (one, two, or three), fanned out and tilted like an album
// stack in Photos, front photo on top. Column/photo sizing below is worked
// out from the same formula FolderGrid.tsx uses (fit a full 3-photo pile
// into a 2-column grid), just computed once for this canvas's fixed width
// instead of at runtime.
const COLUMN_W = 141;
const PHOTO_W = 77;
const PHOTO_H = 103; // PHOTO_RATIO = 4/3
const STACK_H = 129; // PHOTO_H + 26
const TILT = 9;

const SLOTS = [
  { rotate: 0, dx: 0, dy: 0.05 },
  { rotate: TILT, dx: 0.26, dy: -0.03 },
  { rotate: -TILT, dx: -0.26, dy: -0.02 },
];

type Folder = { key: string; label: string; count: number; photos: (string | null)[] };

// 5 real cloud photos exist in the repo's reference assets now, so every
// folder below draws from the same small pool — but each pulls a different
// three (a different photo fronting the pile each time), so the grid still
// reads as a full, well-stocked feed rather than the same one or two photos
// repeated thin. A full three-photo pile is also just the better showcase:
// see StackCard/FolderTile for how thinner (one- or zero-photo) piles look.
//
// "모양 구름" leads the grid, pinned first regardless of count — ported from
// feedFilters.ts's groupItems: every shape cloud (however it was individually
// named — "하트구름", "토끼구름", …) collapses into this one folder in the
// real 종류 tab, same as here.
const FOLDERS: Folder[] = [
  { key: "모양 구름", label: "모양 구름", count: 3, photos: [streakSunset, cumulusBird, recognitionSky] },
  { key: "뭉게구름", label: "뭉게구름", count: 9, photos: [recognitionSky, cumulusBird, streakSunset] },
  { key: "새털구름", label: "새털구름", count: 6, photos: [shareDusk, streakSunset, cumulusPole] },
  { key: "양떼구름", label: "양떼구름", count: 5, photos: [cumulusBird, recognitionSky, cumulusPole] },
  { key: "안개구름", label: "안개구름", count: 4, photos: [recognitionSky, shareDusk, cumulusPole] },
];

function StackCard({ uri, slot }: { uri: string | null; slot: (typeof SLOTS)[number] }) {
  const left = (COLUMN_W - PHOTO_W) / 2 + slot.dx * PHOTO_W;
  const top = (STACK_H - PHOTO_H) / 2 + slot.dy * PHOTO_H;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: PHOTO_W,
        height: PHOTO_H,
        borderRadius: 13,
        overflow: "hidden",
        background: glass.border,
        boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
        transform: `rotate(${slot.rotate}deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {uri ? (
        <img src={uri} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Icon name="cloud" size={28} color={glass.subMuted} />
      )}
    </div>
  );
}

function FolderTile({ folder }: { folder: Folder }) {
  const cards = folder.photos.length > 0 ? folder.photos : [null];
  const painted = cards.map((uri, i) => ({ uri, slot: SLOTS[i] })).reverse();
  return (
    <div style={{ width: COLUMN_W, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: COLUMN_W, height: STACK_H }}>
        {painted.map((c, i) => (
          <StackCard key={i} uri={c.uri} slot={c.slot} />
        ))}
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: glass.ink, marginTop: 8 }}>{folder.label}</span>
      <span style={{ fontSize: 11, color: glass.sub, marginTop: 2 }}>{folder.count}장</span>
    </div>
  );
}

export default function FeedScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: glass.bg }}>
      <div
        style={{
          padding: "26px 16px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: glass.ink, letterSpacing: "-0.02em" }}>
          구름 피드
        </span>
        <Icon name="search" size={20} color={glass.ink} />
      </div>

      {/* The real row is a horizontal ScrollView wider than the screen — a
          still image can't show that it scrolls, so a right-edge fade
          stands in for the affordance instead of letting the last chip's
          count clip mid-digit at the frame edge. */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, padding: "0 16px", overflow: "hidden" }}>
          <FilterPill label="종류" active />
          <FilterPill label="희귀도" active={false} />
          <FilterPill label="월별" active={false} />
          <FilterPill label="장소" active={false} />
          <FilterPill label="전체" active={false} count={27} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 28,
            background: `linear-gradient(90deg, rgba(242,245,243,0), ${glass.bg})`,
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          padding: "0 10px",
        }}
      >
        {FOLDERS.map((folder) => (
          <div key={folder.key} style={{ width: "50%", display: "flex", justifyContent: "center", paddingBottom: 20 }}>
            <FolderTile folder={folder} />
          </div>
        ))}
      </div>
    </div>
  );
}
