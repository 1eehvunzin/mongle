import type { ReactNode } from "react";
import Icon from "./Icon";

// CSS port of components/CardKeyboard.tsx: a static, decorative iOS-style
// QWERTY keyboard cut off at the story card's bottom edge, same as a real
// screenshot of the compose screen would be. Proportions (measured from an
// iOS Messages screenshot) are 1:1 with the RN original's `u`-multiplied
// values — this mockup already treats every card pixel as `u = 1`.
const LETTER_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const KEY_BG = "#FFFFFF";
const KEY_DARK = "#ACB0BC";
const KEY_EDGE = "#898A8D";
const BOARD_BG = "#D1D4DA";
const INK = "#000000";

const KEY_W = 25.6;
const KEY_H = 33;
const LETTER_GAP = 4.9;
const ROW_GAP = 9.6;
const WIDE_W = 32.6;
const SPACE_W = 71.3;
const RETURN_W = 70.9;

function Key({ width = KEY_W, dark = false, children }: { width?: number; dark?: boolean; children?: ReactNode }) {
  return (
    <div
      style={{
        width,
        height: KEY_H,
        borderRadius: 5,
        background: dark ? KEY_DARK : KEY_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 1px 0 0 ${KEY_EDGE}`,
      }}
    >
      {children}
    </div>
  );
}

function Label({ text, size = 17 }: { text: string; size?: number }) {
  return <span style={{ fontSize: size, lineHeight: `${KEY_H}px`, color: INK }}>{text}</span>;
}

function Row({ gap = LETTER_GAP, children }: { gap?: number; children: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap }}>
      {children}
    </div>
  );
}

export default function CardKeyboard() {
  return (
    <div style={{ position: "relative", background: BOARD_BG, paddingTop: 5, paddingBottom: 20, display: "flex", flexDirection: "column", gap: ROW_GAP }}>
      <Row>
        {LETTER_ROWS[0].map((k) => (
          <Key key={k}>
            <Label text={k} />
          </Key>
        ))}
      </Row>
      <Row>
        {LETTER_ROWS[1].map((k) => (
          <Key key={k}>
            <Label text={k} />
          </Key>
        ))}
      </Row>
      <Row>
        <div style={{ marginRight: 8.1 }}>
          <Key width={WIDE_W} dark>
            <Icon name="arrow-up" size={17} color={INK} />
          </Key>
        </div>
        {LETTER_ROWS[2].map((k) => (
          <Key key={k}>
            <Label text={k} />
          </Key>
        ))}
        <div style={{ marginLeft: 6.6 }}>
          <Key width={WIDE_W} dark>
            <span style={{ fontSize: 15 }}>⌫</span>
          </Key>
        </div>
      </Row>
      <Row gap={5.3}>
        <Key width={WIDE_W} dark>
          <Label text="123" size={13.5} />
        </Key>
        <Key width={WIDE_W} dark>
          <span style={{ fontSize: 15 }}>🙂</span>
        </Key>
        <Key width={SPACE_W}>
          <span style={{ fontSize: 4.6, color: "#7C7D80" }}>space</span>
        </Key>
        <Key width={WIDE_W}>
          <Label text="@" />
        </Key>
        <Key width={WIDE_W}>
          <Label text="." />
        </Key>
        <Key width={RETURN_W} dark>
          <Label text="return" size={13.5} />
        </Key>
      </Row>
      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 100, height: 4, borderRadius: 2, background: "#000000" }} />
    </div>
  );
}
