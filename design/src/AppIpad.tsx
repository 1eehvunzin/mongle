import Panel from "./components/Panel";
import PhoneFrame, { getScreenSize } from "./components/PhoneFrame";
import ScreenScale from "./components/ScreenScale";
import { sys, COVER_GRADIENT } from "./theme";
import { CANVAS_H, CANVAS_W, PANEL_W, PANEL_H } from "./ipadLayout";

import HomeScreen from "./sections/HomeScreen";
import FeedScreen from "./sections/FeedScreen";
import RecognitionScreen from "./sections/RecognitionScreen";
import ShareScreen from "./sections/ShareScreen";
import MapScreen from "./sections/MapScreen";
import StreakScreen from "./sections/StreakScreen";

// iPad (12.9"/13") App Store screenshot set — same 6 marketing beats as
// App.tsx, re-laid-out for the iPad panel's much wider, closer-to-square
// canvas (2048x2732, ratio ~0.75) instead of the iPhone's tall 1284x2778
// (ratio ~0.46). A stacked caption-then-phone layout would leave the iPad
// canvas mostly empty on the sides, so straight panels go side-by-side
// (caption left, phone right) instead — the iPad canvas has the width to
// spare that the iPhone one didn't.
//
// The cover panel is a straight scale-up of Hero.tsx's two-phone composite
// (1200x1600, ratio 0.75 — effectively the same shape as this iPad panel),
// since that layout was already tuned for this exact aspect ratio.
const HERO_SCALE = PANEL_W / 1200;
const s = (n: number) => Math.round(n * HERO_SCALE);

// The caption's emphasized line uses the exact same blue as the cover/
// closing panels' background — one accent tying the whole set together,
// not an invented hue per screen (matches App.tsx's convention).
const EMPHASIS_COLOR = COVER_GRADIENT[1];

const MARGIN = 120;
const GAP = 60;
const TEXT_COL_W = 760;
const STAGE_LEFT = MARGIN + TEXT_COL_W + GAP;
const STAGE_W = PANEL_W - STAGE_LEFT - MARGIN;
const STAGE_H = Math.round((STAGE_W * 19.5) / 9);
const STAGE_TOP = Math.round((PANEL_H - STAGE_H) / 2);
const stageScreen = getScreenSize(STAGE_W, STAGE_H);

const CLOSING_STAGE_W = 900;
const CLOSING_STAGE_H = Math.round((CLOSING_STAGE_W * 19.5) / 9);
const CLOSING_STAGE_TOP = Math.round((PANEL_H - CLOSING_STAGE_H) / 2);
const CLOSING_STAGE_LEFT = MARGIN + Math.round((STAGE_W - CLOSING_STAGE_W) / 2);
const closingScreen = getScreenSize(CLOSING_STAGE_W, CLOSING_STAGE_H);

const COVER_BACK_W = s(480);
const COVER_BACK_H = Math.round((COVER_BACK_W * 19.5) / 9);
const coverBackScreen = getScreenSize(COVER_BACK_W, COVER_BACK_H);
const COVER_FRONT_W = s(600);
const COVER_FRONT_H = Math.round((COVER_FRONT_W * 19.5) / 9);
const coverFrontScreen = getScreenSize(COVER_FRONT_W, COVER_FRONT_H);

export default function AppIpad() {
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
      {/* ===== 1. COVER — Hero.tsx's two-phone composite, scaled up ===== */}
      <Panel width={PANEL_W} height={PANEL_H}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${COVER_GRADIENT[0]} 0%, ${COVER_GRADIENT[1]} 100%)`,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: s(50), left: s(50), fontFamily: "Cloudsofa", fontSize: s(130), color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.01em" }}>
            mongle
          </div>
          <div style={{ position: "absolute", top: s(178), left: s(50), fontSize: s(22), fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
            매일 올려다보는 하늘,
            <br />
            수집하는 재미가 되다.
          </div>
          <div
            style={{
              position: "absolute",
              top: s(60),
              left: s(620),
              right: s(50),
              textAlign: "right",
              fontSize: s(44),
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

          <PhoneFrame width={COVER_BACK_W} height={COVER_BACK_H} rotateDeg={6} style={{ left: s(640), top: s(400) }}>
            <ScreenScale width={coverBackScreen.width} height={coverBackScreen.height}>
              <StreakScreen />
            </ScreenScale>
          </PhoneFrame>
          <PhoneFrame width={COVER_FRONT_W} height={COVER_FRONT_H} rotateDeg={-6} style={{ left: s(80), top: s(260) }}>
            <ScreenScale width={coverFrontScreen.width} height={coverFrontScreen.height}>
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

      {/* ===== 6. CLOSING — phone left, right-aligned text right (mirrors
          the straight panels' left-text/right-phone rhythm) ===== */}
      <Panel width={PANEL_W} height={PANEL_H}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${COVER_GRADIENT[0]} 0%, ${COVER_GRADIENT[1]} 100%)`,
            overflow: "hidden",
          }}
        >
          <PhoneFrame width={CLOSING_STAGE_W} height={CLOSING_STAGE_H} rotateDeg={8} style={{ left: CLOSING_STAGE_LEFT, top: CLOSING_STAGE_TOP }}>
            <ScreenScale width={closingScreen.width} height={closingScreen.height}>
              <StreakScreen />
            </ScreenScale>
          </PhoneFrame>

          <div
            style={{
              position: "absolute",
              left: STAGE_LEFT,
              right: MARGIN,
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-end",
              textAlign: "right",
              zIndex: 1,
            }}
          >
            <span style={{ fontFamily: "Cloudsofa", fontSize: 64, color: "#FFFFFF", letterSpacing: "-0.01em" }}>mongle</span>
            <div style={{ marginTop: 28, fontSize: 88, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.18, letterSpacing: "-0.02em" }}>
              오늘부터,
              <br />
              매일의 구름을
              <br />
              쌓아보세요
            </div>
          </div>

          <div style={{ position: "absolute", right: MARGIN, bottom: 90, textAlign: "right", fontSize: 26, color: "rgba(255,255,255,0.65)", zIndex: 1 }}>
            Copyright ⓒ mongle
          </div>
        </div>
      </Panel>
    </div>
  );
}

function StraightPanel({ prefix, emphasis, children }: { prefix: string; emphasis: string; children: React.ReactNode }) {
  return (
    <Panel width={PANEL_W} height={PANEL_H}>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          width: TEXT_COL_W,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 82, fontWeight: 700, color: sys.ink, lineHeight: 1.24, letterSpacing: "-0.02em" }}>
          {prefix}
          <br />
          <span style={{ fontWeight: 800, color: EMPHASIS_COLOR }}>{emphasis}</span>
        </div>
      </div>
      <PhoneFrame width={STAGE_W} height={STAGE_H} rotateDeg={0} style={{ left: STAGE_LEFT, top: STAGE_TOP }}>
        <ScreenScale width={stageScreen.width} height={stageScreen.height}>
          {children}
        </ScreenScale>
      </PhoneFrame>
    </Panel>
  );
}
