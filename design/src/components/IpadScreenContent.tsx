import type { ReactNode } from "react";
import ScreenScale from "./ScreenScale";

type Props = { width: number; height: number; children: ReactNode };

// The app has no iPad-specific UI, so an iPhone app shown on an iPad simply
// runs at its own phone aspect ratio, centered on the iPad's screen with
// blank space either side — this reproduces that (real iOS behavior for
// non-iPad-optimized apps), rather than stretching or cropping the UI to
// fill the whole iPad screen.
export default function IpadScreenContent({ width, height, children }: Props) {
  const phoneH = height;
  const phoneW = Math.min(width, Math.round((phoneH * 9) / 19.5));
  const finalH = Math.round((phoneW * 19.5) / 9);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: phoneW, height: finalH, overflow: "hidden" }}>
        <ScreenScale width={phoneW} height={finalH}>
          {children}
        </ScreenScale>
      </div>
    </div>
  );
}
