import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MongleMascot from "../../components/MongleMascot";
import Glass from "../../components/Glass";
import FeedSearchField from "../../components/FeedSearchField";
import FeedToolbar, { FeedGroup } from "../../components/FeedToolbar";
import FolderGrid from "../../components/FolderGrid";
import { glass } from "../../constants/aquaTheme";
import { rs } from "../../constants/scale";
import { CatchOut, getFeed } from "../../lib/localStore";
import { ensureAccount } from "../../lib/auth";
import { applyFilters, FolderGroup, groupItems } from "../../lib/feedFilters";

// Fallback art for catches saved without a photo — keyed loosely by species
// so the card still reads as "that kind of cloud" instead of a blank tile.
const FALLBACK_PHOTOS: Record<string, number> = {
  뭉게구름: require("../../assets/ref/cloud-3.jpg"),
  양떼구름: require("../../assets/ref/cloud-2.jpg"),
};
const DEFAULT_FALLBACK_PHOTO = require("../../assets/ref/cloud-1.jpg");

function conditionMeta(cond: string | null): {
  icon: keyof typeof Ionicons.glyphMap;
  text: string | null;
} {
  if (!cond) return { icon: "cloud-outline", text: null };
  if (cond.includes("노을")) return { icon: "partly-sunny", text: cond };
  if (cond.includes("맑음")) return { icon: "sunny", text: cond };
  if (cond.includes("조금"))
    return { icon: "partly-sunny-outline", text: cond };
  return { icon: "cloud-outline", text: cond };
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.floor(ms / 60000));
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

const PAGE_SIZE = 20;
const SEARCH_MIN_ITEMS = 20;
const FEED_FETCH_LIMIT = 200;

function FeedCard({ f }: { f: CatchOut }) {
  const cond = conditionMeta(f.weather_condition);
  const photoUrl = f.photo_url;
  return (
    <Glass
      tone={glass.white}
      radius={rs(20)}
      style={{
        marginHorizontal: rs(16),
        marginBottom: rs(14),
        borderWidth: 1,
        borderColor: glass.border,
      }}
    >
      <ImageBackground
        source={
          photoUrl
            ? { uri: photoUrl }
            : (FALLBACK_PHOTOS[f.cloud_name] ?? DEFAULT_FALLBACK_PHOTO)
        }
        style={{ height: rs(190), position: "relative" }}
      >
        <LinearGradient
          colors={["rgba(20,24,22,0.05)", "rgba(20,24,22,0.5)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ position: "absolute", top: rs(14), left: rs(16) }}>
          <Glass
            tone={glass.white}
            radius={rs(999)}
            style={{
              alignSelf: "flex-start",
              paddingLeft: rs(4),
              paddingRight: rs(9),
              paddingVertical: rs(4),
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: rs(6),
              }}
            >
              <Glass
                tone={glass.blue}
                radius={rs(9)}
                style={{
                  width: rs(18),
                  height: rs(18),
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={cond.icon} size={rs(11)} color={glass.ink} />
              </Glass>
              <Text
                className="font-bold"
                style={{ fontSize: rs(11), color: glass.ink }}
              >
                {cond.text ? `${cond.text} · ` : ""}
                {f.cloud_name}
                {f.temp_c != null ? ` · ${Math.round(f.temp_c)}°` : ""}
              </Text>
            </View>
          </Glass>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: rs(10),
            right: rs(14),
          }}
        >
          <MongleMascot size={44} />
        </View>
      </ImageBackground>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: rs(9),
          padding: rs(12),
        }}
      >
        <Glass
          tone={glass.gray}
          radius={rs(15)}
          style={{
            width: rs(30),
            height: rs(30),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MongleMascot size={22} />
        </Glass>
        <View style={{ flex: 1 }}>
          <Text
            className="font-semibold"
            style={{ fontSize: rs(12.5), color: glass.ink }}
          >
            {f.handle ?? "구름지기"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: rs(3),
              marginTop: 1,
            }}
          >
            <Ionicons name="location" size={rs(10)} color={glass.subMuted} />
            <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>
              {f.place_name ?? "위치 정보 없음"} · {timeAgo(f.captured_at)}
            </Text>
          </View>
        </View>
        <Glass
          tone={glass.white}
          radius={rs(999)}
          style={{
            paddingHorizontal: rs(9),
            paddingVertical: rs(5),
            borderWidth: 1,
            borderColor: glass.border,
          }}
        >
          <Text
            className="font-bold"
            style={{ fontSize: rs(11), color: glass.ink }}
          >
            {f.stars} {f.rarity_label}
          </Text>
        </Glass>
      </View>

      <View style={{ paddingHorizontal: rs(12), paddingBottom: rs(12) }}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/share",
              params: { catchId: String(f.id) },
            })
          }
        >
          <Glass
            tone={glass.blue}
            radius={rs(999)}
            style={{ paddingVertical: rs(13), alignItems: "center" }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: rs(7),
              }}
            >
              <Ionicons name="share-outline" size={rs(15)} color={glass.ink} />
              <Text
                className="font-bold"
                style={{ fontSize: rs(13), color: glass.ink }}
              >
                스토리 공유하기
              </Text>
            </View>
          </Glass>
        </Pressable>
      </View>
    </Glass>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <Text
      style={{
        color: glass.sub,
        fontSize: rs(13),
        textAlign: "center",
        paddingHorizontal: rs(30),
        paddingVertical: rs(24),
      }}
    >
      {text}
    </Text>
  );
}

