import Icon from "../components/Icon";
import { glass } from "../theme";
import streakSunset from "../assets/photos/streak-sunset.jpg";

// Ported from app/draw.tsx's "이름 짓기" step: the moment right after
// drawing — a dashed white stroke traced onto the photo (same brush spec:
// white, 78% opacity, 10px wide, "16,20" dash — see draw.tsx's own comment
// for why the gap has to clear the stroke width to read as a gap at all),
// and the naming sheet underneath with the preset shape list + custom name
// field + register button.
const PRESETS = ["하트", "토끼", "고래", "강아지", "물고기", "용", "손", "얼굴"];

// A parametric heart curve (the classic 16sin³t formula), sampled into
// points the same way draw.tsx's own touch-tracked strokes are — so the
// dashed path here is built exactly like a real one, not a hand-authored
// SVG heart shape.
function heartPoints(cx: number, cy: number, scale: number): string {
  const pts: string[] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const px = cx + (x * scale) / 16;
    const py = cy + (y * scale) / 16;
    pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return pts.join(" ");
}

export default function ShapeCloudScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000" }}>
      <div style={{ position: "relative", width: "100%", height: "62%", overflow: "hidden" }}>
        <img src={streakSunset} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <path
            d={heartPoints(151, 210, 88)}
            stroke="#FFFFFF"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.78}
            strokeDasharray="16,20"
          />
        </svg>
        <div style={{ position: "absolute", top: 22, left: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" size={16} color={glass.ink} />
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: glass.card,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingBottom: 26,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, margin: "10px auto 0", background: glass.border }} />
        <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: glass.ink, padding: "14px 16px 0" }}>
          무슨 모양인가요?
        </span>
        <span style={{ display: "block", fontSize: 12, color: glass.sub, padding: "4px 16px 0" }}>
          목록에서 고르거나 직접 이름을 지어주세요
        </span>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 16px 0" }}>
          {PRESETS.map((label, i) => {
            const active = i === 0;
            return (
              <div
                key={label}
                style={{
                  padding: "0 14px",
                  height: 34,
                  borderRadius: 17,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? glass.ink : "#FFFFFF",
                  boxShadow: active ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? "#FFFFFF" : glass.ink }}>
                  {label}구름
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ margin: "12px 16px 0", border: `1px solid ${glass.border}`, borderRadius: 12, padding: "10px 14px" }}>
          <span style={{ fontSize: 13, color: glass.ink }}>하트구름</span>
        </div>

        <div
          style={{
            margin: "14px 16px 0",
            borderRadius: 999,
            padding: "15px 0",
            background: `linear-gradient(180deg, ${glass.blue.top} 0%, ${glass.blue.mid} 100%)`,
            boxShadow: `inset 0 -1.5px 0 0 ${glass.blue.rim}66`,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: glass.ink }}>모양 구름으로 등록</span>
        </div>
      </div>
    </div>
  );
}
