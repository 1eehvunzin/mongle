import Glass from "../components/Glass";
import Icon from "../components/Icon";
import { glass } from "../theme";

// Ported straight from components/MapScreen.tsx: same fixed pin canvas
// positions, same "label above pin" style, same "내 최근 기록" plain-card list
// (star rating at right, not a time stamp).
const PIN_POSITIONS = [
  { top: 70, left: 90, label: "성산동" },
  { top: 130, left: 210, label: "여의도" },
  { top: 40, left: 250, label: "남산" },
  { top: 190, left: 60, label: "잠실" },
];

const LIST = [
  { name: "뭉게구름", place: "성산동", ago: "12분 전", stars: "★☆☆" },
  { name: "양떼구름", place: "여의도 한강공원", ago: "3시간 전", stars: "★★☆" },
  { name: "새털구름", place: "남산", ago: "1일 전", stars: "★☆☆" },
];

export default function MapScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: glass.bg }}>
      <div style={{ padding: "26px 16px 6px" }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: glass.ink, letterSpacing: "-0.02em" }}>구름 지도</span>
      </div>

      <Glass tone={glass.gray} radius={20} style={{ margin: "0 16px", height: 230, position: "relative", border: `1px solid ${glass.border}`, overflow: "hidden" }}>
        <MapTexture />
        {PIN_POSITIONS.map((p) => (
          <div key={p.label} style={{ position: "absolute", top: p.top, left: p.left, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: glass.ink, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "1px 6px", whiteSpace: "nowrap" }}>
              {p.label}
            </span>
            <Glass
              tone={glass.blue}
              radius={14}
              style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", marginTop: 3 }}
            >
              <Icon name="location" size={15} color={glass.ink} />
            </Glass>
          </div>
        ))}
      </Glass>

      <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: glass.subMuted, margin: "16px 16px 7px" }}>내 최근 기록</span>

      <div style={{ margin: "0 16px", borderRadius: 18, background: glass.white.top, border: `1px solid ${glass.border}`, overflow: "hidden" }}>
        {LIST.map((item, i) => (
          <div
            key={item.name}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: i === LIST.length - 1 ? "none" : `1px solid ${glass.border}` }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: glass.ink }}>{item.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                <Icon name="location" size={10} color={glass.subMuted} />
                <span style={{ fontSize: 10.5, color: glass.subMuted }}>
                  {item.place} · {item.ago}
                </span>
              </div>
            </div>
            <span style={{ fontSize: 10.5, color: glass.subMuted }}>{item.stars}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// The real (web) MapScreen has no actual map — react-native-maps has no web
// target, so it's a plain gray placeholder there. For this marketing
// screenshot the map needs to actually read as a map, so this is a
// deliberate, labeled departure from strict fidelity: a light decorative
// road-grid + park/river texture behind the pins, not literal geo data.
function MapTexture() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: "#E4E7DC" }} />
      <div style={{ position: "absolute", left: -30, top: 40, width: 150, height: 150, borderRadius: "50%", background: "#CFE0C8" }} />
      <div style={{ position: "absolute", right: -20, bottom: -30, width: 130, height: 130, borderRadius: 24, background: "#CBDCE6" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <line x1="0" y1="60" x2="100%" y2="90" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="0" y1="150" x2="100%" y2="130" stroke="#FFFFFF" strokeWidth="5" />
        <line x1="70" y1="0" x2="110" y2="100%" stroke="#FFFFFF" strokeWidth="5" />
        <line x1="220" y1="0" x2="260" y2="100%" stroke="#FFFFFF" strokeWidth="4" />
      </svg>
    </div>
  );
}
