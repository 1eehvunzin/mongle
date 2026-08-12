import type { ReactNode } from "react";
import Glass from "./Glass";
import { glass } from "../theme";
import type { GlassTone } from "../theme";

// Icon-badge + label pill, matching MetaChip in capture.tsx / the condition
// chip in feed.tsx: a small tinted circle badge inset into a white pill.
export default function Chip({
  badgeTone = glass.gray,
  icon,
  label,
  fontSize = 11,
}: {
  badgeTone?: GlassTone;
  icon: ReactNode;
  label: string;
  fontSize?: number;
}) {
  return (
    <Glass tone={glass.white} radius={999} style={{ paddingLeft: 4, paddingRight: 9, paddingTop: 4, paddingBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Glass
          tone={badgeTone}
          radius={9}
          style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {icon}
        </Glass>
        <span style={{ fontSize, fontWeight: 700, color: glass.ink, whiteSpace: "nowrap" }}>{label}</span>
      </div>
    </Glass>
  );
}
