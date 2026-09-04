import { useEffect } from "react";
import PhoneFrame, { getScreenSize } from "./components/PhoneFrame";
import ScreenScale from "./components/ScreenScale";
import HomeScreen from "./sections/HomeScreen";
import FeedScreen from "./sections/FeedScreen";
import RecognitionScreen from "./sections/RecognitionScreen";
import ShareScreen from "./sections/ShareScreen";
import MapScreen from "./sections/MapScreen";
import StreakScreen from "./sections/StreakScreen";

// Same phone proportions the App Store panels use (see layout.ts), with the
// bezel included but no caption/gradient panel — just each screen mockup in
// its device frame, straight (no tilt), one per section, laid out side by
// side so the export script can clip each one out individually.
export const MOCKUP_W = 1284;
export const MOCKUP_H = Math.round((MOCKUP_W * 19.5) / 9);
const screen = getScreenSize(MOCKUP_W, MOCKUP_H);

export const MOCKUPS = [
  { name: "home", Screen: HomeScreen },
  { name: "feed", Screen: FeedScreen },
  { name: "recognition", Screen: RecognitionScreen },
  { name: "share", Screen: ShareScreen },
  { name: "map", Screen: MapScreen },
  { name: "streak", Screen: StreakScreen },
];

export default function MockupsOnly() {
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);
  return (
    <div style={{ position: "relative", display: "flex", width: MOCKUP_W * MOCKUPS.length, height: MOCKUP_H }}>
      {MOCKUPS.map(({ name, Screen }) => (
        <div key={name} data-mockup={name} style={{ position: "relative", width: MOCKUP_W, height: MOCKUP_H, flexShrink: 0 }}>
          <PhoneFrame width={MOCKUP_W} height={MOCKUP_H} rotateDeg={0} shadow={false}>
            <ScreenScale width={screen.width} height={screen.height}>
              <Screen />
            </ScreenScale>
          </PhoneFrame>
        </div>
      ))}
    </div>
  );
}
