import Panel from "./components/Panel";
import IpadFrame, { getIpadScreenSize } from "./components/IpadFrame";
import IpadScreenContent from "./components/IpadScreenContent";
import { sys, COVER_GRADIENT } from "./theme";
import { CANVAS_H, CANVAS_W, PANEL_W, PANEL_H } from "./ipadLayout";

import HomeScreen from "./sections/HomeScreen";
import FeedScreen from "./sections/FeedScreen";
import RecognitionScreen from "./sections/RecognitionScreen";
import ShareScreen from "./sections/ShareScreen";
import MapScreen from "./sections/MapScreen";
import StreakScreen from "./sections/StreakScreen";

// iPad (12.9"/13") App Store screenshot set — same 6 marketing beats as
// App.tsx, but showing an actual iPad-shaped device mockup (IpadFrame)
// instead of the iPhone bezel. The app has no iPad-specific UI, so each
// frame's screen area shows the same phone-shaped screen centered with
// blank space on either side — exactly how a non-iPad-optimized iPhone
// app actually renders on an iPad, rather than stretching/cropping the UI
// to fill the wider screen.
const EMPHASIS_COLOR = COVER_GRADIENT[1];

const CAPTION_TOP = 190;
const STAGE_TOP = 560;
const SIDE_MARGIN = 140;
const BOTTOM_MARGIN = 120;

const STAGE_W = Math.min(
  PANEL_W - 2 * SIDE_MARGIN,
  Math.round(((PANEL_H - STAGE_TOP - BOTTOM_MARGIN) * 3) / 4),
);
const STAGE_H = Math.round((STAGE_W * 4) / 3);
const STAGE_LEFT = Math.round((PANEL_W - STAGE_W) / 2);
const stageScreen = getIpadScreenSize(STAGE_W, STAGE_H);

const COVER_W = 1500;
const COVER_H = Math.round((COVER_W * 4) / 3);
const coverScreen = getIpadScreenSize(COVER_W, COVER_H);

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
      {/* ===== 1. COVER ===== */}
      <Panel width={PANEL_W} height={PANEL_H}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${COVER_GRADIENT[0]} 0%, ${COVER_GRADIENT[1]} 100%)`,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 90, left: 100, fontFamily: "Cloudsofa", fontSize: 210, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.01em" }}>
            mongle
          </div>
          <div style={{ position: "absolute", top: 340, left: 100, right: 160, fontSize: 42, fontWeight: 600, color: "rgba(255,255,255,0.9)", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
            매일 올려다보는 하늘,
            <br />
            수집하는 재미가 되다.
          </div>
          <IpadFrame width={COVER_W} height={COVER_H} rotateDeg={-6} style={{ left: PANEL_W - COVER_W + 220, top: PANEL_H - COVER_H - 60 }}>
            <IpadScreenContent width={coverScreen.width} height={coverScreen.height}>
              <HomeScreen />
            </IpadScreenContent>
          </IpadFrame>
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
      <Panel width={PANEL_W} height={PANEL_H}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(160deg, ${COVER_GRADIENT[0]} 0%, ${COVER_GRADIENT[1]} 100%)`,
            overflow: "hidden",
          }}
        >
          <IpadFrame width={COVER_W} height={COVER_H} rotateDeg={6} style={{ left: -220, top: PANEL_H - COVER_H - 60 }}>
            <IpadScreenContent width={coverScreen.width} height={coverScreen.height}>
              <StreakScreen />
            </IpadScreenContent>
          </IpadFrame>
          <div style={{ position: "absolute", top: 90, right: 100, textAlign: "right", zIndex: 1 }}>
            <span style={{ fontFamily: "Cloudsofa", fontSize: 56, color: "#FFFFFF", letterSpacing: "-0.01em" }}>mongle</span>
          </div>
          <div
            style={{
              position: "absolute",
              top: 260,
              left: 100,
              right: 100,
              textAlign: "right",
              fontSize: 84,
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
          <div style={{ position: "absolute", right: 100, bottom: 90, textAlign: "right", fontSize: 26, color: "rgba(255,255,255,0.65)", zIndex: 1 }}>
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
      <div style={{ position: "absolute", top: CAPTION_TOP, left: 60, right: 60, textAlign: "center" }}>
        <div style={{ fontSize: 100, fontWeight: 700, color: sys.ink, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          {prefix}
          <br />
          <span style={{ fontWeight: 800, color: EMPHASIS_COLOR }}>{emphasis}</span>
        </div>
      </div>
      <IpadFrame width={STAGE_W} height={STAGE_H} rotateDeg={0} style={{ left: STAGE_LEFT, top: STAGE_TOP }}>
        <IpadScreenContent width={stageScreen.width} height={stageScreen.height}>
          {children}
        </IpadScreenContent>
      </IpadFrame>
    </Panel>
  );
}
