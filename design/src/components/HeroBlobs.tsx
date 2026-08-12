import type { CSSProperties } from "react";

// Ported from components/HeroBlobs.tsx: two soft translucent circles behind
// the sky hero card's content, never on top of it.
export default function HeroBlobs({ tint = "rgba(255,255,255,0.12)" }: { tint?: string }) {
  const circle = (style: CSSProperties) => (
    <div style={{ position: "absolute", borderRadius: "50%", background: tint, ...style }} />
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {circle({ width: 170, height: 170, top: -70, right: -50 })}
      {circle({ width: 90, height: 90, bottom: -34, right: 26 })}
    </div>
  );
}
