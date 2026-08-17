import type { CSSProperties, ReactNode } from "react";
import bezelImg from "../assets/Bezel.png";

type Props = {
  width: number;
  height: number;
  rotateDeg?: number;
  children: ReactNode;
  style?: CSSProperties;
  /** filter:drop-shadow composites badly onto a fully transparent PNG export (Chromium color-fringes the soft edge) — set false for cutout exports. */
  shadow?: boolean;
};

// The screen cutout's exact position within Bezel.png, expressed as
// percentages of the frame's own box — lifted straight from the original
// AppStore Screenshots.dc.html, which used this same asset the same way.
const SCREEN_LEFT_PCT = 5.333;
const SCREEN_TOP_PCT = 2.935;
const SCREEN_W_PCT = 89.333;
const SCREEN_H_PCT = 94.565;

export function getScreenSize(width: number, height: number) {
  return { width: Math.round((width * SCREEN_W_PCT) / 100), height: Math.round((height * SCREEN_H_PCT) / 100) };
}

// Real device frame, composited from the user-supplied Bezel.png (a
// photoreal titanium iPhone with the dynamic island) rather than drawn in
// CSS — the screen content sits underneath, cropped to the cutout's
// percentage box, with the bezel PNG layered on top.
export default function PhoneFrame({ width, height, rotateDeg = 0, children, style, shadow = true }: Props) {
  const radius = Math.round(width * 0.13);
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
          left: `${SCREEN_LEFT_PCT}%`,
          top: `${SCREEN_TOP_PCT}%`,
          width: `${SCREEN_W_PCT}%`,
          height: `${SCREEN_H_PCT}%`,
          borderRadius: radius,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {children}
      </div>
      <img src={bezelImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}
