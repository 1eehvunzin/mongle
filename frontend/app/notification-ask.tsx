import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import Glass from "../components/Glass";
import MongleMascot from "../components/MongleMascot";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { getHome } from "../lib/localStore";
import {
  dismissNotificationPrompt,
  requestNotificationPermission,
  syncReminders,
} from "../lib/notifications";

// A real modal — dimmed backdrop + a floating card, same shape as
// consent.tsx — pushed once from home.tsx (deferred past any in-flight
// transition; see that call site) instead of a dismissible in-page card, so
// the ask is front and center rather than something to scroll past. Leads
// with "받기"; declining is final (see lib/notifications.ts) rather than a
// snooze — this is the one time we ask.
export default function NotificationAskScreen() {
  const [working, setWorking] = useState(false);

  const accept = async () => {
    setWorking(true);
    try {
      if (await requestNotificationPermission()) {
        // Fetch the freshest streak/caught-today state right before
        // scheduling rather than trusting whatever home.tsx had when it
        // pushed this screen — the user may have caught something in the
        // moment between.
        const home = await getHome();
        await syncReminders({
          streak: home.streak_current,
          caughtToday: home.caught_today,
        });
      }
    } catch {
      // permission/scheduling failure is non-fatal — just close either way.
    } finally {
      setWorking(false);
      router.back();
    }
  };

  const decline = () => {
    dismissNotificationPrompt().catch(() => {});
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(28,32,30,0.5)",
        }}
        onPress={decline}
      />

      <View
        pointerEvents="box-none"
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: rs(20) }}
      >
        <Glass tone={glass.white} radius={rs(24)} style={{ padding: rs(20) }}>
          <MongleMascot size={64} style={{ alignSelf: "center" }} />
          <Text
            className="font-bold"
            style={{
              fontSize: rs(18),
              color: glass.ink,
              textAlign: "center",
              marginTop: rs(14),
            }}
          >
            하늘 볼 시간을 알려드릴까요?
          </Text>
          <Text
            style={{
              fontSize: rs(12.5),
              color: glass.sub,
              textAlign: "center",
              marginTop: rs(6),
              lineHeight: rs(18),
            }}
          >
            해가 떠 있는 낮에 하루 한 번만,{"\n"}
            연속 관측이 끊기기 전에 살짝 알려드려요.
          </Text>

          <Pressable
            onPress={accept}
            disabled={working}
            style={{ marginTop: rs(18), opacity: working ? 0.6 : 1 }}
          >
            <Glass
              tone={glass.blue}
              radius={rs(999)}
              style={{ paddingVertical: rs(14), alignItems: "center" }}
            >
              <Text
                className="font-bold"
                style={{ fontSize: rs(14), color: glass.ink }}
              >
                {working ? "설정 중…" : "알림 받기"}
              </Text>
            </Glass>
          </Pressable>
          <Pressable
            onPress={decline}
            disabled={working}
            style={{ paddingVertical: rs(11), alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: rs(12.5),
                fontWeight: "600",
                color: glass.subMuted,
              }}
            >
              괜찮아요
            </Text>
          </Pressable>
        </Glass>
      </View>
    </View>
  );
}
