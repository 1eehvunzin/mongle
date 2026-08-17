import type { CSSProperties, ReactNode } from "react";

type Props = {
  width: number;
  height: number;
  rotateDeg?: number;
  children: ReactNode;
  style?: CSSProperties;
  shadow?: boolean;
};

// Three concentric layers, closest to how a real iPad reads from the front:
// a thin sliver of aluminum at the very edge, a black glass bezel — the
// dominant border color on any real iPad, not the aluminum — and the
// display itself, corners rounded slightly less than the body (concentric,
// not near-square). The first pass skipped the black bezel layer entirely
// and went straight from aluminum to the (white) screen content, so it
// read as a rounded white card, not a tablet.
const BODY_RADIUS_PCT = 5.4;
const ALU_INSET_PCT = 0.7;
const SCREEN_INSET_PCT = 2.5;

const pct = (base: number, p: number) => (base * p) / 100;

export function getIpadScreenSize(width: number, height: number) {
  return {
    width: Math.round(width - 2 * pct(width, SCREEN_INSET_PCT)),
    height: Math.round(height - 2 * pct(height, SCREEN_INSET_PCT)),
  };
}

export default function IpadFrame({ width, height, rotateDeg = 0, children, style, shadow = true }: Props) {
  const bodyRadius = Math.round(pct(width, BODY_RADIUS_PCT));
  const bezelRadius = Math.max(2, Math.round(bodyRadius - pct(width, ALU_INSET_PCT)));
  const screenRadius = Math.max(2, Math.round(bodyRadius - pct(width, SCREEN_INSET_PCT)));
  const dot = Math.max(5, Math.round(width * 0.0045));
  const dotTop = ALU_INSET_PCT + (SCREEN_INSET_PCT - ALU_INSET_PCT) / 2;

  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        transform: `rotate(${rotateDeg}deg)`,
        filter: shadow ? "drop-shadow(0 46px 90px rgba(20,40,60,0.28))" : undefined,
        ...style,
      }}
    >
      {/* aluminum chassis */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: bodyRadius,
          background: "linear-gradient(155deg, #E4E6E9 0%, #C7CACF 45%, #AEB2B8 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 2px rgba(255,255,255,0.6)",
        }}
      />
      {/* black glass bezel */}
      <div
        style={{
          position: "absolute",
          left: `${ALU_INSET_PCT}%`,
          top: `${ALU_INSET_PCT}%`,
          right: `${ALU_INSET_PCT}%`,
          bottom: `${ALU_INSET_PCT}%`,
          borderRadius: bezelRadius,
          background: "linear-gradient(155deg, #1c1d1f 0%, #050506 40%, #000000 100%)",
        }}
      />
      {/* screen */}
      <div
        style={{
          position: "absolute",
          left: `${SCREEN_INSET_PCT}%`,
          top: `${SCREEN_INSET_PCT}%`,
          right: `${SCREEN_INSET_PCT}%`,
          bottom: `${SCREEN_INSET_PCT}%`,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {children}
      </div>
      {/* front camera, sitting in the black bezel strip above the screen */}
      <div
        style={{
          position: "absolute",
          top: `${dotTop}%`,
          left: "50%",
          width: dot,
          height: dot,
          marginLeft: -dot / 2,
          marginTop: -dot / 2,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #3a3d42, #050506 70%)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}
