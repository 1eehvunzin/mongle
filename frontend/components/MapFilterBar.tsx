import { ScrollView } from "react-native";
import Pill, { CHIP_HEIGHT } from "./Pill";
import { rs } from "../constants/scale";

// Species filter chips floating over the map.
export default function MapFilterBar({
  species,
  selected,
  onSelect,
}: {
  species: string[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // A horizontal ScrollView with no explicit cross-axis size shrink-wraps
      // to its content on web (a plain flex div) but can collapse or stretch
      // unpredictably on native, which has no such implicit behavior — give
      // it the chip height directly instead of leaning on either platform's
      // default.
      style={{ height: CHIP_HEIGHT + rs(12), flexGrow: 0 }}
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
      <Pill
        label="전체"
        variant="floating"
        active={selected == null}
        onPress={() => onSelect(null)}
      />
      {species.map((name) => (
        <Pill
          key={name}
          label={name}
          variant="floating"
          active={selected === name}
          onPress={() => onSelect(selected === name ? null : name)}
        />
      ))}
    </ScrollView>
  );
}
