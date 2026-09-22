import { Pressable, Text, View } from "react-native";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";

// Filter chip shared by the feed toolbar and the map's species filter.
//
// Inactive chips are pure white with a hairline border and a soft shadow —
// on a device screen, a fill just a few % off the canvas color (this used
// glass.card, #FDFDFB, against a #F2F5F3 canvas before) reads as "no
// background at all" once real display calibration (True Tone, saturation
// boost, etc.) is in the mix, even though it was clearly visible on a web
// monitor. The shadow is what actually guarantees the chip reads as a
// raised surface regardless of exact fill/canvas contrast, so both variants
// get it now — "floating" (the map) just sits over imagery instead of the
// plain screen canvas, not a different render.
// The active chip is ink-filled in both.
export const CHIP_HEIGHT = rs(34);

export default function Pill({
  label,
  active,
  onPress,
  count,
  variant = "flat",
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
  variant?: "flat" | "floating";
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 5, bottom: 5, left: 2, right: 2 }}
      accessibilityRole="button"
      accessibilityLabel={count != null ? `${label} ${count}개` : label}
      accessibilityState={{ selected: active }}
      style={{ flexShrink: 0 }}
    >
      <View
        style={{
          height: CHIP_HEIGHT,
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rs(6),
          paddingHorizontal: rs(14),
          borderRadius: CHIP_HEIGHT / 2,
          backgroundColor: active ? glass.ink : "#FFFFFF",
          ...(active
            ? null
            : {
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              }),
        }}
      >
        <Text
          className="font-semibold"
          style={{ fontSize: rs(12.5), color: active ? "#FFFFFF" : glass.ink }}
        >
          {label}
        </Text>
        {count != null ? (
          <Text
            className="font-semibold"
            style={{
              fontSize: rs(11.5),
              color: active ? "rgba(255,255,255,0.6)" : glass.subMuted,
            }}
          >
            {count}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
