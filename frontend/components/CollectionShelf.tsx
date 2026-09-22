import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Glass from "./Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import {
  CloudSpeciesDef,
  CloudTier,
  KNOWN_CLOUDS,
  starsToStr,
} from "../lib/cloudSpecies";

const FINISH_META: Record<CloudTier, { label: string; color: string }> = {
  bronze: { label: "브론즈", color: "#B98B62" },
  silver: { label: "실버", color: "#A3ABB0" },
  gold: { label: "골드", color: "#D4A83C" },
  holo: { label: "홀로", color: "#7FB6D6" },
};

function FinishDot({ tier }: { tier: CloudTier }) {
  const size = rs(8);
  if (tier === "holo") {
    return (
      <LinearGradient
        colors={["#F4B8D8", "#A9D3E2", "#C9E7B5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: FINISH_META[tier].color,
      }}
    />
  );
}

function Slot({
  species,
  tier,
  selected,
  onPress,
}: {
  species: CloudSpeciesDef | null;
  tier: CloudTier | null;
  selected?: boolean;
  onPress?: () => void;
}) {
  const found = species != null && tier != null;
  const card = (
    <Glass
      tone={found ? glass.white : glass.gray}
      radius={rs(16)}
      style={{
        width: rs(88),
        height: rs(116),
        marginRight: rs(10),
        paddingVertical: rs(10),
        paddingHorizontal: rs(8),
        alignItems: "center",
        justifyContent: "center",
        gap: rs(8),
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? glass.accent : glass.border,
        opacity: found ? 1 : 0.7,
      }}
    >
      <Ionicons
        name={found ? "cloud" : "lock-closed"}
        size={rs(found ? 30 : 22)}
        color={found ? glass.accent : glass.subMuted}
      />
      <View style={{ alignItems: "center", gap: rs(2) }}>
        <Text
          className="font-bold"
          numberOfLines={1}
          style={{ fontSize: rs(11.5), color: found ? glass.ink : glass.sub }}
        >
          {found ? species.name : "???"}
        </Text>
        {found ? (
          <>
            <Text style={{ fontSize: rs(9.5), color: glass.sub }}>
              {starsToStr(species.stars)}
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: rs(4) }}
            >
              <FinishDot tier={tier} />
              <Text style={{ fontSize: rs(9.5), color: glass.sub }}>
                {FINISH_META[tier].label}
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ fontSize: rs(9.5), color: glass.subMuted }}>
            새로운 구름
          </Text>
        )}
      </View>
    </Glass>
  );
  // Only discovered species are tappable (filters the feed to that species).
  return found && onPress ? (
    <Pressable onPress={onPress}>{card}</Pressable>
  ) : (
    card
  );
}

// Number of "???" slots trailing the discovered ones. Fixed on purpose: the
// total species count is meant to stay hidden, so the shelf must look the same
// whether 1 or all-but-one species are still undiscovered.
const MYSTERY_SLOTS = 2;

// The feed's "collection" header: how many species the user has found plus a
// slot per discovered species. There is deliberately no separate dex screen —
// the feed doubles as the dex surface — and no "found/total" count, so the
// number of species in the game isn't revealed.
export default function CollectionShelf({
  bestFinish,
  selected = null,
  onSelect,
}: {
  bestFinish: Record<string, CloudTier>;
  selected?: string | null;
  onSelect?: (name: string) => void;
}) {
  const discovered = KNOWN_CLOUDS.filter((c) => bestFinish[c.name] != null);

  return (
    <View style={{ marginBottom: rs(14) }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          paddingHorizontal: rs(16),
          marginBottom: rs(10),
        }}
      >
        <Text
          className="font-bold"
          style={{ fontSize: rs(15), color: glass.ink }}
        >
          구름 도감{" "}
          <Text style={{ color: glass.accent }}>{discovered.length}종</Text>
        </Text>
        <Text style={{ fontSize: rs(11.5), color: glass.sub }}>
          어딘가에 새로운 구름이 있어요
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: rs(16) }}
      >
        {discovered.map((c) => (
          <Slot
            key={c.name}
            species={c}
            tier={bestFinish[c.name]}
            selected={selected === c.name}
            onPress={onSelect ? () => onSelect(c.name) : undefined}
          />
        ))}
        {Array.from({ length: MYSTERY_SLOTS }, (_, i) => (
          <Slot key={`mystery-${i}`} species={null} tier={null} />
        ))}
      </ScrollView>
    </View>
  );
}
