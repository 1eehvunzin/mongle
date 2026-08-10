import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import MongleMascot from "../../components/MongleMascot";
import HeroBlobs from "../../components/HeroBlobs";
import Glass from "../../components/Glass";
import { glass } from "../../constants/aquaTheme";
import { onboardingState } from "../../constants/onboarding";
import { rs } from "../../constants/scale";
import { getTodaySky, TodaySkyOut } from "../../lib/api";
import { getHome, HomeOut } from "../../lib/localStore";
import { ensureSession, session } from "../../lib/session";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type ConditionKey = "맑음" | "구름조금" | "흐림" | "비" | "노을";

const CONDITION_ICONS: Record<ConditionKey, keyof typeof Ionicons.glyphMap> = {
  맑음: "sunny-outline",
  구름조금: "partly-sunny-outline",
  흐림: "cloud-outline",
  비: "rainy-outline",
  노을: "partly-sunny-outline",
};

// Weather condition → desaturated glass tone (function preserved from the
// old weatherGradients, saturation pulled way down per direction feedback).
const SKY_GLASS: Record<
  ConditionKey,
  { top: string; mid: string; rim: string; shadow: string }
> = {
  맑음: { top: "#D2E9F1", mid: "#93C4D6", rim: "#4C8199", shadow: "#5D96AC" },
  구름조금: {
    top: "#DBE0EF",
    mid: "#AFB7D8",
    rim: "#6B74A0",
    shadow: "#7680AC",
  },
  흐림: { top: "#E6E6E2", mid: "#C6C6BD", rim: "#8F8F83", shadow: "#98988C" },
  비: { top: "#CCDDE0", mid: "#8FAEB3", rim: "#557D80", shadow: "#5C8689" },
  노을: { top: "#F4D6CC", mid: "#E3A794", rim: "#BC6B54", shadow: "#CB8064" },
};

