import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";

// Search box that takes over the feed header's title row while open, so search
// costs no extra row on the screen.
export default function FeedSearchField({
  query,
  onQuery,
  onClose,
}: {
  query: string;
  onQuery: (q: string) => void;
  onClose: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: rs(10),
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: rs(8),
          paddingHorizontal: rs(12),
          borderRadius: rs(12),
          borderWidth: 1,
          borderColor: glass.border,
          backgroundColor: glass.card,
        }}
      >
        <Ionicons name="search" size={rs(15)} color={glass.subMuted} />
        <TextInput
          value={query}
          onChangeText={onQuery}
          autoFocus
          placeholder="구름 이름, 장소, 메모 검색"
          placeholderTextColor={glass.subMuted}
          returnKeyType="search"
          autoCorrect={false}
          style={{
            flex: 1,
            paddingVertical: rs(10),
            fontSize: rs(13),
            color: glass.ink,
            // The wrapper already draws the border; drop the browser's own
            // focus ring so it doesn't box the field twice on web.
            ...({ outlineStyle: "none" } as object),
          }}
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => onQuery("")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="검색어 지우기"
          >
            <Ionicons
              name="close-circle"
              size={rs(16)}
              color={glass.subMuted}
            />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={onClose}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="검색 닫기"
      >
        <Text
          className="font-semibold"
          style={{ fontSize: rs(13), color: glass.sub }}
        >
          취소
        </Text>
      </Pressable>
    </View>
  );
}
