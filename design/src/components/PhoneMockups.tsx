import PhoneFrame, { getScreenSize } from "./PhoneFrame";
import ScreenScale from "./ScreenScale";
import HomeScreen from "../sections/HomeScreen";
import StreakScreen from "../sections/StreakScreen";

// Shared layout for the two-phone hero group — used by both Hero.tsx (inside
// the 1200x1600 gradient canvas) and the standalone transparent export, so
// tuning the overlap/positions in one place keeps both in sync.
export const BACK_PHONE_W = 480;
export const BACK_PHONE_H = Math.round((BACK_PHONE_W * 19.5) / 9);
const backScreen = getScreenSize(BACK_PHONE_W, BACK_PHONE_H);

export const FRONT_PHONE_W = 600;
export const FRONT_PHONE_H = Math.round((FRONT_PHONE_W * 19.5) / 9);
const frontScreen = getScreenSize(FRONT_PHONE_W, FRONT_PHONE_H);

// Positions are relative to the same coordinate space Hero.tsx lays its
// 1200x1600 canvas out in, so callers that don't share that canvas (the
// transparent export) need a wrapper at least this large.
export const BACK_PHONE_POS = { left: 640, top: 400 };
export const FRONT_PHONE_POS = { left: 80, top: 260 };

type Props = {
  /** filter:drop-shadow fringes on a transparent PNG export — set false there. */
  shadow?: boolean;
};

// 나(streak) recedes — smaller, further back, on the right. Home leads —
// bigger, in front, on the left, painted after so it overlaps streak.
export default function PhoneMockups({ shadow = true }: Props) {
  return (
    <>
      <PhoneFrame width={BACK_PHONE_W} height={BACK_PHONE_H} rotateDeg={6} shadow={shadow} style={{ left: BACK_PHONE_POS.left, top: BACK_PHONE_POS.top }}>
        <ScreenScale width={backScreen.width} height={backScreen.height}>
          <StreakScreen />
        </ScreenScale>
      </PhoneFrame>
      <PhoneFrame width={FRONT_PHONE_W} height={FRONT_PHONE_H} rotateDeg={-6} shadow={shadow} style={{ left: FRONT_PHONE_POS.left, top: FRONT_PHONE_POS.top }}>
        <ScreenScale width={frontScreen.width} height={frontScreen.height}>
          <HomeScreen />
        </ScreenScale>
      </PhoneFrame>
    </>
  );
}