function CardList({
  list,
  visibleCount,
  onMore,
}: {
  list: CatchOut[];
  visibleCount: number;
  onMore: () => void;
}) {
  if (list.length === 0) return <EmptyNote text="조건에 맞는 구름이 없어요" />;
  return (
    <>
      {list.slice(0, visibleCount).map((f) => (
        <FeedCard key={f.id} f={f} />
      ))}
      {list.length > visibleCount ? (
        <Pressable
          onPress={onMore}
          style={{ alignItems: "center", paddingVertical: rs(12) }}
        >
          <Text
            className="font-semibold"
            style={{ fontSize: rs(13), color: glass.accent }}
          >
            더 보기
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}

export default function FeedScreen() {
  const [items, setItems] = useState<CatchOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [group, setGroup] = useState<FeedGroup>("species");
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Search only earns its space once there's enough to search through.
  const showSearch = items.length >= SEARCH_MIN_ITEMS;
  const activeQuery = showSearch ? query : "";

  const searched = useMemo(
    () => applyFilters(items, { query: activeQuery }),
    [items, activeQuery],
  );
  const folders = useMemo(
    () => (group === "all" ? [] : groupItems(searched, group)),
    [searched, group],
  );
  const currentFolder = openFolder
    ? (folders.find((f) => f.key === openFolder) ?? null)
    : null;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [group, activeQuery, openFolder]);

  const load = useCallback(async () => {
    try {
      await ensureAccount();
      setItems(await getFeed(FEED_FETCH_LIMIT));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, minHeight: 0, backgroundColor: glass.bg }}
      edges={["top"]}
    >
      <View
        style={{
          paddingHorizontal: rs(16),
          paddingTop: rs(2),
          paddingBottom: rs(8),
          minHeight: rs(44),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
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
        {searchOpen ? (
          <FeedSearchField
            query={query}
            onQuery={setQuery}
            onClose={() => {
              setQuery("");
              setSearchOpen(false);
            }}
          />
        ) : (
          <>
            <Text
              className="font-bold"
              style={{
                fontSize: rs(24),
                color: glass.ink,
                letterSpacing: -0.3,
              }}
            >
              구름 피드
            </Text>
            {showSearch ? (
              <Pressable
                onPress={() => setSearchOpen(true)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="검색"
              >
                <Ionicons name="search" size={rs(20)} color={glass.ink} />
              </Pressable>
            ) : null}
          </>
        )}
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={glass.accent} />
        </View>
      ) : error && items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: rs(30),
          }}
        >
          <Text
            style={{ color: glass.sub, fontSize: rs(13), textAlign: "center" }}
          >
            피드를 불러오지 못했어요
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: rs(30),
          }}
        >
          <Text
            style={{ color: glass.sub, fontSize: rs(13), textAlign: "center" }}
          >
            아직 등록된 구름이 없어요.{"\n"}첫 구름을 촬영해보세요!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={[
            { flex: 1, minHeight: 0 },
            Platform.OS === "web" ? ({ overflow: "auto" } as any) : null,
          ]}
          contentContainerStyle={{ paddingTop: rs(6), paddingBottom: rs(110) }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <FeedToolbar
            group={group}
            onGroup={(g) => {
              setGroup(g);
              setOpenFolder(null);
            }}
            total={items.length}
          />

          {group === "all" ? (
            <CardList
              list={searched}
              visibleCount={visibleCount}
              onMore={() => setVisibleCount((n) => n + PAGE_SIZE)}
            />
          ) : currentFolder ? (
            <>
              <Pressable
                onPress={() => setOpenFolder(null)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: rs(6),
                  paddingHorizontal: rs(16),
                  marginBottom: rs(12),
                }}
              >
                <Ionicons name="chevron-back" size={rs(16)} color={glass.ink} />
                <Text
                  className="font-bold"
                  style={{ fontSize: rs(15), color: glass.ink }}
                >
                  {currentFolder.label}
                </Text>
                <Text style={{ fontSize: rs(12), color: glass.sub }}>
                  {currentFolder.items.length}장
                </Text>
              </Pressable>
              <CardList
                list={currentFolder.items}
                visibleCount={visibleCount}
                onMore={() => setVisibleCount((n) => n + PAGE_SIZE)}
              />
            </>
          ) : folders.length === 0 ? (
            <EmptyNote text="조건에 맞는 구름이 없어요" />
          ) : (
            <FolderGrid folders={folders} onOpen={setOpenFolder} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
