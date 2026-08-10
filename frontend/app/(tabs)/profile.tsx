import { useCallback, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MongleMascot from "../../components/MongleMascot";
import Glass from "../../components/Glass";
import { Ionicons } from "@expo/vector-icons";
import { glass } from "../../constants/aquaTheme";
import { rs } from "../../constants/scale";
import { getProfile, ProfileOut } from "../../lib/localStore";

const WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function sendFeedback() {
  Linking.openURL("mailto:monglegroom@gmail.com?subject=" + encodeURIComponent("몽글 피드백"));
}

// Both the streak card and the contribution graph now draw from the same
// glass.blue family the rest of the app (home/feed/tab bar) already uses —
// mock.ts's own heatColors was a different, more saturated blue left over
// from the old theme, which is exactly what read as mismatched.
const HEAT_COLORS = [glass.border, glass.blue.top, glass.blue.mid, "#7BB4C8", glass.blue.rim];
const STREAK_TONE = { top: glass.blue.mid, mid: glass.blue.rim, rim: "#356B7D", shadow: "#356B7D" };

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [profileRefreshing, setProfileRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setProfile(await getProfile());
    } catch {
      // best-effort — keep whatever was last loaded, if anything.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const onRefreshProfile = async () => {
    setProfileRefreshing(true);
    await loadProfile();
    setProfileRefreshing(false);
  };

  const nickname = profile?.nickname ?? "구름지기";
  const level = profile?.level ?? 1;
  const levelTitle = profile?.level_title ?? "몽글 새싹";
  const levelProgressPct = profile?.level_progress_pct ?? 0;
  const toNextLevel = profile?.catches_to_next_level ?? 0;
  const daysActive = profile?.days_active ?? 0;
  const streakCurrent = profile?.streak_current ?? 0;
  const streakLongest = profile?.streak_longest ?? 0;
  const weekChecks = profile?.week_checks ?? WEEK_LABELS.map(() => false);
  const heat = profile?.heat ?? Array(35).fill(0);
  const mostObserved = profile?.most_observed;

  return (
    <SafeAreaView
      style={{ flex: 1, minHeight: 0, backgroundColor: glass.bg }}
      edges={["top"]}
    >
      <View
        style={{
          paddingHorizontal: rs(16),
          paddingTop: rs(4),
          paddingBottom: rs(6),
          ...(Platform.OS === "web"
            ? {
                position: "sticky" as any,
                top: 0,
                zIndex: 10,
                backgroundColor: glass.bg,
              }
            : null),
        }}
      >
        <Text
          className="font-bold"
          style={{ fontSize: rs(25), color: glass.ink, letterSpacing: -0.3 }}
        >
          나
        </Text>
      </View>

      <ScrollView
        style={[
          { flex: 1, minHeight: 0 },
          Platform.OS === "web" ? ({ overflow: "auto" } as any) : null,
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: rs(6), paddingBottom: rs(108), gap: rs(14) }}
        refreshControl={
          <RefreshControl refreshing={profileRefreshing} onRefresh={onRefreshProfile} />
        }
      >
        {/* Identity + level, integrated as one row instead of two stacked
            sections split by a divider — the avatar anchors the left edge,
            everything about "where this user stands" flows in the column
            beside it. */}
        <View style={{ marginHorizontal: rs(16) }}>
          <Glass
            tone={glass.white}
            radius={rs(20)}
            style={{ padding: rs(16), flexDirection: "row", gap: rs(13), borderWidth: 1, borderColor: glass.border }}
          >
            <Glass tone={glass.gray} radius={rs(23)} style={{ width: rs(46), height: rs(46), alignItems: "center", justifyContent: "center" }}>
              <MongleMascot size={34} />
            </Glass>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
                <Text className="font-bold" style={{ fontSize: rs(15), color: glass.ink }}>{nickname}</Text>
                <Text style={{ fontSize: rs(10), color: glass.subMuted }}>
                  {toNextLevel > 0 ? `다음까지 ${toNextLevel}회` : "최고 레벨"}
                </Text>
              </View>
              <Text style={{ fontSize: rs(10.5), color: glass.sub, marginTop: 1 }}>{levelTitle} · {daysActive}일째 · Lv.{level}</Text>
              <View style={{ marginTop: rs(9), height: rs(5), borderRadius: rs(2.5), backgroundColor: "rgba(60,68,64,0.12)", overflow: "hidden" }}>
                <Glass tone={glass.blue} radius={rs(2.5)} style={{ width: `${levelProgressPct}%`, height: "100%" }} />
              </View>
            </View>
          </Glass>
        </View>

        {/* Streak — its own card, deep sky-blue instead of near-black
            charcoal so it stays in the app's own palette family. */}
        <View style={{ marginHorizontal: rs(16) }}>
          <Glass tone={STREAK_TONE} radius={rs(24)} style={{ padding: rs(18) }}>
            <View style={{ alignItems: "center" }}>
              <Ionicons name="flame" size={rs(22)} color="#fff" />
              <Text className="font-bold" style={{ fontSize: rs(42), color: "#fff", marginTop: rs(2) }}>{streakCurrent}일째</Text>
              <Text style={{ fontSize: rs(10.5), color: "rgba(255,255,255,0.5)", marginTop: rs(1) }}>연속 관측 · 최장 {streakLongest}일</Text>
            </View>

            <View style={{ flexDirection: "row", gap: rs(5), marginTop: rs(14) }}>
              {WEEK_LABELS.map((label, i) => {
                const checked = weekChecks[i];
                return (
                  <View key={label} style={{ alignItems: "center", gap: rs(4), flex: 1 }}>
                    {checked ? (
                      <Glass tone={glass.blue} radius={rs(10)} style={{ width: rs(20), height: rs(20), alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="checkmark" size={rs(12)} color={glass.ink} />
                      </Glass>
                    ) : (
                      <View style={{ width: rs(20), height: rs(20), borderRadius: rs(10), backgroundColor: "rgba(255,255,255,0.12)" }} />
                    )}
                    <Text style={{ fontSize: rs(9), color: "rgba(255,255,255,0.45)" }}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </Glass>
        </View>

        {/* Contribution graph — single purpose now (the most-caught fact
            moved into its title line instead of getting its own row). */}
        <View style={{ marginHorizontal: rs(16) }}>
          <Glass
            tone={glass.white}
            radius={rs(20)}
            style={{
              padding: rs(14),
              borderWidth: 1,
              borderColor: glass.border,
            }}
          >
            <Text
              className="font-semibold"
              style={{ fontSize: rs(11), color: glass.sub }}
            >
              최근 35일 관측 · 가장 많이 본 구름{" "}
              <Text style={{ color: glass.ink, fontWeight: "700" }}>
                {mostObserved ?? "-"}
              </Text>
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: rs(10),
                marginHorizontal: rs(-1.5),
              }}
            >
              {heat.map((cell, i) => (
                <View
                  key={i}
                  style={{
                    width: `${100 / 7}%`,
                    aspectRatio: 1,
                    padding: rs(1.5),
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      borderRadius: rs(2.5),
                      backgroundColor: HEAT_COLORS[cell],
                    }}
                  />
                </View>
              ))}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: rs(4),
                marginTop: rs(8),
              }}
            >
              <Text style={{ fontSize: rs(9.5), color: glass.subMuted }}>
                적음
              </Text>
              {HEAT_COLORS.map((c) => (
                <View
                  key={c}
                  style={{
                    width: rs(9),
                    height: rs(9),
                    borderRadius: rs(2.5),
                    backgroundColor: c,
                  }}
                />
              ))}
              <Text style={{ fontSize: rs(9.5), color: glass.subMuted }}>
                많음
              </Text>
            </View>
          </Glass>
        </View>

        <View style={{ marginHorizontal: rs(16) }}>
          <Glass
            tone={glass.white}
            radius={rs(16)}
            style={{
              borderWidth: 1,
              borderColor: glass.border,
              overflow: "hidden",
            }}
          >
            <SettingsRow
              icon="chatbubble-ellipses-outline"
              label="피드백 보내기"
              onPress={sendFeedback}
            />
            <SettingsRow
              icon="information-circle-outline"
              label="버전 정보"
              value="1.0.0"
              last
            />
          </Glass>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  last,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: rs(11),
        paddingHorizontal: rs(14),
        paddingVertical: rs(13),
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: glass.border,
      }}
    >
      <Ionicons name={icon} size={rs(17)} color={glass.sub} />
      <Text style={{ flex: 1, fontSize: rs(13), color: glass.ink }}>
        {label}
      </Text>
      {value ? (
        <Text style={{ fontSize: rs(12), color: glass.subMuted }}>{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={rs(15)} color={glass.subMuted} />
      )}
    </Wrapper>
  );
}
