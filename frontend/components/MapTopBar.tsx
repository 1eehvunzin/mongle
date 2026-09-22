import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapFilterBar from "./MapFilterBar";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";

// The screen background (glass.bg = #F2F5F3) at full and zero opacity — the
// fade starts as solid canvas at the very top and dissolves into the map.
const BG_SOLID = "rgba(242,245,243,1)";
const BG_CLEAR = "rgba(242,245,243,0)";

// Top of the map screen: the title and species filter chips sit directly on
// the map under a soft fade from the screen background, so there is no hard
// edge or boxed header — the map simply emerges from beneath the title. Only
// the title and chips capture touches; the faded padding passes them through
// to the map.
export default function MapTopBar({
  species,
  selected,
  onSelect,
}: {
  species: string[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        paddingTop: insets.top + rs(6),
        paddingBottom: rs(34),
      }}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[BG_SOLID, BG_SOLID, BG_CLEAR]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Text
        className="font-bold"
        style={{
          fontSize: rs(24),
          color: glass.ink,
          letterSpacing: -0.3,
          paddingHorizontal: rs(16),
          marginBottom: rs(10),
        }}
      >
        구름 지도
      </Text>
      <MapFilterBar species={species} selected={selected} onSelect={onSelect} />
    </View>
  );
}
