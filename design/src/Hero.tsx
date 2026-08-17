import PhoneMockups from "./components/PhoneMockups";
import { COVER_GRADIENT } from "./theme";

// A single promo/hero graphic combining the cover and closing panels'
// content — 3:4 portrait, not one of the 6 App Store screenshot panels.
// One wordmark only (it doesn't need to appear twice); the home screen
// is the dominant phone in front (left side), 나(streak) recedes smaller
// behind it (right side) — left/right placement mirrors the original
// two-panel reference, only size and z-order swap. The phone layout
// itself lives in PhoneMockups so the transparent two-phone export
// (PhonesOnly.tsx) can reuse the exact same positions.
export const HERO_W = 1200;
export const HERO_H = 1600;

export default function Hero() {
  return (
    <div
      style={{
        position: "relative",
        width: HERO_W,
        height: HERO_H,
        overflow: "hidden",
        background: `linear-gradient(160deg, ${COVER_GRADIENT[0]} 0%, ${COVER_GRADIENT[1]} 100%)`,
        fontFamily: "Pretendard, -apple-system, sans-serif",
      }}
    >
      <div style={{ position: "absolute", top: 50, left: 50, fontFamily: "Cloudsofa", fontSize: 130, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.01em" }}>
        mongle
      </div>
      <div style={{ position: "absolute", top: 178, left: 50, fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
        매일 올려다보는 하늘,
        <br />
        수집하는 재미가 되다.
      </div>

      <div
        style={{
          position: "absolute",
          top: 60,
          left: 620,
          right: 50,
          textAlign: "right",
          fontSize: 44,
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1.16,
          letterSpacing: "-0.02em",
        }}
      >
        오늘부터,
        <br />
        매일의 구름을
        <br />
        쌓아보세요
      </div>

      <PhoneMockups />
    </div>
  );
}
