import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import MongleMascot from "../../components/MongleMascot";
import { glass } from "../../constants/aquaTheme";
import { rs } from "../../constants/scale";

// Matched to the reference logo-splash: plain white ground, the wordmark
// (icon + text, one lockup, no badge/circle around it) sitting in the
// upper third over a small silhouette, one caption line, a lot of empty
// space, a tiny footer credit — not a hero illustration screen.
export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      onPress={() => router.replace("/home")}
    >
      <View style={{ marginTop: rs(110), alignItems: "center" }}>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: rs(6) }}
        >
          <MongleMascot size={40} />
          <Text
            style={{
              fontSize: rs(32),
              color: "#4FA8D8",
              letterSpacing: -0.5,
              fontFamily: "Cloudsofa",
            }}
          >
            mongle
          </Text>
        </View>
      </View>

      <Text
        style={{
          position: "absolute",
          bottom: rs(28),
          alignSelf: "center",
          fontSize: rs(10),
          color: glass.subMuted,
          opacity: 0.7,
        }}
      >
        Copyright ⓒ mongle
      </Text>
    </Pressable>
  );
}
