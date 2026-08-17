import type { CSSProperties, ReactNode } from "react";

type Props = {
  width: number;
  height: number;
  rotateDeg?: number;
  children: ReactNode;
  style?: CSSProperties;
  shadow?: boolean;
};

// No photoreal iPad asset on hand (only the iPhone Bezel.png), so this draws
// a clean flat aluminum-style iPad silhouette in CSS: thin uniform bezel,
// rounded body, single top-center camera dot — reads as "tablet" without
// needing a bitmap. Percentages mirror PhoneFrame's cutout convention.
const SCREEN_LEFT_PCT = 2.6;
const SCREEN_TOP_PCT = 2.0;
const SCREEN_W_PCT = 94.8;
const SCREEN_H_PCT = 96.0;

export function getIpadScreenSize(width: number, height: number) {
  return { width: Math.round((width * SCREEN_W_PCT) / 100), height: Math.round((height * SCREEN_H_PCT) / 100) };
}

export default function IpadFrame({ width, height, rotateDeg = 0, children, style, shadow = true }: Props) {
  const radius = Math.round(width * 0.045);
  const screenRadius = Math.round(radius * 0.6);
  const dot = Math.max(6, Math.round(width * 0.006));
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background: "linear-gradient(155deg, #EEF0F2 0%, #D2D5D9 55%, #B9BDC3 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `${SCREEN_LEFT_PCT}%`,
          top: `${SCREEN_TOP_PCT}%`,
          width: `${SCREEN_W_PCT}%`,
          height: `${SCREEN_H_PCT}%`,
          borderRadius: screenRadius,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: Math.round(height * 0.009),
          left: "50%",
          width: dot,
          height: dot,
          marginLeft: -dot / 2,
          borderRadius: "50%",
          background: "#4B4F55",
        }}
      />
    </div>
  );
}
