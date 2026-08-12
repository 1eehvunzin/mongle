import type { ReactNode } from "react";

const BASE_WIDTH = 302; // matches frontend/constants/scale.ts's design baseline

type Props = { width: number; height: number; children: ReactNode };

// Renders children in the same 302px-wide coordinate space the real app's
// rs() spacing constants were authored against, then scales the whole thing
// up to fill an arbitrary phone-screen size — so numbers copied straight out
// of capture.tsx/share.tsx/home.tsx (the argument passed to rs(...)) line up
// proportionally without re-deriving every value.
export default function ScreenScale({ width, height, children }: Props) {
  const scale = width / BASE_WIDTH;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          width: BASE_WIDTH,
          height: height / scale,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          fontFamily: "Pretendard, sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
}
