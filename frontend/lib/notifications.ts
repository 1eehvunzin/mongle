// Local (on-device) reminders — no server or push token involved.
//
// Everything is one-shot date-triggered notifications that get cancelled and
// re-planned on every home-screen load (see syncReminders), so a reminder only
// ever fires if the user *hasn't* opened the app since it was planned: opening
// the app, or catching a cloud, pushes every pending reminder further out.
//
// Two kinds:
//  - "streak": the next 15:00, while the sky is still up, only for users
//    with a running streak — a 19:30 evening slot used to fire after dark
//    in a lot of seasons, defeating the point of "go look at the sky".
//  - "winback": 15:00 on day +3/+7/+14/+30 after the last app open.
// Both fire at 15:00 local time, well inside the 08:00–21:00 window Korean
// law allows for advertising-style pushes.
//
// Native only: expo-notifications has no web support, so every entry point is
// a no-op on web (Platform.OS check — never `typeof window`, RN defines that
// on native too).
//
// The module is loaded lazily (see getNotifications) rather than imported at
// the top of the file: expo-notifications needs a native module, and a dev /
// preview binary built before it was added doesn't contain one. A top-level
// import would throw while the home screen's bundle evaluates and take the
// whole app down; loaded lazily, that build just has reminders switched off.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type * as NotificationsModule from "expo-notifications";

type Notifications = typeof NotificationsModule;

export type ReminderState = { streak: number; caughtToday: boolean };

export type NotificationStatus =
  | "granted"
  | "askable"
  | "blocked"
  | "unsupported";

const PROMPT_DISMISSED_KEY = "mongle.notifPromptDismissed";
const CHANNEL_ID = "reminders";

// One daily daytime slot for both reminder kinds — while there's still light
// (and still time) left to go catch a cloud.
const DAYTIME = { hour: 15, minute: 0 };
const WINBACK_HOUR = DAYTIME.hour;

const WINBACK_COPY: Record<number, { title: string; body: string }> = {
  3: {
    title: "구름이 기다리고 있어요",
    body: "요즘 하늘은 어때요? 오늘 한 장 남겨볼까요?",
  },
  7: {
    title: "그동안 하늘엔 어떤 구름이 떴을까요?",
    body: "일주일 만에 하늘을 올려다볼 시간이에요.",
  },
  14: {
    title: "아직 만나지 못한 구름이 있어요",
    body: "하늘 어딘가에서 새로운 구름이 기다리고 있을지도 몰라요.",
  },
  30: {
    title: "그새 하늘이 많이 달라졌어요",
    body: "한 달 동안 어떤 구름이 지나갔을까요? 오늘 하늘부터 담아봐요.",
  },
};

let cached: Notifications | null | undefined;

// undefined = not tried yet; null = unavailable (web, or no native module).
function getNotifications(): Notifications | null {
  if (cached !== undefined) return cached;
  if (Platform.OS === "web") {
    cached = null;
    return cached;
  }
  try {
    cached = require("expo-notifications") as Notifications;
  } catch (e) {
    console.warn("[notifications] native module unavailable, reminders off:", e);
    cached = null;
  }
  return cached;
}

let configured = false;

async function configure(N: Notifications): Promise<void> {
  if (configured) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === "android") {
    await N.setNotificationChannelAsync(CHANNEL_ID, {
      name: "몽글 알림",
      importance: N.AndroidImportance.DEFAULT,
    });
  }
  configured = true;
}

export async function getNotificationStatus(): Promise<NotificationStatus> {
  const N = getNotifications();
  if (!N) return "unsupported";
  const perm = await N.getPermissionsAsync();
  if (perm.granted) return "granted";
  return perm.canAskAgain ? "askable" : "blocked";
}

// Shows the system permission dialog. Must be called from a user gesture
// (a button press), never from a mount effect — presenting a native alert
// mid-navigation-transition has crashed this app on iOS before.
export async function requestNotificationPermission(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  const perm = await N.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return perm.granted;
}

// Declining the ask is treated as final, not a snooze — the modal asks once;
// saying no means we stop asking, not "ask again in a week".
export async function shouldShowNotificationPrompt(): Promise<boolean> {
  if ((await getNotificationStatus()) !== "askable") return false;
  return !(await AsyncStorage.getItem(PROMPT_DISMISSED_KEY));
}

export async function dismissNotificationPrompt(): Promise<void> {
  await AsyncStorage.setItem(PROMPT_DISMISSED_KEY, "1");
}

function localTime(base: Date, addDays: number, hour: number, minute: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + addDays);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function schedule(
  N: Notifications,
  kind: "streak" | "winback",
  title: string,
  body: string,
  date: Date,
) {
  return N.scheduleNotificationAsync({
    content: { title, body, data: { kind } },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: CHANNEL_ID,
    },
  });
}

// Re-plans every pending reminder from scratch. No-op unless the user has
// granted permission. Callers should wrap this in try/catch and run it
// after interactions settle (see home.tsx).
export async function syncReminders(state: ReminderState): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  if ((await getNotificationStatus()) !== "granted") return;
  await configure(N);
  await N.cancelAllScheduledNotificationsAsync();

  const now = new Date();

  if (state.streak >= 1) {
    const at = localTime(now, 0, DAYTIME.hour, DAYTIME.minute);
    // Already caught something today, or today's slot has passed: aim for
    // tomorrow's. If they catch/open before then, the next sync moves it.
    if (state.caughtToday || at.getTime() <= now.getTime()) {
      at.setDate(at.getDate() + 1);
    }
    await schedule(
      N,
      "streak",
      `${state.streak}일 연속 관측 중이에요`,
      "오늘 하늘도 한 장 남겨볼까요?",
      at,
    );
  }

  for (const [days, copy] of Object.entries(WINBACK_COPY)) {
    await schedule(
      N,
      "winback",
      copy.title,
      copy.body,
      localTime(now, Number(days), WINBACK_HOUR, 0),
    );
  }
}
