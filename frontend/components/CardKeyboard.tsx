import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

// Proportions measured from an iOS Messages screenshot, in units of `u`
// (card width / 300): a letter key is ~25.6u wide and ~33u tall, letters sit
// ~4.9u apart, rows are ~42.6u apart, and the function keys are ~1.27 letter
// keys wide.
const KEY_W = 25.6;
const KEY_H = 33;
const LETTER_GAP = 4.9;
const ROW_GAP = 9.6;
const WIDE_W = 32.6; // 123, emoji, @, ., shift, delete
const SPACE_W = 71.3;
const RETURN_W = 70.9;

function Key({
  u,
  width = KEY_W,
  dark = false,
  children,
}: {
  u: number;
  width?: number;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: width * u,
        height: KEY_H * u,
        borderRadius: 5 * u,
        backgroundColor: dark ? KEY_DARK : KEY_BG,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: KEY_EDGE,
        shadowOpacity: 1,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 1 * u },
      }}
    >
      {children}
    </View>
  );
}

function Label({
  u,
  text,
  size = 17,
}: {
  u: number;
  text: string;
  size?: number;
}) {
  return (
    <Text
      style={{
        fontSize: size * u,
        lineHeight: KEY_H * u,
        color: INK,
        includeFontPadding: false,
      }}
    >
      {text}
    </Text>
  );
}

function Row({
  u,
  gap = LETTER_GAP,
  children,
}: {
  u: number;
  gap?: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: gap * u,
      }}
    >
      {children}
    </View>
  );
}

// A static, decorative phone keyboard for the message-style story card: an
// English QWERTY layout like the reference, cut off at the bottom edge the way
// a screenshot of the compose screen is.
export default function CardKeyboard({ u }: { u: number }) {
  return (
    <View
      style={{
        backgroundColor: BOARD_BG,
        paddingTop: 5 * u,
        // Room below the last row for the home indicator, so the rows sit
        // clear of the card's rounded bottom corners.
        paddingBottom: 20 * u,
        gap: ROW_GAP * u,
      }}
    >
      <Row u={u}>
        {LETTER_ROWS[0].map((k) => (
          <Key key={k} u={u}>
            <Label u={u} text={k} />
          </Key>
        ))}
      </Row>
      <Row u={u}>
        {LETTER_ROWS[1].map((k) => (
          <Key key={k} u={u}>
            <Label u={u} text={k} />
          </Key>
        ))}
      </Row>
      <Row u={u}>
        <View style={{ marginRight: 8.1 * u }}>
          <Key u={u} width={WIDE_W} dark>
            <Ionicons name="arrow-up-outline" size={17 * u} color={INK} />
          </Key>
        </View>
        {LETTER_ROWS[2].map((k) => (
          <Key key={k} u={u}>
            <Label u={u} text={k} />
          </Key>
        ))}
        <View style={{ marginLeft: 6.6 * u }}>
          <Key u={u} width={WIDE_W} dark>
            <Ionicons name="backspace-outline" size={19 * u} color={INK} />
          </Key>
        </View>
      </Row>
      <Row u={u} gap={5.3}>
        <Key u={u} width={WIDE_W} dark>
          <Label u={u} text="123" size={13.5} />
        </Key>
        <Key u={u} width={WIDE_W} dark>
          <Ionicons name="happy-outline" size={18 * u} color={INK} />
        </Key>
        <Key u={u} width={SPACE_W}>
          <View
            style={{ position: "absolute", bottom: 3 * u, alignSelf: "center" }}
          >
            <Text style={{ fontSize: 4.6 * u, color: "#7C7D80" }}>space</Text>
          </View>
        </Key>
        <Key u={u} width={WIDE_W}>
          <Label u={u} text="@" />
        </Key>
        <Key u={u} width={WIDE_W}>
          <Label u={u} text="." />
        </Key>
        <Key u={u} width={RETURN_W} dark>
          <Label u={u} text="return" size={13.5} />
        </Key>
      </Row>
      <View
        style={{
          position: "absolute",
          bottom: 6 * u,
          alignSelf: "center",
          width: 100 * u,
          height: 4 * u,
          borderRadius: 2 * u,
          backgroundColor: "#000000",
        }}
      />
    </View>
  );
}
