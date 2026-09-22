import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CardKeyboard from "./CardKeyboard";
import MongleMascot from "./MongleMascot";
import { glass } from "../constants/aquaTheme";

// iOS system colors, as read off a Messages screenshot.
const IOS_BLUE = "#3478F6";
// The sent-bubble blue — iOS's actual system blue for a sent message, one
// tick more saturated than IOS_BLUE above. The send button picks this up too,
// once composing/sending, gray only would look muted.
const SENT_BLUE = "#007AFF";
const GRAY_TEXT = "#8E8E93";
const HAIRLINE = "#D1D1D6";
const INK = "#000000";

// The shareable story card, styled as a phone messaging screen mid-compose:
// a "To:" line carrying Mongle's own pitch (the mascot as the "contact"), a
// fixed date/place/weather line under it, one already-sent message naming
// the cloud species just caught, and — still being typed — the photo
// dropped into the composer with a caption, and a keyboard underneath.
//
// Proportions come from an iOS Messages screenshot (736 px wide): every size
// below is a multiple of `u` = card width / 300, so the on-screen preview and
// the exported image are the same picture at any card width.
export default function MessageCard({
  width,
  recipient,
  sentText,
  caption,
  photo,
  loading,
  meta,
}: {
  width: number;
  // "To:" line — Mongle's own name/pitch, not the cloud's.
  recipient: string;
  // The already-sent bubble's text — the cloud species just caught, by its
  // Korean name (e.g. "뭉게구름"), not the technical meteorology term.
  sentText: string;
  caption: string;
  photo: ImageSourcePropType;
  loading: boolean;
  // Place + weather, e.g. "8월 14일 오후 7:41  📍서울 성동구  ☀️맑음 22°".
  meta?: string | null;
}) {
  const u = width / 300;
  const hair = Math.max(StyleSheet.hairlineWidth, 0.85 * u);
  return (
    <View
      style={{
        width,
        alignSelf: "center",
        aspectRatio: 9 / 16,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {/* Sheet header. A real new-message screen has a status bar and a
          title bar ("새로운 메시지" / "취소") above the To: line; the
          reference screenshot was cropped just below it. This gives the card
          its top breathing room. */}
      <View
        style={{
          height: 36 * u,
          paddingTop: 10 * u,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F7F7F7",
        }}
      >
        <Text
          style={{
            fontSize: 12 * u,
            lineHeight: 16 * u,
            color: INK,
            fontWeight: "700",
          }}
        >
          새로운 메시지
        </Text>
        <Text
          style={{
            position: "absolute",
            right: 12 * u,
            top: 13.5 * u,
            fontSize: 12 * u,
            lineHeight: 16 * u,
            color: IOS_BLUE,
          }}
        >
          취소
        </Text>
      </View>

      {/* Recipient line */}
      <View
        style={{
          height: 29 * u,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10 * u,
          backgroundColor: "#FFFFFF",
          borderTopWidth: hair,
          borderBottomWidth: hair,
          borderColor: HAIRLINE,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 * u }}>
          {/* The cloud's own "contact photo" — a small, natural place to
              plant the mascot without stepping outside the iMessage frame,
              the way a saved contact's photo would normally sit here. */}
          <View
            style={{
              width: 16 * u,
              height: 16 * u,
              borderRadius: 8 * u,
              backgroundColor: "#EDEDED",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <MongleMascot size={13 * u} />
          </View>
          <Text
            style={{
              fontSize: 11.5 * u,
              lineHeight: 15 * u,
              color: GRAY_TEXT,
            }}
          >
            To: <Text style={{ color: INK }}>{recipient}</Text>
          </Text>
        </View>
        <Ionicons name="add-circle-outline" size={18 * u} color={IOS_BLUE} />
      </View>

      {/* Date/place/weather — fixed under the recipient line rather than
          floating just above the bubble, so it reads as thread context
          ("today, here, this weather"). No divider — it sits on the same
          plain white as the rest of the thread above the messages. */}
      {meta ? (
        <Text
          numberOfLines={1}
          style={{
            textAlign: "center",
            paddingHorizontal: 16 * u,
            paddingTop: 12 * u,
            fontSize: 9 * u,
            lineHeight: 12 * u,
            color: GRAY_TEXT,
          }}
        >
          {meta}
        </Text>
      ) : null}

      {/* One earlier message, already sent — blue and right-aligned like a
          real sent bubble — naming the cloud species just caught. Sits right
          under the meta line, at the top of the thread, the way a thread's
          oldest message stacks first with everything after it filling in
          below — not pinned to the bottom above the composer. */}
      <View
        style={{
          alignItems: "flex-end",
          paddingHorizontal: 10 * u,
          paddingTop: 14 * u,
        }}
      >
        <View
          style={{
            maxWidth: "78%",
            backgroundColor: SENT_BLUE,
            borderRadius: 15 * u,
            borderBottomRightRadius: 4 * u,
            paddingHorizontal: 11 * u,
            paddingVertical: 7 * u,
          }}
        >
          <Text style={{ fontSize: 11.5 * u, lineHeight: 15 * u, color: "#FFFFFF" }}>
            {sentText}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      {/* Composer: "+" button, then the bubble holding photo + typed line —
          still being written, not sent yet. */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10 * u,
          paddingLeft: 8 * u,
          paddingRight: 10.5 * u,
          paddingBottom: 11.5 * u,
        }}
      >
        <View
          style={{
            width: 27 * u,
            height: 27 * u,
            borderRadius: (27 * u) / 2,
            backgroundColor: "#E9E9EB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={19 * u} color="#7A7A80" />
        </View>

        <View
          style={{
            flex: 1,
            borderRadius: 16 * u,
            borderWidth: hair,
            borderColor: HAIRLINE,
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <View style={{ padding: 4 * u }}>
            <View
              style={{
                width: "100%",
                aspectRatio: 16 / 9,
                borderRadius: 10.5 * u,
                overflow: "hidden",
                backgroundColor: "#E9E9EB",
              }}
            >
              <Image
                source={photo}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </View>
          <View
            style={{
              minHeight: 29 * u,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6 * u,
              paddingLeft: 10 * u,
              paddingRight: 3 * u,
              paddingVertical: 4 * u,
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                fontSize: 10.5 * u,
                lineHeight: 14 * u,
                color: INK,
              }}
            >
              {caption}
            </Text>
            <View
              style={{
                width: 21 * u,
                height: 21 * u,
                borderRadius: (21 * u) / 2,
                backgroundColor: SENT_BLUE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-up" size={14 * u} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </View>

      <CardKeyboard u={u} />

      {loading ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.6)",
            },
          ]}
        >
          <ActivityIndicator color={glass.accent} />
        </View>
      ) : null}
    </View>
  );
}
