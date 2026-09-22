import { useEffect, useMemo, useRef, useState } from "react";
import {
  GestureResponderEvent,
  Image,
  InteractionManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { captureRef } from "react-native-view-shot";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { drawHandoff } from "../lib/drawHandoff";
import { createCatch } from "../lib/localStore";
import {
  SHAPE_CLOUD_TYPE,
  SHAPE_PRESETS,
  shapeCloudName,
} from "../lib/shapeClouds";

// Fixed brush — no color picker, per RETENTION_DISCOVERY.md §E: a cream,
// colored-pencil-ish stroke with a pale blue-gray halo underneath it, since
// a cream line alone disappears against bright cloud/sky (the doc's own
// flagged visibility risk). This has NOT been checked on a real device —
// @shopify/react-native-skia is a native module, so this whole screen only
// runs after a new dev-client/EAS build; see the note in capture.tsx.
const BRUSH = "#FFF3D6";
const HALO = "#6C828C";

type Point = { x: number; y: number };
type Step = "draw" | "name";

function toSkPath(points: Point[]) {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    path.lineTo(points[i].x, points[i].y);
  }
  return path;
}

// One stroke, drawn three times (a wide pale halo underneath, then two
// slightly offset cream passes) — the closest a flat Skia fill gets to a
// colored pencil's layered, slightly-off-register look without a real
// per-point jitter/grain shader.
function StrokeLayer({ points }: { points: Point[] }) {
  const path = useMemo(() => toSkPath(points), [points]);
  if (points.length < 2) return null;
  return (
    <>
      <Path
        path={path}
        color={HALO}
        style="stroke"
        strokeWidth={22}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.28}
      />
      <Path
        path={path}
        color={BRUSH}
        style="stroke"
        strokeWidth={13}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.55}
      />
      <Path
        path={path}
        color={BRUSH}
        style="stroke"
        strokeWidth={9}
        strokeCap="round"
        strokeJoin="round"
        opacity={0.5}
        transform={[{ translateX: 1.5 }, { translateY: 1 }]}
      />
    </>
  );
}

