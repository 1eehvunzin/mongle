import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MongleMascot from "../../components/MongleMascot";
import Glass from "../../components/Glass";
import { glass } from "../../constants/aquaTheme";
import { feeds } from "../../constants/mock";
import { rs } from "../../constants/scale";

// Real photo mockups (swapped in for the flat illustrative gradient) —
// picked per cloud type: cumulus tower for 뭉게구름, the heart-shaped
// fair-weather cloud for 양떼구름, skyline-at-dusk for 노을구름.
const FEED_PHOTOS: Record<string, number> = {
  뭉게구름: require("../../assets/ref/구름 (3).jpg"),
  양떼구름: require("../../assets/ref/구름 (2).jpg"),
  노을구름: require("../../assets/ref/구름 (1).jpg"),
};

// mock cond strings bake an emoji prefix ("☀︎ 맑음") in; split it back into
// a real Ionicon + label so the feed hero uses the same icon system as home.
function conditionMeta(cond: string): {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
} {
  const text = cond.replace(/^\S+\s*/, "");
  if (text.includes("노을")) return { icon: "partly-sunny", text };
  if (text.includes("맑음")) return { icon: "sunny", text };
  if (text.includes("조금")) return { icon: "partly-sunny-outline", text };
  return { icon: "cloud-outline", text };
}

export default function FeedScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, minHeight: 0, backgroundColor: glass.bg }}
      edges={["top"]}
    >
      <View
        style={{
          paddingHorizontal: rs(16),
          paddingTop: rs(2),
          paddingBottom: rs(6),
          ...(Platform.OS === "web"
            ? {
                position: "sticky" as any,
                top: 0,
                zIndex: 10,
                backgroundColor: glass.bg,
              }
            : null),
        }}
      >
        <Text
          className="font-bold"
          style={{ fontSize: rs(24), color: glass.ink, letterSpacing: -0.3 }}
        >
          구름 피드
        </Text>
      </View>

      <ScrollView
        style={[
          { flex: 1, minHeight: 0 },
          Platform.OS === "web" ? ({ overflow: "auto" } as any) : null,
        ]}
        contentContainerStyle={{ paddingTop: rs(6), paddingBottom: rs(110) }}
        showsVerticalScrollIndicator={false}
      >
        {feeds.map((f) => {
          const cond = conditionMeta(f.cond);
          return (
            <Glass
              key={f.handle + f.time}
              tone={glass.white}
              radius={rs(20)}
              style={{
                marginHorizontal: rs(16),
                marginBottom: rs(14),
                borderWidth: 1,
                borderColor: glass.border,
              }}
            >
              <ImageBackground
                source={FEED_PHOTOS[f.cloud] ?? FEED_PHOTOS["뭉게구름"]}
                style={{ height: rs(190), position: "relative" }}
              >
                <LinearGradient
                  colors={["rgba(20,24,22,0.05)", "rgba(20,24,22,0.5)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View
                  style={{ position: "absolute", top: rs(14), left: rs(16) }}
                >
                  <Glass
                    tone={glass.white}
                    radius={rs(999)}
                    style={{
                      alignSelf: "flex-start",
                      paddingLeft: rs(4),
                      paddingRight: rs(9),
                      paddingVertical: rs(4),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: rs(6),
                      }}
                    >
                      <Glass
                        tone={glass.blue}
                        radius={rs(9)}
                        style={{
                          width: rs(18),
                          height: rs(18),
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons
                          name={cond.icon}
                          size={rs(11)}
                          color={glass.ink}
                        />
                      </Glass>
                      <Text
                        className="font-bold"
                        style={{ fontSize: rs(11), color: glass.ink }}
                      >
                        {cond.text} · {f.cloud} · {f.temp}
                      </Text>
                    </View>
                  </Glass>
                </View>
                <View
                  style={{
                    position: "absolute",
                    bottom: rs(10),
                    right: rs(14),
                  }}
                >
                  <MongleMascot size={44} />
                </View>
              </ImageBackground>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: rs(9),
                  padding: rs(12),
                }}
              >
                <Glass
                  tone={glass.gray}
                  radius={rs(15)}
                  style={{
                    width: rs(30),
                    height: rs(30),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MongleMascot size={22} />
                </Glass>
                <View style={{ flex: 1 }}>
                  <Text
                    className="font-semibold"
                    style={{ fontSize: rs(12.5), color: glass.ink }}
                  >
                    {f.handle}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: rs(3),
                      marginTop: 1,
                    }}
                  >
                    <Ionicons
                      name="location"
                      size={rs(10)}
                      color={glass.subMuted}
                    />
                    <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>
                      {f.place} · {f.time}
                    </Text>
                  </View>
                </View>
                <Glass
                  tone={glass.white}
                  radius={rs(999)}
                  style={{
                    paddingHorizontal: rs(9),
                    paddingVertical: rs(5),
                    borderWidth: 1,
                    borderColor: glass.border,
                  }}
                >
                  <Text
                    className="font-bold"
                    style={{ fontSize: rs(11), color: glass.ink }}
                  >
                    {f.stars} {f.tier}
                  </Text>
                </Glass>
              </View>

              <View
                style={{ paddingHorizontal: rs(12), paddingBottom: rs(12) }}
              >
                <Pressable onPress={() => router.push("/share")}>
                  <Glass
                    tone={glass.blue}
                    radius={rs(999)}
                    style={{ paddingVertical: rs(13), alignItems: "center" }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: rs(7),
                      }}
                    >
                      <Ionicons
                        name="share-outline"
                        size={rs(15)}
                        color={glass.ink}
                      />
                      <Text
                        className="font-bold"
                        style={{ fontSize: rs(13), color: glass.ink }}
                      >
                        스토리 공유하기
                      </Text>
                    </View>
                  </Glass>
                </Pressable>
              </View>
            </Glass>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
