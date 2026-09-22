import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Glass from "./Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { CLUSTER_TONE, PIN_SIZE, rarityTone } from "../lib/mapMeta";

// Native map marker face: a glossy "Aqua glass" badge — the same fill-
// gradient + specular-highlight + rim recipe as every other button/FAB in
// the app (this mirrors the tab bar's camera button almost exactly), toned
// by rarity for a single pin. A cluster of several catches stays neutral
// (CLUSTER_TONE) rather than joining the pastel-rarity family, since it's
// "several catches," not a rarity of its own. The web map draws the same
// look in hand-rolled CSS — see pinHtml/clusterHtml in lib/mapMeta.ts.
//
// The shadow sits on this outer View, with <Glass> (which clips to its own
// circle via `overflow: hidden`, needed to keep its gradient round) nested
// one level in — a shadow and a clip on the very same view fight on iOS, the
// clip wins, and the shadow silently disappears.
export default function MapPinBadge({
  rarity,
  selected = false,
  count = 1,
}: {
  rarity: string;
  selected?: boolean;
  count?: number;
}) {
  if (count > 1) {
    const size = rs(PIN_SIZE.cluster);
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          shadowColor: CLUSTER_TONE.shadow,
          shadowOpacity: 0.3,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <Glass
          tone={CLUSTER_TONE}
          radius={size / 2}
          style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: rs(14), fontWeight: "700", color: "#FFFFFF" }}>
            {count}
          </Text>
        </Glass>
      </View>
    );
  }

  const tone = rarityTone(rarity);
  const size = rs(selected ? PIN_SIZE.selected : PIN_SIZE.base);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        shadowColor: tone.shadow,
        shadowOpacity: 0.4,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}
    >
      <Glass
        tone={tone}
        radius={size / 2}
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: selected ? rs(2.5) : 0,
          borderColor: glass.accent,
        }}
      >
        <Ionicons
          name="cloud"
          size={rs(selected ? 17 : 15)}
          color={glass.ink}
        />
      </Glass>
    </View>
  );
}
