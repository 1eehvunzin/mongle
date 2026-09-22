import { ScrollView } from "react-native";
import Pill, { CHIP_HEIGHT } from "./Pill";
import { rs } from "../constants/scale";
import type { FolderGroup } from "../lib/feedFilters";

// The feed is folders by default; each chip is a way to group them. "전체" is
// the one non-folder option: every catch as a plain list, for when you just
// want to scroll. Shape clouds don't get their own chip here — the "종류"
// grouping already collapses them into one pinned-first "모양 구름" folder
// (see feedFilters.ts's groupItems); the map's species filter is the one
// place they get a dedicated chip, since there they'd otherwise scatter
// pins with no per-species grouping to fall back on.
export type FeedGroup = FolderGroup | "all";

const GROUPS: { key: FolderGroup; label: string }[] = [
  { key: "species", label: "종류" },
  { key: "rarity", label: "희귀도" },
  { key: "month", label: "월별" },
  { key: "place", label: "장소" },
];

export default function FeedToolbar({
  group,
  onGroup,
  total,
}: {
  group: FeedGroup;
  onGroup: (g: FeedGroup) => void;
  total: number;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // See the matching comment in MapFilterBar — native needs an explicit
      // cross-axis size on a horizontal ScrollView; web doesn't, so this went
      // unnoticed until it was actually run on a phone.
      style={{
        height: CHIP_HEIGHT + rs(12),
        flexGrow: 0,
        marginBottom: rs(12),
      }}
      contentContainerStyle={{
        flexDirection: "row",
        flexGrow: 0,
        paddingHorizontal: rs(16),
        paddingTop: rs(2),
        paddingBottom: rs(10),
        gap: rs(8),
        alignItems: "center",
      }}
    >
      {GROUPS.map((g) => (
        <Pill
          key={g.key}
          label={g.label}
          active={group === g.key}
          onPress={() => onGroup(g.key)}
        />
      ))}
      <Pill
        label="전체"
        count={total}
        active={group === "all"}
        onPress={() => onGroup("all")}
      />
    </ScrollView>
  );
}
