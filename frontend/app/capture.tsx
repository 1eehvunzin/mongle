import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { captureConsent } from "../constants/consent";
import { rs } from "../constants/scale";
import { getTodaySky, recognize, TodaySkyOut } from "../lib/api";
import { createCatch } from "../lib/localStore";

type Phase = "camera" | "recognizing" | "result";
type Recognized = {
  name: string;
  type: string;
  confidence: number | null;
};

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("camera");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [recognized, setRecognized] = useState<Recognized | null>(null);
  const [recognizeError, setRecognizeError] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [todaySky, setTodaySky] = useState<TodaySkyOut | null>(null);
  const [registering, setRegistering] = useState(false);

  // Real device location for the "기록" chip and (once registered) the
  // catch's map pin — best-effort: a denied permission or a platform without
  // reverse geocoding (web) just falls back to a plain label instead of
  // blocking capture. Kept entirely client-side here — /api/recognize itself
  // never receives this, matching the consent screen's promise.
  useEffect(() => {
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return;
      try {
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        getTodaySky(pos.coords.latitude, pos.coords.longitude)
          .then(setTodaySky)
          .catch(() => {
            // best-effort — the temp chip falls back to a placeholder below.
          });
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

  // The photo itself is what's sent off for recognition, so this is the
  // gate: called right after a shutter press, and again on every retry if
  // the user backs out of the consent modal, or a previous attempt failed.
  const attemptSend = useCallback(async () => {
    if (!captureConsent.granted) {
      router.push("/consent");
      return;
    }
    if (!photoBase64) return;

    setPhase("recognizing");
    setRecognizeError(null);
    try {
      const data = await recognize(photoBase64);
      setRecognized({
        name: data.name,
        type: data.type,
        confidence: data.confidence,
      });
    } catch (e) {
      setRecognizeError(e instanceof Error ? e.message : "인식에 실패했어요");
    } finally {
      setPhase("result");
    }
  }, [photoBase64]);

  const shoot = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
      });
      setPhotoUri(photo?.uri ?? null);
      setPhotoBase64(photo?.base64 ?? null);
      attemptSend();
    } catch {
      // camera not ready / permission revoked mid-session — stay put and
      // let the user try the shutter again.
    }
  };

  // If consent was just accepted, this screen regains focus with a photo
  // already waiting — pick recognition back up automatically instead of
  // making the user press the send button a second time.
  useFocusEffect(
    useCallback(() => {
      if (photoBase64 && !recognized && captureConsent.granted) {
        attemptSend();
      }
    }, [photoBase64, recognized, attemptSend]),
  );

  const retake = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    setRecognized(null);
    setRecognizeError(null);
    setPhase("camera");
  };

  const register = async () => {
    if (!recognized || registering) return;
    setRegistering(true);
    try {
      const saved = await createCatch({
        cloud_name: recognized.name,
        cloud_type: recognized.type,
        confidence: recognized.confidence,
        memo: memo.trim() || null,
        place_name: placeName,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        temp_c: todaySky?.temp_c ?? null,
        weather_condition: todaySky?.condition ?? null,
        photo_base64: photoBase64,
      });
      router.back();
      router.push({ pathname: "/share", params: { catchId: String(saved.id) } });
    } catch (e) {
      console.error("createCatch failed", e);
      setRecognizeError("기록 저장에 실패했어요");
    } finally {
      setRegistering(false);
    }
  };

  // The shutter-styled center button does triple duty: it fires the real
  // shutter before a photo exists, retries the consent-gated send if the
  // user backed out of that modal or a previous attempt failed, and becomes
  // the register action once a result has come back — one control, matching
  // the original mock's shape.
  const pressCenterButton = () => {
    if (!photoUri) shoot();
    else if (!recognized) attemptSend();
    else register();
  };
  const centerButtonDisabled =
    phase === "recognizing" || registering || (!photoUri && !cameraReady);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: glass.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {!photoUri ? (
          permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="back"
              onCameraReady={() => setCameraReady(true)}
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: rs(28),
                gap: rs(14),
              }}
            >
              <Text
                style={{ color: "#fff", fontSize: rs(13), textAlign: "center" }}
              >
                {permission?.canAskAgain === false
                  ? "설정 앱에서 카메라 권한을 허용해주세요"
                  : "구름을 촬영하려면 카메라 권한이 필요해요"}
              </Text>
              {permission?.canAskAgain !== false && (
                <Pressable onPress={requestPermission}>
                  <Glass
                    tone={glass.blue}
                    radius={rs(999)}
                    style={{
                      paddingHorizontal: rs(20),
                      paddingVertical: rs(12),
                    }}
                  >
                    <Text
                      className="font-bold"
                      style={{ fontSize: rs(13), color: glass.ink }}
                    >
                      카메라 권한 허용하기
                    </Text>
                  </Glass>
                </Pressable>
              )}
            </View>
          )
        ) : (
          <Image
            source={photoUri ? { uri: photoUri } : undefined}
            style={{ flex: 1 }}
            resizeMode="cover"
          />
        )}

        {phase !== "camera" && (
          <SafeAreaView
            edges={["top"]}
            pointerEvents="box-none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <Glass
              tone={glass.white}
              radius={rs(999)}
              style={{
                marginTop: rs(14),
                paddingLeft: rs(5),
                paddingRight: rs(11),
                paddingVertical: rs(5),
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
                  {phase === "recognizing" ? (
                    <ActivityIndicator size="small" color={glass.ink} />
                  ) : (
                    <Ionicons
                      name={recognizeError ? "alert" : "checkmark"}
                      size={rs(12)}
                      color={glass.ink}
                    />
                  )}
                </Glass>
                <Text
                  className="font-bold"
                  style={{ fontSize: rs(11), color: glass.ink }}
                >
                  {phase === "recognizing"
                    ? "인식 중…"
                    : recognizeError
                      ? "인식 실패"
                      : "인식 완료"}
                </Text>
              </View>
            </Glass>
          </SafeAreaView>
        )}
      </View>

      <View
        style={{
          backgroundColor: glass.card,
          borderTopLeftRadius: rs(20),
          borderTopRightRadius: rs(20),
          marginTop: rs(-16),
          paddingBottom: rs(26),
        }}
      >
        <View
          style={{
            width: rs(36),
            height: rs(4),
            borderRadius: rs(2),
            alignSelf: "center",
            marginTop: rs(10),
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: rs(16),
            paddingTop: rs(12),
            paddingBottom: rs(12),
          }}
        >
          <Text
            className="font-bold"
            style={{ fontSize: rs(15), color: glass.ink }}
          >
            구름 등록
          </Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={rs(20)} color={glass.subMuted} />
          </Pressable>
        </View>

        <Row
          label="이름"
          value={recognized ? `${recognized.name} (${recognized.type})` : ""}
          placeholder={recognizeError ?? "촬영하면 인식돼요"}
          error={!!recognizeError}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: rs(10),
            paddingHorizontal: rs(16),
            paddingVertical: rs(12),
            borderBottomWidth: 1,
            borderBottomColor: glass.border,
          }}
        >
          <Text style={{ color: glass.sub, fontSize: rs(13), width: rs(44) }}>
            기록
          </Text>
          <View style={{ flexDirection: "row", gap: rs(6) }}>
            <MetaChip icon="location" label={placeName ?? "위치 확인 중…"} />
            <MetaChip
              icon="sunny"
              label={todaySky ? `${Math.round(todaySky.temp_c)}°` : "–°"}
            />
          </View>
        </View>

        <View style={{ padding: rs(16) }}>
          <Text style={{ fontSize: rs(13), color: glass.sub }}>한 줄 메모</Text>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="솜사탕 같이 몽글몽글한 아침…"
            placeholderTextColor={glass.subMuted}
            maxLength={30}
            returnKeyType="done"
            style={{
              fontSize: rs(14),
              color: glass.ink,
              marginTop: rs(5),
              padding: 0,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: rs(26),
            paddingTop: rs(14),
            paddingHorizontal: rs(16),
          }}
        >
          <Pressable
            onPress={retake}
            hitSlop={12}
            style={{ paddingVertical: rs(10), paddingHorizontal: rs(6) }}
          >
            <Text
              style={{
                fontSize: rs(14),
                fontWeight: "600",
                color: glass.subMuted,
              }}
            >
              다시
            </Text>
          </Pressable>

          <Pressable
            onPress={pressCenterButton}
            disabled={centerButtonDisabled}
            style={{ opacity: centerButtonDisabled ? 0.4 : 1 }}
          >
            <Glass
              tone={glass.white}
              radius={rs(31)}
              style={{
                width: rs(62),
                height: rs(62),
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: glass.blue.rim,
              }}
            >
              <Glass
                tone={glass.blue}
                radius={rs(23)}
                style={{ width: rs(46), height: rs(46) }}
              />
            </Glass>
          </Pressable>

          <Pressable
            onPress={register}
            disabled={!recognized || registering}
            hitSlop={12}
            style={{
              paddingVertical: rs(10),
              paddingHorizontal: rs(6),
              opacity: recognized && !registering ? 1 : 0.4,
            }}
          >
            <Text
              style={{
                fontSize: rs(14),
                fontWeight: "700",
                color: glass.accent,
              }}
            >
              등록
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MetaChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Glass
      tone={glass.white}
      radius={rs(999)}
      style={{
        paddingLeft: rs(4),
        paddingRight: rs(9),
        paddingVertical: rs(4),
        borderWidth: 1,
        borderColor: glass.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: rs(6) }}>
        <Glass
          tone={glass.gray}
          radius={rs(9)}
          style={{
            width: rs(18),
            height: rs(18),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={rs(11)} color={glass.ink} />
        </Glass>
        <Text
          className="font-bold"
          style={{ fontSize: rs(11), color: glass.ink }}
        >
          {label}
        </Text>
      </View>
    </Glass>
  );
}

function Row({
  label,
  value,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  placeholder?: string;
  error?: boolean;
}) {
  const showPlaceholder = !value && !!placeholder;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: rs(10),
        paddingHorizontal: rs(16),
        paddingVertical: rs(12),
        borderBottomWidth: 1,
        borderBottomColor: glass.border,
      }}
    >
      <Text style={{ color: glass.sub, fontSize: rs(13), width: rs(44) }}>
        {label}
      </Text>
      <Text
        style={{
          flex: 1,
          color: error
            ? "#C0524D"
            : showPlaceholder
              ? glass.subMuted
              : glass.ink,
          fontWeight: showPlaceholder ? "400" : "600",
          fontSize: rs(14),
        }}
      >
        {showPlaceholder ? placeholder : value}
      </Text>
    </View>
  );
}
