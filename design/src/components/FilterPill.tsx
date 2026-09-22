import { glass } from "../theme";

// CSS port of the current components/Pill.tsx: pure white + a soft shadow
// (no border) for inactive chips, ink-filled for the active one. An earlier
// version relied on a low-opacity ink tint for the inactive fill, which read
// as "no background at all" on a real device screen — the shadow is what
// actually guarantees it reads as a raised chip regardless of exact
// fill/canvas contrast, so this mockup should show the same thing rather
// than the flatter look this used to have.
export const CHIP_HEIGHT = 34;

export default function FilterPill({
  label,
  active,
  count,
}: {
  label: string;
  active: boolean;
  count?: number;
}) {
  return (
    <div
      style={{
        height: CHIP_HEIGHT,
        flexShrink: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "0 14px",
        borderRadius: CHIP_HEIGHT / 2,
        background: active ? glass.ink : "#FFFFFF",
        boxShadow: active ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? "#FFFFFF" : glass.ink }}>
        {label}
      </span>
      {count != null ? (
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: active ? "rgba(255,255,255,0.6)" : glass.subMuted,
          }}
        >
          {count}
        </span>
      ) : null}
    </div>
  );
}
