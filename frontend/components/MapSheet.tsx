import { useEffect, useRef } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import type { CatchOut } from "../lib/localStore";
import { raritySwatch } from "../lib/mapMeta";

// Height of the panel's own content (header + card strip). The panel is
// anchored to the bottom of the screen and also extends down behind the
// floating tab bar, so the two read as one surface with no seam between them.
export const PANEL_HEIGHT = rs(158);
const CARD_WIDTH = rs(132);
const CARD_GAP = rs(10);
const MAX_CARDS = 60;

function Thumb({
  pin,
  width,
  height,
  radius,
}: {
  pin: CatchOut;
  width: number;
  height: number;
  radius: number;
}) {
  const tint = raritySwatch(pin.rarity_label);
  return pin.photo_url ? (
    <Image
      source={{ uri: pin.photo_url }}
      style={{ width, height, borderRadius: radius }}
      resizeMode="cover"
    />
  ) : (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: tint + "55",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="cloud" size={rs(22)} color={tint} />
    </View>
  );
}

function OpenButton({ pin }: { pin: CatchOut }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/share", params: { catchId: String(pin.id) } })
      }
      hitSlop={8}
    >
      <Text
        className="font-bold"
        style={{ fontSize: rs(11), color: glass.accent }}
      >
        기록 보기 ›
      </Text>
    </Pressable>
  );
}

// Panel under the map: a horizontal strip of cards for the (filtered) catches.
// Picking one selects it, which makes the map fly to its pin; tapping a pin on
// the map scrolls the strip to its card.
export default function MapSheet({
  pins,
  selectedId,
  onSelect,
  tabBarInset,
  filterLabel,
}: {
  pins: CatchOut[];
  selectedId: number | null;
  onSelect: (pin: CatchOut) => void;
  // Space at the bottom of the screen taken by the floating tab bar.
  tabBarInset: number;
  filterLabel: string | null;
}) {
  const stripRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (selectedId == null) return;
    const index = pins.findIndex((p) => p.id === selectedId);
    if (index >= 0) {
      stripRef.current?.scrollTo({
        x: index * (CARD_WIDTH + CARD_GAP),
        animated: true,
      });
    }
  }, [selectedId, pins]);

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: PANEL_HEIGHT + tabBarInset,
        paddingTop: rs(14),
        zIndex: 1100,
        backgroundColor: glass.card,
        borderTopLeftRadius: rs(24),
        borderTopRightRadius: rs(24),
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: glass.border,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 10,
      }}
    >
      <Text
        className="font-bold"
        style={{
          fontSize: rs(14),
          color: glass.ink,
          paddingHorizontal: rs(16),
          marginBottom: rs(10),
        }}
      >
        {filterLabel ? `${filterLabel} ` : "구름 기록 "}
        <Text style={{ color: glass.accent }}>{pins.length}</Text>
      </Text>

      <ScrollView
        ref={stripRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: rs(16), gap: CARD_GAP }}
      >
        {pins.slice(0, MAX_CARDS).map((p) => {
          const selected = p.id === selectedId;
          return (
            <Pressable
              key={p.id}
              onPress={() => onSelect(p)}
              style={{
                width: CARD_WIDTH,
                padding: rs(6),
                borderRadius: rs(16),
                borderWidth: selected ? 2 : 1,
                borderColor: selected
                  ? raritySwatch(p.rarity_label)
                  : glass.border,
                backgroundColor: glass.white.top,
              }}
            >
              <Thumb
                pin={p}
                width={CARD_WIDTH - rs(16)}
                height={rs(62)}
                radius={rs(10)}
              />
              <Text
                className="font-bold"
                numberOfLines={1}
                style={{ fontSize: rs(12), color: glass.ink, marginTop: rs(6) }}
              >
                {p.cloud_name}
              </Text>
              {selected ? (
                <OpenButton pin={p} />
              ) : (
                <Text
                  numberOfLines={1}
                  style={{ fontSize: rs(10), color: glass.subMuted }}
                >
                  {p.place_name ?? "위치 정보 없음"}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
