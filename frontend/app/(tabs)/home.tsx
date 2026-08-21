import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  InteractionManager,
  Platform,
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
import { getApiBaseUrl, getTodaySky, TodaySkyOut } from "../../lib/api";
import { getHome, getLoginOnboardingSeen, HomeOut } from "../../lib/localStore";
import { ensureSession, session } from "../../lib/session";
import { account, completeKakaoWebSignIn, ensureAccount } from "../../lib/auth";

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

// Used while the real reading is unknown (still loading, or failed) —
// reuses the app's plain neutral tone (glass.gray) rather than any of the 5
// condition colors above, so it never gets mistaken for an actual (wrong)
// weather reading.
const SKY_NEUTRAL = glass.gray;

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
  const [updatedAt, setUpdatedAt] = useState(new Date(0));
  const [refreshing, setRefreshing] = useState(false);
  const [home, setHome] = useState<HomeOut | null>(null);
  const [homeRefreshing, setHomeRefreshing] = useState(false);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [todaySky, setTodaySky] = useState<TodaySkyOut | null>(null);
  // Separate from todaySky being null so the card can tell "still loading"
  // apart from "loaded and it's actually 맑음" — collapsing those into one
  // ?? "맑음" fallback was exactly what made a stuck/failed fetch silently
  // masquerade as a real (wrong) reading.
  const [weatherStatus, setWeatherStatus] = useState<
    "loading" | "error" | "loaded"
  >("loading");
  const spin = useSharedValue(0);
  const kakaoCodeHandled = useRef(false);

  useEffect(() => {
    setUpdatedAt(new Date());
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const params = new URLSearchParams(window.location.search);
    const kakaoCode = params.get("code");
    const kakaoError = params.get("error");
    if (kakaoError || !kakaoCode || kakaoCodeHandled.current) return;
    kakaoCodeHandled.current = true;
    window.history.replaceState({}, "", window.location.pathname);

    completeKakaoWebSignIn(kakaoCode)
      .then(() => router.replace("/home"))
      .catch((error: unknown) => {
        console.error("[kakao/web] sign-in failed", error);
        window.alert(
          error instanceof Error
            ? error.message
            : "카카오 로그인에 실패했어요.",
        );
        router.replace("/home");
      });
  }, []);

  // fetchLocation below is called both on mount and from the refresh
  // button, so it can't rely on a per-effect `cancelled` closure the way a
  // one-shot mount effect would — this guards every state update against
  // firing after the screen's already unmounted instead.
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const condition: ConditionKey | null = todaySky?.condition ?? null;
  const sky = condition ? SKY_GLASS[condition] : SKY_NEUTRAL;
  const conditionIcon = condition
    ? CONDITION_ICONS[condition]
    : "cloud-outline";

  // Real device location for the weather card's place chip and the
  // today-sky lookup. A denied permission or failed lookup used to leave
  // `coords` null forever with no visible error, AND with no way to
  // retry — the refresh button only ever re-ran loadWeather(), which
  // early-returns without coords, so once this timed out the card was
  // stuck until a full page reload. fetchLocation is now callable again
  // from the refresh button too (see refreshWeather below).
  const fetchLocation = useCallback(async () => {
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;
      timedOut = true;
      console.warn(
        "[home/weather] location fetch timed out after 12s — no coords yet",
      );
      setPlaceName((prev) => prev ?? "위치 미확인");
      setWeatherStatus("error");
    }, 12000);

    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        console.warn(
          "[home/weather] location permission not granted:",
          perm.status,
        );
        clearTimeout(timeoutId);
        if (isMountedRef.current) {
          setPlaceName("위치 권한 필요");
          setWeatherStatus("error");
        }
        return;
      }

      // Only ever used for a district-level place chip and weather
      // lookup — city-block accuracy is plenty, no reason to ask for GPS
      // precision the feature doesn't need (and it resolves faster).
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      clearTimeout(timeoutId);
      if (timedOut || !isMountedRef.current) return; // already reported as an error above
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });

      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (isMountedRef.current) {
          setPlaceName(place?.name ?? place?.district ?? place?.city ?? null);
        }
      } catch (e) {
        // reverseGeocodeAsync isn't available on web in many browsers —
        // logged as info, not a warning, since this is expected there.
        // Left null rather than a generic "현재 위치" — loadWeather fills
        // this in from OpenWeatherMap's own city name instead once it
        // resolves, so the chip still gets a real place name on web.
        console.info(
          "[home/weather] reverseGeocodeAsync failed (expected on web):",
          e,
        );
      }
    } catch (e) {
      clearTimeout(timeoutId);
      if (timedOut || !isMountedRef.current) return;
      console.warn("[home/weather] location fetch failed:", e);
      setPlaceName("위치 미확인");
      setWeatherStatus("error");
    }
  }, []);

  useEffect(() => {
    // Deferred past the in-flight screen transition (this mounts right as
    // the splash screen's router.replace lands) — presenting the system
    // location-permission alert while a navigation transition is still
    // animating is a known source of iOS crashes.
    const task = InteractionManager.runAfterInteractions(fetchLocation);
    return () => task.cancel();
  }, [fetchLocation]);

  const loadWeather = useCallback(async () => {
    if (!coords) return;
    setWeatherStatus("loading");
    try {
      const data = await getTodaySky(coords.lat, coords.lng);
      setTodaySky(data);
      // Only fills a still-unknown place name (e.g. reverseGeocodeAsync
      // isn't available on web) — never overrides a real on-device result,
      // and never overwrites an explicit permission/timeout error message.
      setPlaceName((prev) => prev ?? data.place_name ?? "현재 위치");
      setUpdatedAt(new Date());
      setWeatherStatus("loaded");
    } catch (e) {
      // Most likely culprit in practice: EXPO_PUBLIC_API_URL pointing at a
      // backend that's unreachable, or one missing OPENWEATHER_API_KEY /
      // OPENAI_API_KEY server-side (/api/today-sky needs both) — logging
      // the base URL alongside the error makes that visible immediately
      // instead of just "정보 없음" on the card.
      console.warn(
        `[home/weather] getTodaySky failed (base URL: ${getApiBaseUrl()}):`,
        e,
      );
      setWeatherStatus("error");
    }
  }, [coords]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const loadHome = useCallback(async () => {
    try {
      await ensureAccount();
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
    // Pull-to-refresh used to only reload the level/streak stats — the
    // weather card had no way to recover from an error short of the tiny
    // spin button inside it. Same coords-missing gap as the spin button:
    // retry location itself rather than calling loadWeather(), which
    // silently no-ops without coords.
    await Promise.all([loadHome(), coords ? loadWeather() : fetchLocation()]);
    setHomeRefreshing(false);
  };

  const level = home?.level ?? 1;
  const levelProgressPct = home?.level_progress_pct ?? 0;
  const streakCurrent = home?.streak_current ?? 0;
  const recentCatches = home?.recent_catches ?? [];

  // First launch: login gets first say, nickname second — a nickname is
  // now account-scoped data, not device-local data collected before the
  // account system ever entered the picture, so it shouldn't be asked for
  // before login had its chance. If login is skipped (or the account
  // that's signed into already has no nickname), login-onboarding.tsx
  // itself chains into /nickname next — see its `finish()`. This effect
  // just decides where a fresh boot should land: nowhere (already fully
  // set up), login-onboarding (first time, signed out), or straight to
  // nickname (signed in already, or login was skipped on an earlier
  // launch — no need to ask about login again every time).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.all([ensureSession(), ensureAccount()]);
      if (cancelled) return;

      const hasNickname = account.token
        ? !!account.info?.nickname
        : !!session.nickname;
      if (hasNickname) {
        onboardingState.nicknameSet = true;
        return;
      }

      const loginSeen = await getLoginOnboardingSeen();
      if (cancelled) return;
      // Deferred: this screen has often *just* mounted as the target of the
      // splash screen's own router.replace, whose transition may still be
      // animating in — pushing another (modal) screen on top of a
      // still-in-flight transition is a known source of native crashes.
      InteractionManager.runAfterInteractions(() => {
        if (cancelled) return;
        if (!account.token && !loginSeen) {
          router.push("/login-onboarding");
        } else {
          router.push("/nickname");
        }
      });
    })().catch(() => {
      // backend/network unreachable — fall back to whatever's already
      // known rather than blocking the home screen indefinitely.
      if (!cancelled && !session.nickname && !account.token) {
        InteractionManager.runAfterInteractions(() => {
          if (!cancelled) router.push("/login-onboarding");
        });
      }
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

    // Without coords (a denied/timed-out/failed location fetch),
    // loadWeather() can't do anything — retry location itself instead of
    // just spinning the icon and reporting the same "정보 없음" again.
    if (coords) {
      await loadWeather();
    } else {
      await fetchLocation();
    }
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
          <RefreshControl
            refreshing={homeRefreshing}
            onRefresh={onRefreshHome}
          />
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
                  {weatherStatus === "loading" ? (
                    <ActivityIndicator size="small" color={glass.ink} />
                  ) : (
                    <Ionicons
                      name={
                        weatherStatus === "error"
                          ? "alert-circle-outline"
                          : conditionIcon
                      }
                      size={rs(13)}
                      color={glass.ink}
                    />
                  )}
                  <Text
                    className="font-bold"
                    style={{ fontSize: rs(11), color: glass.ink }}
                  >
                    {weatherStatus === "loading"
                      ? "확인 중"
                      : weatherStatus === "error"
                        ? "정보 없음"
                        : condition}
                    {" · "}
                    {placeName ?? "위치 확인 중…"}
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
                    opacity: todaySky ? 1 : 0.4,
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
                    {todaySky ? (
                      <>
                        오늘은{" "}
                        <Text className="font-bold">{todaySky.cloud_name}</Text>
                        이 잘 보이는 날! 찍어서 채워볼까?
                      </>
                    ) : (
                      "오늘 하늘엔 어떤 구름이 있을까? 찍어서 채워볼까?"
                    )}
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
