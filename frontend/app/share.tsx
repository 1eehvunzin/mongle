import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import MongleMascot from "../components/MongleMascot";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { CatchOut, getCatch } from "../lib/localStore";

// Everything below the card: back-button row, the two-up action row, and
// the CTA pill, plus their gaps — reserved so the card's own height never
// pushes "스토리 공유하기" off-screen.
const CHROME_HEIGHT = rs(196);

const PLACEHOLDER_PHOTO = require("../assets/ref/cloud-2.jpg");

function formatCapturedAt(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const period = hours < 12 ? "오전" : "오후";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${period} ${displayHour}:${mm}`;
}

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { catchId } = useLocalSearchParams<{ catchId?: string }>();

  const [item, setItem] = useState<CatchOut | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  // Squares off the card's corners for the instant right before capture —
  // the on-screen card is rounded, but a story image posted elsewhere
  // shouldn't carry that rounding baked in as clipped/transparent corners.
  const [exportingFlat, setExportingFlat] = useState(false);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    if (!catchId) return;
    getCatch(catchId)
      .then(setItem)
      .catch(() => setLoadError(true));
  }, [catchId]);

  const bubbleText = item?.memo?.trim()
    ? item.memo.trim()
    : "오늘 하늘 미쳤다 ☁️";
  const photoUrl = item?.photo_url ?? null;
  const shareUrl = item
    ? `https://mongle.expo.app/share?catchId=${item.id}`
    : "https://mongle.expo.app";

  const availableHeight = screenH - insets.top - insets.bottom - CHROME_HEIGHT;
  const widthFromHeight = availableHeight * (9 / 16);
  const horizontalCap = screenW - rs(32);
  const cardWidth = Math.max(rs(150), Math.min(horizontalCap, widthFromHeight));

  // Saves the catch's already-local photo file straight to the device
  // gallery — not a composited poster render, just the real photo the user
  // took.
  const save = async () => {
    if (!photoUrl || saveState === "saving") return;
    setSaveState("saving");
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        setSaveState("error");
        return;
      }
      await MediaLibrary.createAssetAsync(photoUrl);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const copyLink = async () => {
    if (!item) return;
    await Clipboard.setStringAsync(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  const shareStory = async () => {
    if (!item || sharing) return;
    setSharing(true);
    let shouldClose = false;
    try {
      setExportingFlat(true);
      // Let the corner-radius style change above actually paint before the
      // view snapshot is taken — captureRef reads whatever's on screen at
      // that instant.
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      if (Platform.OS === "web") {
        // Same composited 9:16 story card the native branch below shares —
        // this used to just re-fetch the raw photo instead, so what went
        // out on web was the plain camera photo, not the actual story card
        // (place/temp/mascot bubble) visible on screen.
        const dataUri = await captureRef(cardRef, {
          format: "jpg",
          quality: 0.92,
          result: "data-uri",
        });
        setExportingFlat(false);

        const blob = await (await fetch(dataUri)).blob();
        const file = new File([blob], `mongle-catch-${item.id}.jpg`, {
          type: "image/jpeg",
        });

        const nav = globalThis.navigator as Navigator & {
          share?: (data: any) => Promise<void>;
          canShare?: (data: any) => boolean;
        };

        if (nav.share && nav.canShare?.({ files: [file] })) {
          await nav.share({
            title: "몽글 스토리",
            text: `${item.cloud_name} · ${item.cloud_type}`,
            files: [file],
          });
        } else {
          // No Web Share file support (common on desktop browsers) — hand
          // the story card to the browser's own download flow instead, so
          // "export" still produces the card even without a share sheet.
          const blobUrl = (globalThis as any).URL.createObjectURL(blob);
          const doc = (globalThis as any).document;
          const a = doc.createElement("a");
          a.href = blobUrl;
          a.download = `mongle-catch-${item.id}.jpg`;
          doc.body.appendChild(a);
          a.click();
          a.remove();
          (globalThis as any).URL.revokeObjectURL(blobUrl);
        }
        shouldClose = true;
      } else {
        const uri = await captureRef(cardRef, { format: "jpg", quality: 0.92 });
        setExportingFlat(false);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            dialogTitle: "몽글 스토리 공유하기",
          });
          shouldClose = true;
        }
      }
    } catch {
      // best-effort — user cancelled or sharing isn't available.
    } finally {
      setExportingFlat(false);
      setSharing(false);
      if (shouldClose) router.back();
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, minHeight: 0, backgroundColor: glass.bg }}
      edges={["top", "bottom"]}
    >
      <Pressable
        onPress={() => router.back()}
        style={{ padding: rs(10), paddingLeft: rs(6), alignSelf: "flex-start" }}
      >
        <Ionicons name="chevron-back" size={rs(24)} color={glass.ink} />
      </Pressable>

      <View style={{ marginHorizontal: rs(16), marginTop: rs(2) }}>
        <ImageBackground
          ref={cardRef}
          source={photoUrl ? { uri: photoUrl } : PLACEHOLDER_PHOTO}
          style={{
            width: cardWidth,
            alignSelf: "center",
            aspectRatio: 9 / 16,
            borderRadius: exportingFlat ? 0 : rs(22),
            overflow: "hidden",
            shadowColor: glass.blue.shadow,
            shadowOpacity: 0.3,
            shadowRadius: rs(16),
            shadowOffset: { width: 0, height: rs(6) },
            elevation: 4,
          }}
        >
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(20,30,36,0.05)", "rgba(20,30,36,0.55)"]}
            style={StyleSheet.absoluteFill}
          />

          {!item && !loadError && (
            <View
              style={[
                StyleSheet.absoluteFill,
                { alignItems: "center", justifyContent: "center" },
              ]}
            >
              <ActivityIndicator color="#fff" />
            </View>
          )}

          <View style={{ position: "absolute", top: rs(13), left: rs(13) }}>
            <Glass
              tone={glass.white}
              radius={rs(999)}
              style={{ paddingHorizontal: rs(7), paddingVertical: rs(3) }}
            >
              <Text
                className="font-semibold"
                style={{ fontSize: rs(9), color: glass.ink }}
              >
                {item?.dex_no ?? "No.???"}
              </Text>
            </Glass>
          </View>
          <View style={{ position: "absolute", top: rs(13), right: rs(13) }}>
            <Glass
              tone={glass.white}
              radius={rs(999)}
              style={{
                paddingHorizontal: rs(9),
                paddingVertical: rs(4),
                borderWidth: 1,
                borderColor: glass.border,
              }}
            >
              <Text
                className="font-bold"
                style={{ fontSize: rs(9), color: glass.ink }}
              >
                {item ? `${item.stars} ${item.rarity_label}` : "★☆☆ 일반"}
              </Text>
            </Glass>
          </View>

          <View
            style={{
              position: "absolute",
              top: rs(52),
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <Text
              className="font-semibold"
              style={{ fontSize: rs(13), color: "#fff" }}
            >
              {item?.place_name ?? "위치 정보 없음"}
            </Text>
            <Text
              className="font-bold"
              style={{ fontSize: rs(50), color: "#fff", lineHeight: rs(55) }}
            >
              {item?.temp_c != null ? `${Math.round(item.temp_c)}°` : "--°"}
            </Text>
            <Text
              className="font-semibold"
              style={{ fontSize: rs(11), color: "#fff", opacity: 0.85 }}
            >
              {item
                ? `${item.weather_condition ? `${item.weather_condition} · ` : ""}${formatCapturedAt(item.captured_at)}`
                : ""}
            </Text>
            <Text
              className="font-bold"
              style={{ fontSize: rs(12), color: "#fff", marginTop: rs(8) }}
            >
              {item ? `${item.cloud_name} · ${item.cloud_type}` : ""}
            </Text>
          </View>

          {/* Mascot sits right beside its own bubble now — chat-avatar +
              bubble, so the caption reads as the cloud actually saying it,
              not a caption floating near an unrelated centered character. */}
          <View
            style={{
              position: "absolute",
              bottom: rs(12),
              left: rs(10),
              right: rs(10),
              flexDirection: "row",
              alignItems: "flex-end",
              gap: rs(5),
            }}
          >
            <MongleMascot size={38} />
            <View
              style={{
                backgroundColor: "#3C82F6",
                borderRadius: rs(14),
                borderBottomLeftRadius: rs(3),
                paddingHorizontal: rs(10),
                paddingVertical: rs(7),
                marginBottom: rs(4),
                flexShrink: 1,
              }}
            >
              <Text
                className="font-semibold"
                style={{ fontSize: rs(10.5), color: "#fff" }}
              >
                {bubbleText}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View style={{ flexDirection: "row", gap: rs(9), marginTop: rs(14) }}>
          <Pressable onPress={save} style={{ flex: 1 }} disabled={!item}>
            <Glass
              tone={glass.white}
              radius={rs(12)}
              style={{
                alignItems: "center",
                paddingVertical: rs(11),
                borderWidth: 1,
                borderColor: glass.border,
                opacity: item ? 1 : 0.5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: rs(6),
                }}
              >
                <Ionicons
                  name={
                    saveState === "saved"
                      ? "checkmark"
                      : saveState === "error"
                        ? "alert"
                        : "download-outline"
                  }
                  size={rs(14)}
                  color={glass.ink}
                />
                <Text
                  style={{
                    fontSize: rs(12),
                    fontWeight: "600",
                    color: glass.ink,
                  }}
                >
                  {saveState === "saving"
                    ? "저장 중…"
                    : saveState === "saved"
                      ? "저장됨"
                      : saveState === "error"
                        ? "저장 실패"
                        : "저장"}
                </Text>
              </View>
            </Glass>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={copyLink} disabled={!item}>
            <Glass
              tone={glass.white}
              radius={rs(12)}
              style={{
                alignItems: "center",
                paddingVertical: rs(11),
                borderWidth: 1,
                borderColor: glass.border,
                opacity: item ? 1 : 0.4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: rs(6),
                }}
              >
                <Ionicons
                  name={linkCopied ? "checkmark" : "link-outline"}
                  size={rs(14)}
                  color={item ? glass.ink : glass.subMuted}
                />
                <Text
                  style={{
                    fontSize: rs(12),
                    fontWeight: "600",
                    color: item ? glass.ink : glass.subMuted,
                  }}
                >
                  {linkCopied ? "복사됨" : "링크"}
                </Text>
              </View>
            </Glass>
          </Pressable>
        </View>

        <Pressable
          onPress={shareStory}
          disabled={!item || sharing}
          style={{ marginTop: rs(14), opacity: item && !sharing ? 1 : 0.6 }}
        >
          <Glass
            tone={glass.blue}
            radius={rs(999)}
            style={{ paddingVertical: rs(15), alignItems: "center" }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: rs(7) }}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={glass.ink} />
              ) : (
                <Ionicons
                  name="share-outline"
                  size={rs(15)}
                  color={glass.ink}
                />
              )}
              <Text
                className="font-bold"
                style={{ fontSize: rs(13), color: glass.ink }}
              >
                {sharing ? "공유 준비 중…" : "스토리 공유하기"}
              </Text>
            </View>
          </Glass>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
