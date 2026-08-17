import type { ReactNode } from "react";
import { PANEL_H, PANEL_W } from "../layout";

type Props = { children: ReactNode; width?: number; height?: number };

// width/height default to the iPhone canvas's panel size so the existing
// App.tsx call sites (no props passed) are unaffected; AppIpad.tsx passes
// the iPad canvas's own (much wider) panel dimensions instead.
export default function Panel({ children, width = PANEL_W, height = PANEL_H }: Props) {
  return (
    <div style={{ position: "relative", width, height, flex: "0 0 auto" }}>
      {children}
    </div>
  );
}
