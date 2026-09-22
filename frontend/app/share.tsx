import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import MessageCard from "../components/MessageCard";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { CatchOut, getCatch } from "../lib/localStore";

// How far (in em) html2canvas draws text below where the browser puts it.
const HTML2CANVAS_TEXT_LIFT_EM = 0.22;

function downloadBlob(blob: Blob, filename: string) {
  const blobUrl = (globalThis as any).URL.createObjectURL(blob);
  const doc = (globalThis as any).document;
  const a = doc.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  doc.body.appendChild(a);
  a.click();
  a.remove();
  (globalThis as any).URL.revokeObjectURL(blobUrl);
}

// Everything below the card: the back-button row and the CTA pill, plus their
// gaps — reserved so the card's own height never pushes "스토리 공유하기"
// off-screen.
const CHROME_HEIGHT = rs(196);

const PLACEHOLDER_PHOTO = require("../assets/ref/cloud-2.jpg");

// Substring match, not an exact-key lookup — the same approach feed.tsx's
// own condition-to-icon mapping uses, since the API's condition strings
// aren't guaranteed to match a fixed key set exactly (e.g. "구름 조금" with
// a space, vs. home.tsx's own "구름조금" key).
function weatherEmoji(condition: string): string {
  if (condition.includes("노을")) return "🌇";
  if (condition.includes("맑음")) return "☀️";
  if (condition.includes("조금")) return "⛅";
  if (condition.includes("비")) return "🌧️";
  return "☁️";
}

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const liveDims = useWindowDimensions();
  // On mobile web, the browser chrome (address bar) collapsing/expanding
  // right after a hard refresh fires resize events that change
  // window.innerHeight several times in the first second or so — since the
  // card's size is derived straight from screenH, that made the whole story
  // card visibly resize/jump right after the page loaded. The card's own
  // aspect ratio never actually needs to track that: freeze to whatever
  // dimensions were present at first mount instead of re-deriving on every
  // resize (native apps don't get spurious resizes like this, so this only
  // applies on web).
  const initialDimsRef = useRef(liveDims);
  const { width: screenW, height: screenH } =
    Platform.OS === "web" ? initialDimsRef.current : liveDims;
  const { catchId } = useLocalSearchParams<{ catchId?: string }>();

  const [item, setItem] = useState<CatchOut | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [sharing, setSharing] = useState(false);
  // The card itself (square, no rounding) — this is what gets captured.
  const cardRef = useRef<View>(null);

  useEffect(() => {
    if (!catchId) return;
    getCatch(catchId)
      .then(setItem)
      .catch(() => setLoadError(true));
  }, [catchId]);

  // The user's own words if they wrote any, otherwise the default line.
  const caption = item?.memo?.trim()
    ? item.memo.trim()
    : "구름을 기록하는 방법";
  const photoUrl = item?.photo_url ?? null;

  // Place + weather, e.g. "📍서울 성동구  ☀️맑음 22°" — the identity/context an
  // iMessage screenshot doesn't otherwise carry. Emoji mark each part instead
  // of a middle-dot separator.
  const cardMeta = item
    ? [
        item.place_name ? `📍${item.place_name}` : null,
        item.weather_condition
          ? `${weatherEmoji(item.weather_condition)}${item.weather_condition}${
              item.temp_c != null ? ` ${Math.round(item.temp_c)}°` : ""
            }`
          : null,
      ]
        .filter(Boolean)
        .join("  ") || null
    : null;

  const availableHeight = screenH - insets.top - insets.bottom - CHROME_HEIGHT;
  const widthFromHeight = availableHeight * (9 / 16);
  const horizontalCap = screenW - rs(32);
  const cardWidth = Math.max(rs(150), Math.min(horizontalCap, widthFromHeight));

  // The shared image is the card exactly as it appears on screen.
  const captureStory = async (result: "tmpfile" | "data-uri") => {
    if (Platform.OS === "web") {
      // react-native-view-shot's captureRef can't run on the web (it needs
      // findNodeHandle, which React Native Web doesn't implement, so it
      // always throws). Draw the card with html2canvas directly instead.
      const { default: html2canvas } = await import("html2canvas");
      const node = cardRef.current as unknown as HTMLElement | null;
      if (!node) throw new Error("story card element is missing");
      const canvas = await html2canvas(node, {
        useCORS: true,
        backgroundColor: "#FFFFFF",
        scale: 2,
        // html2canvas places text slightly lower than the browser does, by an
        // amount that scales with the font size — labels sink to the bottom of
        // their keys and the typed line gets clipped. Nudge every text-bearing
        // element in the copy that is being drawn back up by that fraction.
        onclone: (doc: Document, el: HTMLElement) => {
          const win = doc.defaultView;
          if (!win) return;
          el.querySelectorAll<HTMLElement>("*").forEach((n) => {
            const hasText = Array.from(n.childNodes).some(
              (c) => c.nodeType === 3 && (c.textContent ?? "").trim() !== "",
            );
            if (!hasText) return;
            const cs = win.getComputedStyle(n);
            if (cs.position === "absolute") {
              // Already placed with `top` — lift it from where it is.
              if (cs.top !== "auto") {
                n.style.top = `calc(${cs.top} - ${HTML2CANVAS_TEXT_LIFT_EM}em)`;
              }
              return;
            }
            if (cs.position === "static") n.style.position = "relative";
            n.style.top = `${-HTML2CANVAS_TEXT_LIFT_EM}em`;
          });
        },
      });
      return canvas.toDataURL("image/jpeg", 0.92);
    }
    return await captureRef(cardRef, {
      format: "jpg",
      quality: 0.92,
      result,
    });
  };

  const shareStory = async () => {
    if (!item || sharing) return;
    setSharing(true);
    let shouldClose = false;
    try {
      if (Platform.OS === "web") {
        const blob = await (await fetch(await captureStory("data-uri"))).blob();
        const file = new File([blob], `mongle-catch-${item.id}.jpg`, {
          type: "image/jpeg",
        });

        const nav = globalThis.navigator as Navigator & {
          share?: (data: any) => Promise<void>;
          canShare?: (data: any) => boolean;
        };

        if (nav.share && nav.canShare?.({ files: [file] })) {
          try {
            await nav.share({
              title: "몽글 스토리",
              text: `${item.cloud_name} · ${item.cloud_type}`,
              files: [file],
            });
          } catch (e) {
            // A closed share sheet is not an error. Anything else (notably
            // NotAllowedError: building the image takes longer than the
            // browser allows between the tap and the share call) falls back
            // to a plain download so the image is never lost.
            if ((e as Error)?.name !== "AbortError") {
              downloadBlob(blob, `mongle-catch-${item.id}.jpg`);
            }
          }
        } else {
          // No Web Share file support (common on desktop browsers) — hand
          // the image to the browser's own download flow instead.
          downloadBlob(blob, `mongle-catch-${item.id}.jpg`);
        }
        shouldClose = true;
      } else {
        const uri = await captureStory("tmpfile");
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            dialogTitle: "몽글 스토리 공유하기",
          });
          shouldClose = true;
        }
      }
    } catch (e) {
      // Best-effort — the user may simply have cancelled the share sheet — but
      // keep the reason visible in dev so a real failure isn't invisible.
      console.warn("[share] sharing the story image failed:", e);
    } finally {
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
        {/* The shell rounds and shadows the card on screen; the view inside it
            (cardRef) stays square, so the exported image has no dark corners
            and nothing on screen changes while it is captured. */}
        <View
          style={{
            width: cardWidth,
            alignSelf: "center",
            borderRadius: 22 * (cardWidth / 300),
            shadowColor: glass.blue.shadow,
            shadowOpacity: 0.3,
            shadowRadius: rs(16),
            shadowOffset: { width: 0, height: rs(6) },
            elevation: 4,
          }}
        >
          <View
            style={{
              borderRadius: 22 * (cardWidth / 300),
              overflow: "hidden",
            }}
          >
            <View ref={cardRef} collapsable={false}>
              <MessageCard
                width={cardWidth}
                recipient="mongle: 구름을 수집하는 방법"
                sentText={item ? `${item.cloud_name} ☁️` : ""}
                caption={caption}
                photo={photoUrl ? { uri: photoUrl } : PLACEHOLDER_PHOTO}
                loading={!item && !loadError}
                meta={cardMeta}
              />
            </View>
          </View>
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
