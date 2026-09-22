import Icon from "../components/Icon";
import MongleMascot from "../components/MongleMascot";
import CardKeyboard from "../components/CardKeyboard";
import { glass } from "../theme";
import shareDusk from "../assets/photos/share-dusk.jpg";

// Ported from components/MessageCard.tsx + app/share.tsx: the shareable
// story card is now an iMessage compose-screen mockup, not a badged photo —
// a "To:" line carrying Mongle's own pitch (the mascot as the "contact"), a
// date/place/weather line, one already-sent bubble naming the cloud species
// just caught, and the photo still being typed up in the composer below,
// with a keyboard cut off at the bottom. Share-only now — no save/link row.
const IOS_BLUE = "#3478F6";
const SENT_BLUE = "#007AFF";
const GRAY_TEXT = "#8E8E93";
const HAIRLINE = "#D1D1D6";
const INK = "#000000";

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
            background: "#FFFFFF",
            boxShadow: `0 24px 50px ${glass.blue.shadow}4d`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Sheet header */}
          <div style={{ position: "relative", height: 36, paddingTop: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F7F7" }}>
            <span style={{ fontSize: 12, lineHeight: "16px", color: INK, fontWeight: 700 }}>새로운 메시지</span>
            <span style={{ position: "absolute", right: 12, top: 13.5, fontSize: 12, lineHeight: "16px", color: IOS_BLUE }}>취소</span>
          </div>

          {/* Recipient line */}
          <div
            style={{
              height: 29,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              background: "#FFFFFF",
              borderTop: `1px solid ${HAIRLINE}`,
              borderBottom: `1px solid ${HAIRLINE}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: "#EDEDED", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <MongleMascot size={13} />
              </div>
              <span style={{ fontSize: 11.5, lineHeight: "15px", color: GRAY_TEXT }}>
                To: <span style={{ color: INK }}>mongle: 구름을 수집하는 방법</span>
              </span>
            </div>
            <Icon name="add-circle-outline" size={18} color={IOS_BLUE} />
          </div>

          {/* Date/place/weather */}
          <span
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px 16px 0",
              fontSize: 9,
              lineHeight: "12px",
              color: GRAY_TEXT,
            }}
          >
            📍여의도 한강공원  🌇노을 22°
          </span>

          {/* Sent bubble — sits near the top of the thread, stacked oldest-first */}
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 10px 0" }}>
            <div style={{ maxWidth: "78%", background: SENT_BLUE, borderRadius: 15, borderBottomRightRadius: 4, padding: "7px 11px" }}>
              <span style={{ fontSize: 11.5, lineHeight: "15px", color: "#FFFFFF" }}>새털구름 ☁️</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Composer: "+" button, then the bubble holding photo + typed line */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, padding: "0 10.5px 11.5px 8px" }}>
            <div style={{ width: 27, height: 27, borderRadius: 13.5, background: "#E9E9EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="add" size={19} color="#7A7A80" />
            </div>

            <div style={{ flex: 1, borderRadius: 16, border: `1px solid ${HAIRLINE}`, background: "#FFFFFF", overflow: "hidden" }}>
              <div style={{ padding: 4 }}>
                <div style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 10.5, overflow: "hidden", background: "#E9E9EB" }}>
                  <img src={shareDusk} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              </div>
              <div style={{ minHeight: 29, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, padding: "4px 3px 4px 10px" }}>
                <span style={{ flex: 1, fontSize: 10.5, lineHeight: "14px", color: INK }}>노을 완전 예쁘다 🧡</span>
                <div style={{ width: 21, height: 21, borderRadius: 10.5, background: SENT_BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="arrow-up" size={14} color="#FFFFFF" />
                </div>
              </div>
            </div>
          </div>

          <CardKeyboard />
        </div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 999,
            padding: "15px 0",
            background: `linear-gradient(180deg, ${glass.blue.top} 0%, ${glass.blue.mid} 100%)`,
            boxShadow: `inset 0 -1.5px 0 0 ${glass.blue.rim}66`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Icon name="share" size={15} color={glass.ink} />
            <span style={{ fontSize: 13, fontWeight: 700, color: glass.ink }}>스토리 공유하기</span>
          </div>
        </div>
      </div>
    </div>
  );
}
