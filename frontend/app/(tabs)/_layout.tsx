import { Platform, View } from "react-native";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import TabBar from "../../components/TabBar";

// TabSlot hardcodes flexShrink: 0 on the screens it renders — harmless on
// native, but on web it stops the active screen from ever shrinking to the
// viewport, so its content grows the whole page instead of scrolling inside
// itself. Pinning it to absolute fill sidesteps flex sizing entirely and
// gives it a real, boxed height to scroll within.
const webFillStyle =
  Platform.OS === "web"
    ? { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 }
    : undefined;

export default function TabsLayout() {
  return (
    <Tabs style={{ flex: 1, backgroundColor: "#F5F4F1" }}>
      <View style={{ flex: 1, minHeight: 0 }}>
        <View style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <TabSlot style={webFillStyle} />
        </View>
        <TabBar />
      </View>
      <TabList style={{ display: "none" }}>
        <TabTrigger name="home" href="/home" />
        <TabTrigger name="map" href="/map" />
        <TabTrigger name="feed" href="/feed" />
        <TabTrigger name="profile" href="/profile" />
      </TabList>
    </Tabs>
  );
}
