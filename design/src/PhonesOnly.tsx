import { useEffect } from "react";
import PhoneMockups from "./components/PhoneMockups";
import { HERO_W, HERO_H } from "./Hero";

// Standalone export of both hero phone mockups together (bezels included),
// at their exact Hero.tsx positions/tilt, on a transparent background — no
// gradient, no wordmark/headline. Sized to the same coordinate space
// PhoneMockups' positions were authored against; export-phones.mjs measures
// the actual rendered bounding box and crops to that, so this component
// itself doesn't need to compute a tight canvas.
export default function PhonesOnly() {
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);
  return (
    <div style={{ position: "relative", width: HERO_W, height: HERO_H }}>
      <PhoneMockups shadow={false} />
    </div>
  );
}
