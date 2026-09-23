import Glass from "../components/Glass";
import Icon from "../components/Icon";
import FilterPill from "../components/FilterPill";
import { glass, GlassTone } from "../theme";
import recognitionSky from "../assets/photos/recognition-sky.jpg";
import shareDusk from "../assets/photos/share-dusk.jpg";
import streakSunset from "../assets/photos/streak-sunset.jpg";
import cumulusBird from "../assets/photos/cumulus-bird.jpg";

// Ported from lib/mapMeta.ts / components/MapTopBar.tsx / MapSheet.tsx: a
// full-bleed map (react-native-maps on device; a decorative texture stands
// in for it here, same departure the previous version of this mockup took —
// see the note on MapTexture below), the title + species filter chips fading
// in from the screen background at the top with no boxed header, and a
// rounded bottom sheet with a horizontal card strip instead of a plain list.
const RARITY_TONE: Record<"일반" | "희귀" | "전설", GlassTone> = {
  일반: glass.blue,
  희귀: { top: "#E5DEF2", mid: "#B7A3D6", rim: "#6F5A96", shadow: "#6F5A96" },
  전설: { top: "#F3E6C6", mid: "#D9B96C", rim: "#8C6D26", shadow: "#8C6D26" },
};
const CLUSTER_TONE: GlassTone = { top: "#7B8078", mid: "#585D56", rim: "#3F433D", shadow: "#3F433D" };

const PINS: {
  top: number;
  left: number;
  tone: GlassTone;
  size: number;
  selected?: boolean;
  count?: number;
}[] = [
  { top: 150, left: 60, tone: RARITY_TONE.일반, size: 32 },
  { top: 158, left: 214, tone: RARITY_TONE.전설, size: 32 },
  { top: 260, left: 122, tone: RARITY_TONE.희귀, size: 38, selected: true },
  { top: 220, left: 44, tone: CLUSTER_TONE, size: 44, count: 3 },
  { top: 340, left: 232, tone: RARITY_TONE.일반, size: 32 },
];

const CARDS = [
  { name: "새털구름", place: "여의도 한강공원", photo: shareDusk, rarity: "일반" as const },
  { name: "양떼구름", place: "남산", photo: streakSunset, rarity: "희귀" as const, selected: true },
  { name: "뭉게구름", place: "성산동", photo: recognitionSky, rarity: "일반" as const },
  { name: "하트구름", place: "여의도 한강공원", photo: cumulusBird, rarity: "희귀" as const },
];

function raritySwatch(rarity: "일반" | "희귀" | "전설") {
  return RARITY_TONE[rarity].rim;
}

function PinBadge({ tone, size, selected, count }: { tone: GlassTone; size: number; selected?: boolean; count?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, boxShadow: `0 3px 8px ${tone.shadow}66, 0 1px 2px rgba(20,24,22,0.3)` }}>
      <Glass
        tone={tone}
        radius={size / 2}
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: selected ? `2.5px solid ${glass.accent}` : undefined,
        }}
      >
        {count != null ? (
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{count}</span>
        ) : (
          <Icon name="cloud" size={selected ? 17 : 15} color={glass.ink} />
        )}
      </Glass>
    </div>
  );
}

export default function MapScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: glass.bg, overflow: "hidden" }}>
      <MapTexture />

      {PINS.map((p, i) => (
        <div key={i} style={{ position: "absolute", top: p.top, left: p.left }}>
          <PinBadge tone={p.tone} size={p.size} selected={p.selected} count={p.count} />
        </div>
      ))}

      {/* Top bar: title + filter chips fading from the screen background,
          directly on the map — no boxed header, no hard edge. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 44,
          paddingBottom: 34,
          background: `linear-gradient(180deg, ${glass.bg} 0%, ${glass.bg} 55%, rgba(242,245,243,0) 100%)`,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: 24,
            fontWeight: 700,
            color: glass.ink,
            letterSpacing: "-0.02em",
            padding: "0 16px",
            marginBottom: 10,
          }}
        >
          구름 지도
        </span>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 8, padding: "0 16px", overflow: "hidden" }}>
            <FilterPill label="전체" active />
            {/* Shape clouds get one shared chip (however they were each
                individually named), pinned right after "전체" — ported from
                lib/mapMeta.ts's speciesInPins/filterPinsBySpecies. */}
            <FilterPill label="모양 구름" active={false} />
            <FilterPill label="뭉게구름" active={false} />
            <FilterPill label="새털구름" active={false} />
            <FilterPill label="양떼구름" active={false} />
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
      </div>

      {/* Bottom sheet: horizontal card strip, rounded up into the map with
          no seam against the floating tab bar below it. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 210,
          paddingTop: 14,
          background: glass.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: `1px solid ${glass.border}`,
          borderBottom: "none",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.12)",
        }}
      >
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: glass.ink, padding: "0 16px", marginBottom: 10 }}>
          구름 기록 <span style={{ color: glass.accent }}>13</span>
        </span>
        <div style={{ display: "flex", gap: 10, padding: "0 16px" }}>
          {CARDS.map((c) => (
            <div
              key={c.name}
              style={{
                width: 132,
                padding: 6,
                borderRadius: 16,
                border: c.selected ? `2px solid ${raritySwatch(c.rarity)}` : `1px solid ${glass.border}`,
                background: glass.white.top,
              }}
            >
              <img src={c.photo} alt="" style={{ width: "100%", height: 62, borderRadius: 10, objectFit: "cover", display: "block" }} />
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: glass.ink, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
              {c.selected ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: glass.accent, whiteSpace: "nowrap" }}>기록 보기 ›</span>
              ) : (
                <span style={{ display: "block", fontSize: 10, color: glass.subMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.place}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// The real (native) map has no web target for react-native-maps, so this
// stays a deliberate, labeled departure from strict fidelity for the
// marketing shot: a light decorative road-grid + park/river texture behind
// the pins, not literal geo data.
function MapTexture() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: "#E4E7DC" }} />
      <div style={{ position: "absolute", left: -60, top: 120, width: 260, height: 260, borderRadius: "50%", background: "#CFE0C8" }} />
      <div style={{ position: "absolute", right: -50, bottom: 140, width: 220, height: 220, borderRadius: 40, background: "#CBDCE6" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <line x1="0" y1="140" x2="100%" y2="200" stroke="#FFFFFF" strokeWidth="7" />
        <line x1="0" y1="340" x2="100%" y2="300" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="90" y1="0" x2="150" y2="100%" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="230" y1="0" x2="280" y2="100%" stroke="#FFFFFF" strokeWidth="5" />
      </svg>
    </div>
  );
}
