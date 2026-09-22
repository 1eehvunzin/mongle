import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Glass from "./Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { NEWS, NewsItem } from "../constants/updates";

const DISMISSED_KEY = "mongle.dismissedNews";

function localDateKey(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// "2026-09-30" -> "9.30"
function shortDate(key: string): string {
  const [, m, d] = key.split("-");
  return `${Number(m)}.${Number(d)}`;
}

// Whole days from today to the end date's end-of-day; 0 means "last day".
function daysLeft(endsAt: string, today: Date): number {
  const end = new Date(`${endsAt}T00:00:00`);
  const start = new Date(localDateKey(today) + "T00:00:00");
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function isLive(item: NewsItem, todayKey: string, hasCatches: boolean) {
  if (item.kind === "update") return hasCatches;
  if (item.startsAt && todayKey < item.startsAt) return false;
  if (item.endsAt && todayKey > item.endsAt) return false;
  return true;
}

function NewsCard({
  item,
  today,
  onDismiss,
}: {
  item: NewsItem;
  today: Date;
  onDismiss: () => void;
}) {
  const [open, setOpen] = useState(false);
  const event = item.kind === "event";
  // Events are the heavier moment (ink); release logs stay in the sky blue.
  const tone = event ? glass.charcoal : glass.blue;
  const fg = event ? "#FFFFFF" : glass.ink;

  let meta: string | null = null;
  if (event && item.startsAt && item.endsAt) {
    const left = daysLeft(item.endsAt, today);
    meta = `${shortDate(item.startsAt)} ~ ${shortDate(item.endsAt)}${
      left === 0 ? " · 오늘까지" : left > 0 ? ` · D-${left}` : ""
    }`;
  } else if (item.date) {
    meta = item.date;
  }

  return (
    <Glass
      tone={tone}
      radius={rs(18)}
      style={{ borderWidth: 1, borderColor: glass.border }}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: rs(10),
          padding: rs(14),
        }}
      >
        <Ionicons name={event ? "gift" : "sparkles"} size={rs(18)} color={fg} />
        <View style={{ flex: 1 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: rs(6) }}
          >
            <View
              style={{
                paddingHorizontal: rs(7),
                paddingVertical: rs(2),
                borderRadius: rs(999),
                backgroundColor: event
                  ? "rgba(255,255,255,0.22)"
                  : "rgba(60,68,64,0.12)",
              }}
            >
              <Text
                className="font-bold"
                style={{ fontSize: rs(10), color: fg }}
              >
                {event ? "이벤트" : "업데이트"}
              </Text>
            </View>
            <Text
              className="font-bold"
              numberOfLines={1}
              style={{ flex: 1, fontSize: rs(13.5), color: fg }}
            >
              {item.title}
            </Text>
          </View>
          {meta ? (
            <Text
              style={{
                fontSize: rs(11),
                color: fg,
                opacity: 0.75,
                marginTop: rs(3),
              }}
            >
              {meta}
            </Text>
          ) : null}
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={rs(16)}
          color={fg}
        />
        <Pressable
          onPress={onDismiss}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        >
          <Ionicons name="close" size={rs(16)} color={fg} />
        </Pressable>
      </Pressable>

      {open ? (
        <View style={{ paddingHorizontal: rs(14), paddingBottom: rs(14) }}>
          {item.items.map((line) => (
            <View
              key={line}
              style={{ flexDirection: "row", gap: rs(8), marginBottom: rs(6) }}
            >
              <Text style={{ fontSize: rs(12), color: fg }}>•</Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: rs(12),
                  lineHeight: rs(17),
                  color: fg,
                }}
              >
                {line}
              </Text>
            </View>
          ))}
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            style={{ marginTop: rs(6) }}
          >
            <Glass
              tone={glass.white}
              radius={rs(999)}
              style={{ paddingVertical: rs(10), alignItems: "center" }}
            >
              <Text
                className="font-bold"
                style={{ fontSize: rs(12), color: glass.ink }}
              >
                확인했어요
              </Text>
            </Glass>
          </Pressable>
        </View>
      ) : null}
    </Glass>
  );
}

// Home-screen news: release logs and time-boxed event notices (content lives
// in constants/updates.ts). Each card is dismissed on its own and stays gone
// until its id changes. Expands in place — no modal, since stacking native
// screens mid-transition has crashed this app before.
export default function NewsPanel({ hasCatches }: { hasCatches: boolean }) {
  const [dismissed, setDismissed] = useState<string[] | null>(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(DISMISSED_KEY)
      .then((raw) => {
        if (!cancelled) setDismissed(raw ? JSON.parse(raw) : []);
      })
      .catch(() => {
        // storage unavailable — show nothing rather than nag every time.
        if (!cancelled) setDismissed(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (dismissed == null) return null;

  const todayKey = localDateKey(today);
  const live = NEWS.filter(
    (n) => !dismissed.includes(n.id) && isLive(n, todayKey, hasCatches),
  ).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "event" ? -1 : 1));

  if (live.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify(next)).catch(() => {});
  };

  return (
    <View
      style={{
        paddingHorizontal: rs(16),
        marginBottom: rs(14),
        gap: rs(10),
      }}
    >
      {live.map((item) => (
        <NewsCard
          key={item.id}
          item={item}
          today={today}
          onDismiss={() => dismiss(item.id)}
        />
      ))}
    </View>
  );
}
