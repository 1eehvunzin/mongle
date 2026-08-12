import type { CSSProperties, ReactNode } from "react";
import type { GlassTone } from "../theme";

type Props = {
  tone: GlassTone;
  radius?: number;
  style?: CSSProperties;
  children?: ReactNode;
};

// CSS port of components/Glass.tsx: fill gradient + top specular highlight +
// a hairline rim at the base. `children` render as DIRECT children of the
// flex root (matching the RN original's `{children}` placement) — an
// earlier version wrapped them in an extra non-flex div, which silently
// broke every `display:"flex"` a caller passed via `style` (e.g. the
// profile identity card's name/level space-between row collapsed to
// zero gap because its flex:1 column had no flex container to grow inside).
export default function Glass({ tone, radius = 16, style, children }: Props) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${tone.top} 0%, ${tone.mid} 100%)`,
        boxShadow: `inset 0 -1.5px 0 0 ${tone.rim}66`,
        ...style,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          height: "48%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
