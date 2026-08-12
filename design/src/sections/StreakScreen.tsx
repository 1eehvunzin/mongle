import Glass from "../components/Glass";
import MongleMascot from "../components/MongleMascot";
import Icon from "../components/Icon";
import { glass, STREAK_TONE } from "../theme";

const WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const WEEK_CHECKS = [true, true, true, true, false, false, false];
const HEAT_COLORS = [glass.border, glass.blue.top, glass.blue.mid, "#7BB4C8", glass.blue.rim];
const HEAT = Array.from({ length: 35 }, (_, i) => (i * 7 + 3) % 5);

export default function StreakScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: glass.bg }}>
      <div style={{ padding: "26px 16px 6px" }}>
        <span style={{ fontSize: 25, fontWeight: 700, color: glass.ink, letterSpacing: "-0.02em" }}>나</span>
      </div>

      <div style={{ margin: "10px 16px 0" }}>
        <Glass tone={glass.white} radius={20} style={{ padding: 16, display: "flex", gap: 13, border: `1px solid ${glass.border}` }}>
          <Glass tone={glass.gray} radius={23} style={{ width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MongleMascot size={34} />
          </Glass>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: glass.ink }}>구름지기</span>
              <span style={{ fontSize: 10, color: glass.subMuted }}>다음까지 3회</span>
            </div>
            <div style={{ fontSize: 10.5, color: glass.sub, marginTop: 1 }}>몽글 새싹 · 4일째 · Lv.3</div>
            <div style={{ marginTop: 9, height: 5, borderRadius: 2.5, background: "rgba(60,68,64,0.12)", overflow: "hidden" }}>
              <Glass tone={glass.blue} radius={2.5} style={{ width: "62%", height: "100%" }} />
            </div>
          </div>
        </Glass>
      </div>

      <div style={{ margin: "14px 16px 0" }}>
        <Glass tone={STREAK_TONE} radius={24} style={{ padding: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Icon name="flame" size={22} color="#fff" />
            <span style={{ fontSize: 42, fontWeight: 700, color: "#fff", marginTop: 2 }}>4일째</span>
            <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>연속 관측 · 최장 9일</span>
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
            {WEEK_LABELS.map((label, i) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                {WEEK_CHECKS[i] ? (
                  <Glass tone={glass.blue} radius={10} style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="checkmark" size={12} color={glass.ink} />
                  </Glass>
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: "rgba(255,255,255,0.12)" }} />
                )}
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{label}</span>
              </div>
            ))}
          </div>
        </Glass>
      </div>

      <div style={{ margin: "14px 16px 0" }}>
        <Glass tone={glass.white} radius={20} style={{ padding: 14, border: `1px solid ${glass.border}` }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: glass.sub }}>
            최근 35일 관측 · 가장 많이 본 구름 <b style={{ color: glass.ink }}>뭉게구름</b>
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10, marginLeft: -1.5, marginRight: -1.5 }}>
            {HEAT.map((level, i) => (
              <div key={i} style={{ width: `${100 / 7}%`, aspectRatio: "1", padding: 1.5 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: 4, background: HEAT_COLORS[level] }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 9.5, color: glass.subMuted }}>적음</span>
            {HEAT_COLORS.map((c) => (
              <div key={c} style={{ width: 9, height: 9, borderRadius: 2.5, background: c }} />
            ))}
            <span style={{ fontSize: 9.5, color: glass.subMuted }}>많음</span>
          </div>
        </Glass>
      </div>

      <div style={{ margin: "14px 16px 0" }}>
        <Glass tone={glass.white} radius={16} style={{ border: `1px solid ${glass.border}`, overflow: "hidden" }}>
          <SettingsRow icon="chatbubble" label="피드백 보내기" />
          <SettingsRow icon="info" label="버전 정보" value="1.0.0" last />
        </Glass>
      </div>
    </div>
  );
}

// Ported exactly from profile.tsx's SettingsRow: a plain (unbadged) icon —
// not one of the app's usual circular Glass icon chips — since this list is
// the one place the real screen deliberately keeps it that simple, and a
// trailing chevron takes over whenever there's no value to show instead.
function SettingsRow({ icon, label, value, last }: { icon: "chatbubble" | "info"; label: string; value?: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "13px 14px",
        borderBottom: last ? "none" : `1px solid ${glass.border}`,
      }}
    >
      <Icon name={icon} size={17} color={glass.sub} />
      <span style={{ flex: 1, fontSize: 13, color: glass.ink }}>{label}</span>
      {value ? <span style={{ fontSize: 12, color: glass.subMuted }}>{value}</span> : <Icon name="chevron-forward" size={15} color={glass.subMuted} />}
    </div>
  );
}
