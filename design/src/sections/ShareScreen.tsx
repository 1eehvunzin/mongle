import Glass from "../components/Glass";
import MongleMascot from "../components/MongleMascot";
import Icon from "../components/Icon";
import { glass } from "../theme";
import shareDusk from "../assets/photos/share-dusk.jpg";

// Recreates share.tsx's story card 1:1, using the dusk cloud photo the user
// provided (frontend/assets/ref/cloud (2).jpg).
export default function ShareScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, background: glass.bg }}>
      <div style={{ padding: "22px 0 0 10px" }}>
        <Icon name="chevron-back" size={24} color={glass.ink} />
      </div>

      <div style={{ margin: "6px 16px 0" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "9 / 16",
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: `0 24px 50px ${glass.blue.shadow}4d`,
          }}
        >
          <img src={shareDusk} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,30,36,0.05), rgba(20,30,36,0.55))" }} />

          <div style={{ position: "absolute", top: 13, left: 13 }}>
            <Glass tone={glass.white} radius={999} style={{ padding: "3px 7px" }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: glass.ink }}>No.014</span>
            </Glass>
          </div>
          <div style={{ position: "absolute", top: 13, right: 13 }}>
            <Glass tone={glass.white} radius={999} style={{ padding: "3px 7px" }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: glass.ink }}>★★☆ 희귀</span>
            </Glass>
          </div>

          <div style={{ position: "absolute", top: 52, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>여의도 한강공원</span>
            <span style={{ fontSize: 50, fontWeight: 700, color: "#fff", lineHeight: "55px" }}>26°</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", opacity: 0.85 }}>노을 · 8월 12일 오후 7:52</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginTop: 8 }}>양떼구름 · 권적운</span>
          </div>

          <div style={{ position: "absolute", bottom: 12, left: 10, right: 10, display: "flex", alignItems: "flex-end", gap: 5 }}>
            <MongleMascot size={38} />
            <div style={{ background: "#3C82F6", borderRadius: 14, borderBottomLeftRadius: 3, padding: "7px 10px", marginBottom: 4 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#fff" }}>노을 완전 예쁘다 🧡</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
          <Glass tone={glass.white} radius={12} style={{ flex: 1, padding: "11px 0", border: `1px solid ${glass.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icon name="download" size={14} color={glass.ink} />
              <span style={{ fontSize: 12, fontWeight: 600, color: glass.ink }}>저장</span>
            </div>
          </Glass>
          <Glass tone={glass.white} radius={12} style={{ flex: 1, padding: "11px 0", border: `1px solid ${glass.border}`, opacity: 0.4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icon name="link" size={14} color={glass.subMuted} />
              <span style={{ fontSize: 12, fontWeight: 600, color: glass.subMuted }}>링크</span>
            </div>
          </Glass>
        </div>

        <Glass tone={glass.blue} radius={999} style={{ marginTop: 14, padding: "15px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Icon name="share" size={15} color={glass.ink} />
            <span style={{ fontSize: 13, fontWeight: 700, color: glass.ink }}>스토리 공유하기</span>
          </div>
        </Glass>
      </div>
    </div>
  );
}
