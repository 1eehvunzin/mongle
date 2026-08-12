import Glass from "../components/Glass";
import Icon from "../components/Icon";
import Chip from "../components/Chip";
import { glass } from "../theme";
import recognitionSky from "../assets/photos/recognition-sky.jpg";

// Recreates capture.tsx's "result" phase exactly — full-bleed camera
// photo, the "인식 완료" status pill, and the 구름 등록 bottom sheet — but
// with the real photo the user supplied (frontend/assets/ref/cloud (1).jpg)
// standing in for the live camera feed instead of the AI-generated stock sky.
export default function RecognitionScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000" }}>
      <img src={recognitionSky} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "62%", objectFit: "cover" }} />

      <div style={{ position: "absolute", top: 40, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Glass tone={glass.white} radius={999} style={{ paddingLeft: 5, paddingRight: 11, paddingTop: 5, paddingBottom: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Glass tone={glass.blue} radius={9} style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="checkmark" size={12} color={glass.ink} />
            </Glass>
            <span style={{ fontSize: 11, fontWeight: 700, color: glass.ink }}>인식 완료</span>
          </div>
        </Glass>
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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: glass.ink }}>구름 등록</span>
          <Icon name="close" size={20} color={glass.subMuted} />
        </div>

        <Row label="이름" value="뭉게구름 (적운)" />

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${glass.border}` }}>
          <span style={{ color: glass.sub, fontSize: 13, width: 44 }}>기록</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Chip icon={<Icon name="location" size={11} color={glass.ink} />} label="성산동 405-6" />
            <Chip icon={<Icon name="sunny" size={11} color={glass.ink} />} label="28°" />
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <span style={{ fontSize: 13, color: glass.sub }}>한 줄 메모</span>
          <div style={{ fontSize: 14, color: glass.ink, marginTop: 5 }}>솜사탕 같이 몽글몽글한 오후…</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26, paddingTop: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: glass.subMuted }}>다시</span>
          <Glass
            tone={glass.white}
            radius={31}
            style={{ width: 62, height: 62, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${glass.blue.rim}` }}
          >
            <Glass tone={glass.blue} radius={23} style={{ width: 46, height: 46 }} />
          </Glass>
          <span style={{ fontSize: 14, fontWeight: 700, color: glass.accent }}>등록</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${glass.border}` }}>
      <span style={{ color: glass.sub, fontSize: 13, width: 44 }}>{label}</span>
      <span style={{ flex: 1, color: glass.ink, fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
  );
}