export default function DrawScreen() {
  // The photo + capture context handed off from capture.tsx — see
  // lib/drawHandoff.ts for why this isn't a router param. Missing on a
  // direct/refreshed load of this route (there's nothing to draw on), so
  // bail back out rather than render a blank screen.
  const ctxRef = useRef(drawHandoff.pending);
  useEffect(() => {
    drawHandoff.pending = null;
    if (ctxRef.current) return;
    // A direct/refreshed load of this route (no push from capture.tsx, so
    // nothing pending) has no navigation history to go back to — router.back()
    // there throws "Attempted to navigate before mounting the Root Layout
    // component" since the root Stack hasn't finished mounting yet on a
    // cold load. Deferred past the current interaction/frame (the same
    // InteractionManager pattern this app already uses everywhere else for
    // a mount-time router call — see home.tsx) and routed to a real screen
    // instead of back() when there's nothing to go back to.
    InteractionManager.runAfterInteractions(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/home");
    });
  }, []);
  const ctx = ctxRef.current;

  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [current, setCurrent] = useState<Point[] | null>(null);
  const [step, setStep] = useState<Step>("draw");
  const [chosenPreset, setChosenPreset] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<View>(null);

  if (!ctx) return null;

  // Web is intentionally unsupported for the drawing canvas itself — not a
  // capability gap, a safety one. @shopify/react-native-skia's web target
  // needs its CanvasKit (WASM) runtime loaded before any <Canvas>/<Path>
  // mounts, but this app's web build is server-rendered (app.json's
  // web.output: "server"): any route whose render reaches a live Skia call
  // during that Node-side pass crashes the whole render server for every
  // visitor, not just this screen — confirmed the hard way with a throwaway
  // test route. Keeping this branch ahead of anything Skia-touching is what
  // makes that impossible regardless of platform/SSR edge cases, matching
  // RETENTION_DISCOVERY.md §E5's own fallback ("웹은 '모바일에서 그리기
  // 가능' 안내로 제한") — revisit if this ever moves off SSR output.
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <Image
          source={{ uri: ctx.photoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: rs(30) },
          ]}
        >
          <Ionicons name="brush-outline" size={rs(34)} color="#FFFFFF" />
          <Text
            className="font-bold"
            style={{ fontSize: rs(15), color: "#FFFFFF", textAlign: "center", marginTop: rs(14) }}
          >
            모양 구름 그리기는{"\n"}아직 앱에서만 할 수 있어요
          </Text>
          <Pressable onPress={() => router.back()} style={{ marginTop: rs(22) }}>
            <Glass tone={glass.white} radius={rs(999)} style={{ paddingHorizontal: rs(22), paddingVertical: rs(12) }}>
              <Text className="font-bold" style={{ fontSize: rs(13), color: glass.ink }}>
                돌아가기
              </Text>
            </Glass>
          </Pressable>
        </View>
      </View>
    );
  }

  const onTouchStart = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setCurrent([{ x: locationX, y: locationY }]);
  };
  const onTouchMove = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    setCurrent((prev) =>
      prev ? [...prev, { x: locationX, y: locationY }] : prev,
    );
  };
  const onTouchEnd = () => {
    setCurrent((prev) => {
      if (prev && prev.length > 1) setStrokes((all) => [...all, prev]);
      return null;
    });
  };

  const undo = () => setStrokes((all) => all.slice(0, -1));

  const label = chosenPreset ?? customName.trim();
  const canSave = label.length > 0 && !saving;

  const captureComposite = async (): Promise<string> => {
    if (Platform.OS === "web") {
      const { default: html2canvas } = await import("html2canvas");
      const node = canvasRef.current as unknown as HTMLElement | null;
      if (!node) throw new Error("draw canvas element is missing");
      const canvas = await html2canvas(node, {
        useCORS: true,
        backgroundColor: "#000000",
        scale: 2,
      });
      return canvas.toDataURL("image/jpeg", 0.9);
    }
    return await captureRef(canvasRef, { format: "jpg", quality: 0.9, result: "base64" });
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const composite = await captureComposite();
      const saved = await createCatch({
        cloud_name: shapeCloudName(label),
        cloud_type: SHAPE_CLOUD_TYPE,
        memo: null,
        place_name: ctx.placeName,
        lat: ctx.lat,
        lng: ctx.lng,
        temp_c: ctx.tempC,
        weather_condition: ctx.weatherCondition,
        photo_base64: composite,
      });
      // This screen sits on top of capture.tsx's own modal (capture → draw)
      // — dismiss both before landing on the share card, the same two-step
      // capture.tsx's own register() does for its one level.
      router.back();
      router.back();
      router.push({ pathname: "/share", params: { catchId: String(saved.id) } });
    } catch (e) {
      console.error("[draw] save failed", e);
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <View ref={canvasRef} collapsable={false} style={{ flex: 1 }}>
        <Image
          source={{ uri: ctx.photoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <Canvas
          style={StyleSheet.absoluteFill}
          onTouchStart={step === "draw" ? onTouchStart : undefined}
          onTouchMove={step === "draw" ? onTouchMove : undefined}
          onTouchEnd={step === "draw" ? onTouchEnd : undefined}
        >
          {strokes.map((s, i) => (
            <StrokeLayer key={i} points={s} />
          ))}
          {current ? <StrokeLayer points={current} /> : null}
        </Canvas>
      </View>

      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: rs(16),
            paddingTop: rs(10),
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Glass
              tone={glass.white}
              radius={rs(999)}
              style={{ width: rs(36), height: rs(36), alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="close" size={rs(18)} color={glass.ink} />
            </Glass>
          </Pressable>
          {step === "draw" ? (
            <Text className="font-bold" style={{ fontSize: rs(13), color: "#FFFFFF" }}>
              구름에 그려보세요
            </Text>
          ) : (
            <View />
          )}
          {step === "draw" ? (
            <Pressable onPress={undo} disabled={strokes.length === 0} hitSlop={12}>
              <Glass
                tone={glass.white}
                radius={rs(999)}
                style={{
                  width: rs(36),
                  height: rs(36),
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: strokes.length === 0 ? 0.4 : 1,
                }}
              >
                <Ionicons name="arrow-undo" size={rs(17)} color={glass.ink} />
              </Glass>
            </Pressable>
          ) : (
            <View style={{ width: rs(36) }} />
          )}
        </View>
      </SafeAreaView>

      {step === "draw" ? (
        <SafeAreaView edges={["bottom"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          <View style={{ paddingHorizontal: rs(16), paddingBottom: rs(14) }}>
            <Pressable onPress={() => setStep("name")} disabled={strokes.length === 0}>
              <Glass
                tone={glass.blue}
                radius={rs(999)}
                style={{
                  paddingVertical: rs(15),
                  alignItems: "center",
                  opacity: strokes.length === 0 ? 0.5 : 1,
                }}
              >
                <Text className="font-bold" style={{ fontSize: rs(13), color: glass.ink }}>
                  다 그렸어요
                </Text>
              </Glass>
            </Pressable>
          </View>
        </SafeAreaView>
      ) : (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: glass.card,
            borderTopLeftRadius: rs(20),
            borderTopRightRadius: rs(20),
            paddingBottom: rs(26),
            maxHeight: "56%",
          }}
        >
          <View
            style={{
              width: rs(36),
              height: rs(4),
              borderRadius: rs(2),
              alignSelf: "center",
              marginTop: rs(10),
              backgroundColor: glass.border,
            }}
          />
          <Text
            className="font-bold"
            style={{ fontSize: rs(15), color: glass.ink, paddingHorizontal: rs(16), paddingTop: rs(14) }}
          >
            무슨 모양인가요?
          </Text>
          <Text
            style={{ fontSize: rs(12), color: glass.sub, paddingHorizontal: rs(16), marginTop: rs(4) }}
          >
            목록에서 고르거나 직접 이름을 지어주세요
          </Text>

          <ScrollView
            style={{ marginTop: rs(12) }}
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: rs(8),
              paddingHorizontal: rs(16),
            }}
          >
            {SHAPE_PRESETS.map((label) => {
              const active = chosenPreset === label;
              return (
                <Pressable
                  key={label}
                  onPress={() => {
                    setChosenPreset(active ? null : label);
                    setCustomName("");
                  }}
                  style={{
                    paddingHorizontal: rs(14),
                    height: rs(34),
                    borderRadius: rs(17),
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: active ? glass.ink : "#FFFFFF",
                    shadowColor: "#000",
                    shadowOpacity: active ? 0 : 0.1,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: active ? 0 : 1,
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ fontSize: rs(12.5), color: active ? "#FFFFFF" : glass.ink }}
                  >
                    {label}구름
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ paddingHorizontal: rs(16), marginTop: rs(12) }}>
            <TextInput
              value={customName}
              onChangeText={(t) => {
                setCustomName(t);
                setChosenPreset(null);
              }}
              placeholder="직접 이름 짓기 (예: 우리집 냥이 구름)"
              placeholderTextColor={glass.subMuted}
              maxLength={20}
              style={{
                borderWidth: 1,
                borderColor: glass.border,
                borderRadius: rs(12),
                paddingHorizontal: rs(14),
                paddingVertical: rs(10),
                fontSize: rs(13),
                color: glass.ink,
              }}
            />
          </View>

          <View style={{ paddingHorizontal: rs(16), marginTop: rs(14) }}>
            <Pressable onPress={save} disabled={!canSave}>
              <Glass
                tone={glass.blue}
                radius={rs(999)}
                style={{ paddingVertical: rs(15), alignItems: "center", opacity: canSave ? 1 : 0.5 }}
              >
                <Text className="font-bold" style={{ fontSize: rs(13), color: glass.ink }}>
                  {saving ? "저장 중…" : "모양 구름으로 등록"}
                </Text>
              </Glass>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
