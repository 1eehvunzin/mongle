import { useEffect } from "react";
import PhoneFrame, { getScreenSize } from "./components/PhoneFrame";
import ScreenScale from "./components/ScreenScale";
import HomeScreen from "./sections/HomeScreen";

// Standalone export of just the cover panel's phone mockup (bezel included),
// at its actual tilt — sized to the rotated shape's own bounding box on a
// transparent background, not clipped to a straight rectangle.
const PHONE_W = 1260;
const PHONE_H = Math.round((PHONE_W * 19.5) / 9);
const ROTATE_DEG = -6;
const screen = getScreenSize(PHONE_W, PHONE_H);

const rad = (ROTATE_DEG * Math.PI) / 180;
export const CANVAS_W = Math.ceil(PHONE_W * Math.abs(Math.cos(rad)) + PHONE_H * Math.abs(Math.sin(rad))) + 40;
export const CANVAS_H = Math.ceil(PHONE_H * Math.abs(Math.cos(rad)) + PHONE_W * Math.abs(Math.sin(rad))) + 40;

export default function PhoneOnly() {
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H }}>
      <PhoneFrame
        width={PHONE_W}
        height={PHONE_H}
        rotateDeg={ROTATE_DEG}
        shadow={false}
        style={{ left: (CANVAS_W - PHONE_W) / 2, top: (CANVAS_H - PHONE_H) / 2 }}
      >
        <ScreenScale width={screen.width} height={screen.height}>
          <HomeScreen />
        </ScreenScale>
      </PhoneFrame>
    </div>
  );
}
