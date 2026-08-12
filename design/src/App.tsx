import Panel from "./components/Panel";
import PhoneFrame, { getScreenSize } from "./components/PhoneFrame";
import ScreenScale from "./components/ScreenScale";
import { sys, COVER_GRADIENT } from "./theme";
import { CANVAS_H, CANVAS_W, PANEL_W } from "./layout";

import HomeScreen from "./sections/HomeScreen";
import FeedScreen from "./sections/FeedScreen";
import RecognitionScreen from "./sections/RecognitionScreen";
import ShareScreen from "./sections/ShareScreen";
import MapScreen from "./sections/MapScreen";
import StreakScreen from "./sections/StreakScreen";

// Following the user-supplied reference (assets/ref/simple.jpg) directly:
// one saturated cover panel with the wordmark, then plain-white screenshot
// panels — a short bold caption up top, the real phone straight (no tilt,
// no card, no badges) filling almost the whole frame and cropped at the
// bottom edge. A matching closing panel bookends the cover (수미상관).
const CAPTION_TOP = 130;
const STAGE_TOP = 420;

// The caption's emphasized line uses the exact same blue as the cover/
// closing panels' background — one accent tying the whole set together,
// not an invented hue per screen.
const EMPHASIS_COLOR = COVER_GRADIENT[1];

export default function App() {
  return (
    <div
      style={{
        position: "relative",
        width: CANVAS_W,
        height: CANVAS_H,
        display: "flex",
        fontFamily: "Pretendard, -apple-system, sans-serif",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      {/* ===== 1. COVER ===== */}
      <Panel>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${COVER_GRADIENT[0]} 0%, ${COVER_GRADIENT[1]} 100%)`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 90,
              left: 80,
              right: 20,
              fontFamily: "Cloudsofa",
              fontSize: 250,
              color: "#FFFFFF",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            mongle
          </div>
          <div
            style={{
              position: "absolute",
              top: 380,
              left: 80,
              right: 140,
              fontSize: 40,
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            매일 올려다보는 하늘,
            <br />
            수집하는 재미가 되다.
          </div>
          <PhoneFrame width={HOME_W} height={HOME_H} rotateDeg={-6} style={{ left: PANEL_W - HOME_W + 260, top: 780 }}>
            <ScreenScale width={homeScreen.width} height={homeScreen.height}>
              <HomeScreen />
            </ScreenScale>
          </PhoneFrame>
        </div>
      </Panel>

      <StraightPanel prefix="포착한 하늘을" emphasis="다시 모아봐요">
        <FeedScreen />
      </StraightPanel>

      <StraightPanel prefix="구름을 찍으면 바로" emphasis="이름을 알려줘요">
        <RecognitionScreen />
      </StraightPanel>

      <StraightPanel prefix="예쁜 하늘은" emphasis="바로 공유해요">
        <ShareScreen />
      </StraightPanel>

      <StraightPanel prefix="구름을 만난 장소가" emphasis="지도에 쌓여요">
        <MapScreen />
      </StraightPanel>

      {/* ===== 6. CLOSING (bookends the cover, features the 나 screen) ===== */}
      <Panel>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${COVER_GRADIENT[0]} 0%, ${COVER_GRADIENT[1]} 100%)`,
            overflow: "hidden",
          }}
        >
          {/* Mirrors the cover's bottom-right phone: same treatment, tilted
              the other way, showing the 나(profile) screen instead of home —
              a 수미상관 bookend, not a repeat of the opener. Sized so growth
              reads as extending from the top-right corner toward the
              bottom-left (left compensates for the width increase, top is
              untouched) rather than uniformly from the top-left. */}
          <PhoneFrame width={CLOSING_W} height={CLOSING_H} rotateDeg={6} style={{ left: -110, top: 600 }}>
            <ScreenScale width={closingScreen.width} height={closingScreen.height}>
              <StreakScreen />
            </ScreenScale>
          </PhoneFrame>
          {/* Text stack raised above the phone (z-index) — DOM order alone
              (phone renders first) already put them on top; zIndex just
              makes that explicit instead of relying on paint order. */}
          <div style={{ position: "absolute", top: 90, right: 80, textAlign: "right", zIndex: 1 }}>
            <span style={{ fontFamily: "Cloudsofa", fontSize: 56, color: "#FFFFFF", letterSpacing: "-0.01em" }}>mongle</span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 260,
              left: 80,
              right: 80,
              textAlign: "right",
              fontSize: 82,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.16,
              letterSpacing: "-0.02em",
              zIndex: 1,
            }}
          >
            오늘부터,
            <br />
            매일의 구름을
            <br />
            쌓아보세요
          </div>
          <div
            style={{
              position: "absolute",
              right: 80,
              bottom: 90,
              textAlign: "right",
              fontSize: 24,
              color: "rgba(255,255,255,0.65)",
              zIndex: 1,
            }}
          >
            Copyright ⓒ mongle
          </div>
        </div>
      </Panel>
    </div>
  );
}

const HOME_W = 1260;
const HOME_H = Math.round((HOME_W * 19.5) / 9);
const homeScreen = getScreenSize(HOME_W, HOME_H);

const CLOSING_W = 1130;
const CLOSING_H = Math.round((CLOSING_W * 19.5) / 9);
const closingScreen = getScreenSize(CLOSING_W, CLOSING_H);

const STAGE_W = PANEL_W - 2 * 60;
const STAGE_H = Math.round((STAGE_W * 19.5) / 9);
const stageScreen = getScreenSize(STAGE_W, STAGE_H);

function StraightPanel({ prefix, emphasis, children }: { prefix: string; emphasis: string; children: React.ReactNode }) {
  return (
    <Panel>
      <div style={{ position: "absolute", top: CAPTION_TOP, left: 40, right: 40, textAlign: "center" }}>
        <div style={{ fontSize: 104, fontWeight: 700, color: sys.ink, lineHeight: 1.16, letterSpacing: "-0.02em" }}>
          {prefix}
          <br />
          <span style={{ fontWeight: 800, color: EMPHASIS_COLOR }}>{emphasis}</span>
        </div>
      </div>
      <PhoneFrame width={STAGE_W} height={STAGE_H} rotateDeg={0} style={{ left: (PANEL_W - STAGE_W) / 2, top: STAGE_TOP }}>
        <ScreenScale width={stageScreen.width} height={stageScreen.height}>
          {children}
        </ScreenScale>
      </PhoneFrame>
    </Panel>
  );
}
