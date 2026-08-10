import { View } from "react-native";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import TabBar from "../../components/TabBar";

export default function TabsLayout() {
  return (
    <Tabs style={{ flex: 1, backgroundColor: "#F5F4F1" }}>
      <View style={{ flex: 1, minHeight: 0 }}>
        <View style={{ flex: 1, minHeight: 0 }}>
          <TabSlot />
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
