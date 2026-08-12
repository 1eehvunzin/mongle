import Glass from "../components/Glass";
import MongleMascot from "../components/MongleMascot";
import Icon from "../components/Icon";
import { glass } from "../theme";
import shareDusk from "../assets/photos/share-dusk.jpg";
import streakSunset from "../assets/photos/streak-sunset.jpg";
import recognitionSky from "../assets/photos/recognition-sky.jpg";

const CARDS = [
  { photo: recognitionSky, cond: "맑음", name: "뭉게구름", temp: 28, place: "성산동", ago: "12분 전" },
  { photo: shareDusk, cond: "노을", name: "새털구름", temp: 22, place: "여의도 한강공원", ago: "3시간 전" },
  { photo: streakSunset, cond: "구름조금", name: "양떼구름", temp: 24, place: "남산", ago: "1일 전" },
];

export default function FeedScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: glass.bg }}>
      <div style={{ padding: "26px 16px 6px" }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: glass.ink, letterSpacing: "-0.02em" }}>구름 피드</span>
      </div>
      <div style={{ padding: "6px 0 0" }}>
        {CARDS.map((c) => (
          <Glass
            key={c.name}
            tone={glass.white}
            radius={20}
            style={{ margin: "0 16px 14px", border: `1px solid ${glass.border}` }}
          >
            <div style={{ height: 190, position: "relative" }}>
              <img src={c.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,24,22,0.05), rgba(20,24,22,0.5))" }} />
              <div style={{ position: "absolute", top: 14, left: 16 }}>
                <Glass tone={glass.white} radius={999} style={{ paddingLeft: 4, paddingRight: 9, paddingTop: 4, paddingBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Glass tone={glass.blue} radius={9} style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="cloud" size={11} color={glass.ink} />
                    </Glass>
                    <span style={{ fontSize: 11, fontWeight: 700, color: glass.ink }}>
                      {c.cond} · {c.name} · {c.temp}°
                    </span>
                  </div>
                </Glass>
              </div>
              <div style={{ position: "absolute", bottom: 10, right: 14 }}>
                <MongleMascot size={44} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: 12 }}>
              <Glass tone={glass.gray} radius={15} style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MongleMascot size={22} />
              </Glass>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: glass.ink }}>구름지기</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                  <Icon name="location" size={10} color={glass.subMuted} />
                  <span style={{ fontSize: 10.5, color: glass.subMuted }}>
                    {c.place} · {c.ago}
                  </span>
                </div>
              </div>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
