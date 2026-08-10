import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Glass from "./Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { CatchOut, getMapPins } from "../lib/localStore";

// Web fallback — react-native-maps has no web target, and Expo Router's
// file-based routing pulls in every platform-suffixed file under app/
// regardless of platform (a .native.tsx route file there still broke the
// web bundle). Per Expo Router's own guidance, platform variants have to
// live outside app/ as plain components re-exported by the route — see
// MapScreen.native.tsx for the real MapView version native picks up instead.
// No real geo projection here (just a decorative scatter), so pins cycle
// through a handful of fixed canvas positions rather than plotting lat/lng.
const PIN_POSITIONS = [
  { top: 70, left: 90 },
  { top: 130, left: 210 },
  { top: 40, left: 250 },
  { top: 190, left: 60 },
];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.floor(ms / 60000));
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export default function MapScreen() {
  const [pins, setPins] = useState<CatchOut[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setPins(await getMapPins());
    } catch {
      // best-effort — keep whatever was last loaded, if anything.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setLoading(false));
    }, [load]),
  );

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

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={glass.accent} />
        </View>
      ) : pins.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: rs(30),
          }}
        >
          <Text style={{ color: glass.sub, fontSize: rs(13), textAlign: "center" }}>
            아직 위치가 기록된 구름이 없어요.
          </Text>
        </View>
      ) : (
        <>
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
            {pins.slice(0, PIN_POSITIONS.length).map((p, i) => (
              <View
                key={p.id}
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
                  {p.place_name ?? p.cloud_name}
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
                key={p.id}
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
                    {p.cloud_name}
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
                      {p.place_name ?? "위치 정보 없음"} · {timeAgo(p.captured_at)}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>
                  {p.stars}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
