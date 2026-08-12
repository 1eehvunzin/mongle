import type { ReactNode } from "react";
import { PANEL_H, PANEL_W } from "../layout";

export default function Panel({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", width: PANEL_W, height: PANEL_H, flex: "0 0 auto" }}>
      {children}
    </div>
  );
}