function formatTodayCaption(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

function formatTime(date: Date) {
  const hours = date.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${displayHour}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const RECENT_TINTS = [glass.white, glass.blue, glass.gray];

export default function HomeScreen() {
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [home, setHome] = useState<HomeOut | null>(null);
  const [homeRefreshing, setHomeRefreshing] = useState(false);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [todaySky, setTodaySky] = useState<TodaySkyOut | null>(null);
  const spin = useSharedValue(0);

  const condition: ConditionKey = todaySky?.condition ?? "맑음";
  const sky = SKY_GLASS[condition];
  const conditionIcon = CONDITION_ICONS[condition];

  // Real device location for the weather card's place chip and the
  // today-sky lookup — best-effort, same pattern as capture.tsx: a denied
  // permission or a platform without reverse geocoding (web) just falls
  // back to a plain label instead of blocking the card.
  useEffect(() => {
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      try {
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const [place] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setPlaceName(place?.name ?? place?.district ?? place?.city ?? null);
      } catch {
        // reverseGeocodeAsync isn't available on web, or the lookup failed —
        // stay with the fallback label below.
      }
    })();
  }, []);

  const loadWeather = useCallback(async () => {
    if (!coords) return;
    try {
      setTodaySky(await getTodaySky(coords.lat, coords.lng));
      setUpdatedAt(new Date());
    } catch {
      // best-effort — keep whatever was last loaded, if anything.
    }
  }, [coords]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const loadHome = useCallback(async () => {
    try {
      setHome(await getHome());
    } catch {
      // best-effort — keep whatever was last loaded, if anything.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHome();
    }, [loadHome]),
  );

  const onRefreshHome = async () => {
    setHomeRefreshing(true);
    await loadHome();
    setHomeRefreshing(false);
  };

  const level = home?.level ?? 1;
  const levelProgressPct = home?.level_progress_pct ?? 0;
  const streakCurrent = home?.streak_current ?? 0;
  const recentCatches = home?.recent_catches ?? [];

  // First launch of the session: ask for a nickname as a modal over the
  // home screen itself, rather than a standalone page before it. Waits on
  // ensureSession() (shared with the root layout's own call — see
  // lib/session.ts) instead of reading onboardingState.nicknameSet
  // synchronously on mount: that flag is only set *after* the session
  // fetch resolves, so checking it immediately raced the network and made
  // this modal cover the whole screen (tab bar included, blocking the
  // camera button) on every cold load, even for a returning user who'd
  // already set a nickname.
  useEffect(() => {
    let cancelled = false;
    const openNicknameModal = () => {
      if (!cancelled) router.push("/nickname");
    };
    ensureSession()
      .then(() => {
        if (session.nickname) onboardingState.nicknameSet = true;
        if (!onboardingState.nicknameSet) openNicknameModal();
      })
      .catch(() => {
        // backend unreachable — fall back to whatever this session already
        // knows rather than blocking the home screen indefinitely.
        if (!onboardingState.nicknameSet) openNicknameModal();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  async function refreshWeather() {
    if (refreshing) return;
    setRefreshing(true);
    spin.value = 0;
    spin.value = withTiming(1, {
      duration: 650,
      easing: Easing.inOut(Easing.ease),
    });

    await loadWeather();
    setRefreshing(false);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: glass.bg }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: rs(108) }}
        refreshControl={
          <RefreshControl refreshing={homeRefreshing} onRefresh={onRefreshHome} />
        }
      >
        <View
          style={{
            paddingHorizontal: rs(16),
            paddingTop: rs(4),
            paddingBottom: rs(10),
          }}
        >
          <Text
            className="font-semibold"
            style={{ fontSize: rs(12.5), color: glass.sub }}
          >
            {formatTodayCaption(updatedAt)}
          </Text>
          <Text
            className="font-bold"
            style={{
              fontSize: rs(25),
              color: glass.ink,
              letterSpacing: -0.3,
              marginTop: 1,
            }}
          >
            오늘의 하늘
          </Text>
        </View>

        <View style={{ marginHorizontal: rs(16), marginBottom: rs(22) }}>
          <Glass
            tone={sky}
            radius={rs(24)}
            style={{ padding: rs(14), gap: rs(9), ...glassShadow(sky.shadow) }}
          >
            <HeroBlobs />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Glass
                tone={glass.white}
                radius={rs(999)}
                style={{ paddingHorizontal: rs(11), paddingVertical: rs(6) }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: rs(6),
                  }}
                >
                  <Ionicons name={conditionIcon} size={rs(13)} color={glass.ink} />
                  <Text
                    className="font-bold"
                    style={{ fontSize: rs(11), color: glass.ink }}
                  >
                    {condition} · {placeName ?? "위치 확인 중…"}
                  </Text>
                </View>
              </Glass>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: rs(8),
                }}
              >
                <Text style={{ fontSize: rs(11), color: "rgba(60,68,64,0.6)" }}>
                  {formatTime(updatedAt)} 기준
                </Text>
                <Pressable
                  onPress={refreshWeather}
                  hitSlop={10}
                  disabled={refreshing}
                >
                  <Glass
                    tone={glass.white}
                    radius={rs(13)}
                    style={{
                      width: rs(26),
                      height: rs(26),
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Animated.View style={spinStyle}>
                      <Ionicons
                        name="refresh"
                        size={rs(13)}
                        color={glass.ink}
                      />
                    </Animated.View>
                  </Glass>
                </Pressable>
              </View>
            </View>

            {/* The scene, composed rather than stacked: temp + stats anchor
                the left column (Apple-Weather-style — big number, quiet
                metadata lines beneath), the mascot stands in its own space
                on the right instead of fighting the temp for center stage. */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text
                  className="font-bold"
                  style={{
                    fontSize: rs(36),
                    color: glass.ink,
                    letterSpacing: -1,
                  }}
                >
                  {todaySky ? Math.round(todaySky.temp_c) : "–"}°
                </Text>
                {/* Level + streak, a divided pair, sized down to keep the
                    whole card landscape rather than stacking tall. */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: rs(6),
                  }}
                >
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: rs(4),
                      }}
                    >
                      <Ionicons
                        name="sparkles"
                        size={rs(10)}
                        color={glass.accent}
                      />
                      <Text
                        className="font-semibold"
                        style={{ fontSize: rs(10), color: glass.ink }}
                      >
                        Lv.{level}
                      </Text>
                    </View>
                    <View
                      style={{
                        marginTop: rs(4),
                        height: rs(3),
                        width: rs(40),
                        borderRadius: rs(1.5),
                        backgroundColor: "rgba(60,68,64,0.15)",
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${levelProgressPct}%`,
                          height: "100%",
                          backgroundColor: glass.accent,
                          borderRadius: rs(1.5),
                        }}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      width: 1,
                      height: rs(22),
                      backgroundColor: "rgba(60,68,64,0.15)",
                      marginHorizontal: rs(12),
                    }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: rs(4),
                    }}
                  >
                    <Ionicons name="flame" size={rs(10)} color={glass.accent} />
                    <Text
                      className="font-semibold"
                      style={{ fontSize: rs(10), color: glass.ink }}
                    >
                      {streakCurrent}일째 연속
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ width: rs(64), alignItems: "center" }}>
                <MongleMascot size={64} bob duration={3200} />
              </View>
            </View>

            <Pressable onPress={() => router.push("/capture")}>
              {/* Speech-bubble shape, tail pointing up at the mascot's spot. */}
              <View style={{ alignItems: "flex-end", paddingRight: rs(22) }}>
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: rs(6),
                    borderRightWidth: rs(6),
                    borderBottomWidth: rs(7),
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderBottomColor: glass.white.top,
                  }}
                />
              </View>
              <Glass
                tone={glass.white}
                radius={rs(16)}
                style={{ paddingVertical: rs(10), paddingHorizontal: rs(14) }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: rs(9),
                  }}
                >
                  <Text
                    style={{
                      fontSize: rs(11.5),
                      color: glass.ink,
                      lineHeight: rs(16),
                      flex: 1,
                    }}
                  >
                    오늘은{" "}
                    <Text className="font-bold">
                      {todaySky?.cloud_name ?? "뭉게구름"}
                    </Text>
                    이 잘
                    보이는 날! 찍어서 채워볼까?
                  </Text>
                  <Ionicons name="camera" size={rs(16)} color={glass.ink} />
                </View>
              </Glass>
            </Pressable>
          </Glass>
        </View>

        <View
          style={{
            paddingHorizontal: rs(16),
            marginTop: rs(10),
            marginBottom: rs(11),
          }}
        >
          <Text
            className="font-bold"
            style={{ fontSize: rs(14.5), color: glass.ink }}
          >
            최근 포착
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            paddingHorizontal: rs(16),
            gap: rs(8),
          }}
        >
          {recentCatches.length === 0 ? (
            <Text
              style={{ fontSize: rs(11.5), color: glass.subMuted, flex: 1 }}
            >
              아직 포착한 구름이 없어요.
            </Text>
          ) : (
            recentCatches.map((item, i) => {
              const photoUrl = item.photo_url;
              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/share",
                      params: { catchId: String(item.id) },
                    })
                  }
                  style={{ width: rs(64), alignItems: "center" }}
                >
                  {/* Porthole thumbnail — a circular glass lens, the click-wheel
                      chrome cue carried onto a piece of real content. */}
                  <Glass
                    tone={RECENT_TINTS[i % RECENT_TINTS.length]}
                    radius={rs(33)}
                    style={{
                      width: rs(64),
                      height: rs(64),
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: glass.border,
                      overflow: "hidden",
                    }}
                  >
                    {photoUrl ? (
                      <Image
                        source={{ uri: photoUrl }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <Text style={{ fontSize: rs(22), opacity: 0.75 }}>
                        ☁️
                      </Text>
                    )}
                  </Glass>
                  <Text
                    className="font-semibold"
                    style={{
                      fontSize: rs(9.5),
                      color: glass.ink,
                      marginTop: rs(8),
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    {item.cloud_name}
                  </Text>
                </Pressable>
              );
            })
          )}

          {recentCatches.length > 0 && (
            <Link href="/feed" asChild>
              <Pressable
                style={{
                  width: rs(64),
                  alignItems: "center",
                  justifyContent: "center",
                  gap: rs(4),
                }}
              >
                <View
                  style={{
                    width: rs(64),
                    height: rs(64),
                    borderRadius: rs(33),
                    borderWidth: 1,
                    borderColor: glass.border,
                    borderStyle: "dashed",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="arrow-forward"
                    size={rs(16)}
                    color={glass.subMuted}
                  />
                </View>
                <Text style={{ fontSize: rs(9.5), color: glass.subMuted }}>
                  전체
                </Text>
              </Pressable>
            </Link>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function glassShadow(color: string) {
  return {
    shadowColor: color,
    shadowOpacity: 0.28,
    shadowRadius: rs(16),
    shadowOffset: { width: 0, height: rs(6) },
    elevation: 4,
  };
}
