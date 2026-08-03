import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Glass from "./Glass";
import { glass } from "../constants/aquaTheme";
import { pins } from "../constants/mock";
import { rs } from "../constants/scale";

// Web fallback — react-native-maps has no web target, and Expo Router's
// file-based routing pulls in every platform-suffixed file under app/
// regardless of platform (a .native.tsx route file there still broke the
// web bundle). Per Expo Router's own guidance, platform variants have to
// live outside app/ as plain components re-exported by the route — see
// MapScreen.native.tsx for the real MapView version native picks up instead.
const PIN_POSITIONS = [
  { top: 70, left: 90 },
  { top: 130, left: 210 },
  { top: 40, left: 250 },
  { top: 190, left: 60 },
];

export default function MapScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: glass.bg }}
      edges={["top"]}
    >
      <View
        style={{
          paddingHorizontal: rs(16),
          paddingTop: rs(2),
          paddingBottom: rs(6),
        }}
      >
        <Text
          className="font-bold"
          style={{ fontSize: rs(24), color: glass.ink, letterSpacing: -0.3 }}
        >
          구름 지도
        </Text>
      </View>

      <Glass
        tone={glass.gray}
        radius={rs(20)}
        style={{
          marginHorizontal: rs(16),
          height: rs(230),
          borderWidth: 1,
          borderColor: glass.border,
        }}
      >
        {pins.map((p, i) => (
          <View
            key={p.place}
            style={{
              position: "absolute",
              top: rs(PIN_POSITIONS[i % PIN_POSITIONS.length].top),
              left: rs(PIN_POSITIONS[i % PIN_POSITIONS.length].left),
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: rs(9),
                fontWeight: "700",
                color: glass.ink,
                backgroundColor: "rgba(255,255,255,0.92)",
                borderRadius: rs(8),
                paddingHorizontal: rs(6),
                paddingVertical: rs(1),
              }}
            >
              {p.place}
            </Text>
            <Glass
              tone={glass.blue}
              radius={rs(14)}
              style={{
                width: rs(28),
                height: rs(28),
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#fff",
                marginTop: rs(3),
                shadowColor: glass.blue.shadow,
                shadowOpacity: 0.35,
                shadowRadius: rs(5),
                shadowOffset: { width: 0, height: rs(2) },
                elevation: 3,
              }}
            >
              <Ionicons name="location" size={rs(15)} color={glass.ink} />
            </Glass>
          </View>
        ))}
      </Glass>

      <Text
        className="font-semibold"
        style={{
          fontSize: rs(11.5),
          color: glass.subMuted,
          marginHorizontal: rs(16),
          marginTop: rs(16),
          marginBottom: rs(7),
        }}
      >
        내 최근 기록
      </Text>

      {/* A plain card, not Glass — Glass's top specular sheen covers ~48%
          of its own height, which washes out text in the first row or two
          of a tall list like this (fine on short buttons/pills, not here). */}
      <View
        style={{
          marginHorizontal: rs(16),
          borderRadius: rs(18),
          backgroundColor: glass.white.top,
          borderWidth: 1,
          borderColor: glass.border,
          overflow: "hidden",
        }}
      >
        {pins.map((p, i) => (
          <View
            key={p.place}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: rs(12),
              padding: rs(12),
              borderBottomWidth: i === pins.length - 1 ? 0 : 1,
              borderBottomColor: glass.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                className="font-semibold"
                style={{ fontSize: rs(13), color: glass.ink }}
              >
                {p.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: rs(3),
                  marginTop: 2,
                }}
              >
                <Ionicons
                  name="location"
                  size={rs(10)}
                  color={glass.subMuted}
                />
                <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>
                  {p.place} · {p.time}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>
              {p.stars}
            </Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
