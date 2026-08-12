import Glass from "../components/Glass";
import MongleMascot from "../components/MongleMascot";
import Icon from "../components/Icon";
import HeroBlobs from "../components/HeroBlobs";
import { glass } from "../theme";
import recognitionSky from "../assets/photos/recognition-sky.jpg";
import streakSunset from "../assets/photos/streak-sunset.jpg";

// Desaturated sky tone for "맑음" — ported from home.tsx's SKY_GLASS map.
const SKY = { top: "#D2E9F1", mid: "#93C4D6", rim: "#4C8199", shadow: "#5D96AC" };

const RECENT = [
  { name: "뭉게구름", photo: recognitionSky },
  { name: "새털구름", photo: streakSunset },
];

export default function HomeScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: glass.bg }}>
      <div style={{ padding: "26px 16px 10px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: glass.sub }}>8월 12일 수요일</div>
        <div style={{ fontSize: 25, fontWeight: 700, color: glass.ink, letterSpacing: "-0.02em", marginTop: 1 }}>
          오늘의 하늘
        </div>
      </div>

      <div style={{ margin: "0 16px 22px" }}>
        <Glass
          tone={SKY}
          radius={24}
          style={{ padding: 14, display: "flex", flexDirection: "column", gap: 9, boxShadow: `0 22px 40px ${SKY.shadow}66` }}
        >
          <HeroBlobs />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Glass tone={glass.white} radius={999} style={{ padding: "6px 11px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="sunny" size={13} color={glass.ink} />
                <span style={{ fontSize: 11, fontWeight: 700, color: glass.ink }}>맑음 · 성산동</span>
              </div>
            </Glass>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(60,68,64,0.6)" }}>오후 2:14 기준</span>
              <Glass tone={glass.white} radius={13} style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="refresh" size={13} color={glass.ink} />
              </Glass>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: glass.ink, letterSpacing: "-0.03em" }}>28°</div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 6 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon name="sparkles" size={10} color={glass.accent} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: glass.ink }}>Lv.3</span>
                  </div>
                  <div style={{ marginTop: 4, height: 3, width: 40, borderRadius: 1.5, background: "rgba(60,68,64,0.15)", overflow: "hidden" }}>
                    <div style={{ width: "62%", height: "100%", background: glass.accent, borderRadius: 1.5 }} />
                  </div>
                </div>
                <div style={{ width: 1, height: 22, background: "rgba(60,68,64,0.15)", margin: "0 12px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="flame" size={10} color={glass.accent} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: glass.ink }}>4일째 연속</span>
                </div>
              </div>
            </div>
            <div style={{ width: 64, display: "flex", justifyContent: "center" }}>
              <MongleMascot size={64} />
            </div>
          </div>

          {/* Triangle + bubble grouped in one wrapper so the outer card's
              gap:9 lands once before this pair, not a second time between
              the pointer and the bubble it's supposed to touch. */}
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 22 }}>
              <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: `7px solid ${glass.white.top}` }} />
            </div>
            <Glass tone={glass.white} radius={16} style={{ padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 11.5, color: glass.ink, lineHeight: "16px", flex: 1 }}>
                  오늘은 <b>뭉게구름</b>이 잘 보이는 날! 찍어서 채워볼까?
                </span>
                <Icon name="camera" size={16} color={glass.ink} />
              </div>
            </Glass>
          </div>
        </Glass>
      </div>

      <div style={{ padding: "0 16px 11px" }}>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: glass.ink }}>최근 포착</span>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "0 16px" }}>
        {RECENT.map((r) => (
          <div key={r.name} style={{ width: 64, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Glass tone={glass.white} radius={33} style={{ width: 64, height: 64, overflow: "hidden", border: `1px solid ${glass.border}` }}>
              <img src={r.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Glass>
            <span style={{ fontSize: 9.5, fontWeight: 600, color: glass.ink, marginTop: 8 }}>{r.name}</span>
          </div>
        ))}
        <div style={{ width: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <div style={{ width: 64, height: 64, borderRadius: 33, border: `1px dashed ${glass.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20, color: glass.subMuted }}>→</span>
          </div>
          <span style={{ fontSize: 9.5, color: glass.subMuted }}>전체</span>
        </div>
      </div>
    </div>
  );
}
