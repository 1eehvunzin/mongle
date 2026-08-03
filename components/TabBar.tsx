import { Platform, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useTabTrigger } from "expo-router/ui";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Glass from "./Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";

const TAB_META = {
  home: {
    active: "home" as const,
    inactive: "home-outline" as const,
    label: "홈",
  },
  dex: {
    active: "map" as const,
    inactive: "map-outline" as const,
    label: "지도",
  },
  feed: {
    active: "albums" as const,
    inactive: "images-outline" as const,
    label: "피드",
  },
  profile: {
    active: "person" as const,
    inactive: "person-outline" as const,
    label: "나",
  },
};

function TabButton({ name }: { name: keyof typeof TAB_META }) {
  const { trigger, triggerProps } = useTabTrigger({ name });
  const meta = TAB_META[name];
  const focused = Boolean(trigger?.isFocused);

  return (
    <Pressable {...triggerProps} style={{ flex: 1, alignItems: "center" }}>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Ionicons
          name={focused ? meta.active : meta.inactive}
          size={rs(21)}
          color={focused ? glass.accent : glass.subMuted}
        />
        <Text
          style={{
            fontSize: rs(9),
            fontWeight: "600",
            color: focused ? glass.accent : glass.subMuted,
            marginTop: rs(3),
          }}
        >
          {meta.label}
        </Text>
      </View>
    </Pressable>
  );
}

// Second pass: a floating glass shelf back underneath the icons (loose
// dials with nothing "holding" them read as unfinished), with the camera
// pulled clearly out in front — bigger, raised above the shelf, ringed —
// so it doesn't compete with the plain nav icons anymore.
export default function TabBar() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        pointerEvents: "box-none" as any,
        position: Platform.OS === "web" ? ("fixed" as any) : "absolute",
        left: rs(16),
        right: rs(16),
        bottom: Platform.OS === "web" ? rs(12) : insets.bottom + rs(12),
        height: rs(72),
        justifyContent: "flex-end",
        zIndex: 50,
      }}
    >
      <Glass
        tone={glass.white}
        radius={rs(30)}
        style={{
          height: rs(62),
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: rs(8),
          shadowColor: glass.white.shadow,
          shadowOpacity: 0.35,
          shadowRadius: rs(14),
          shadowOffset: { width: 0, height: rs(6) },
          elevation: 5,
        }}
      >
        <TabButton name="home" />
        <TabButton name="feed" />
        <View style={{ flex: 1 }} />
        <TabButton name="dex" />
        <TabButton name="profile" />
      </Glass>

      <Pressable
        onPress={() => router.push("/capture")}
        style={{
          position: "absolute",
          top: rs(2),
          left: "50%",
          marginLeft: -rs(30),
        }}
      >
        <Glass
          tone={glass.blue}
          radius={rs(30)}
          style={{
            width: rs(60),
            height: rs(60),
            alignItems: "center",
            justifyContent: "center",
            borderWidth: rs(4),
            borderColor: glass.bg,
            shadowColor: glass.blue.shadow,
            shadowOpacity: 0.4,
            shadowRadius: rs(14),
            shadowOffset: { width: 0, height: rs(6) },
            elevation: 6,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: rs(44),
              height: rs(44),
              borderRadius: rs(22),
              borderWidth: 1,
              borderColor: "rgba(60,68,64,0.22)",
            }}
          />
          <Ionicons name="camera" size={rs(24)} color={glass.ink} />
        </Glass>
      </Pressable>
    </View>
  );
}
