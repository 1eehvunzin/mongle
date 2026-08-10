import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import Glass from "../components/Glass";
import MongleMascot from "../components/MongleMascot";
import { glass } from "../constants/aquaTheme";
import { captureConsent } from "../constants/consent";
import { rs } from "../constants/scale";
import { setConsent } from "../lib/localStore";
import { session } from "../lib/session";

// A real modal — dimmed backdrop + a floating card — not a full page that
// happens to slide in. Same shape the old "discovery" popup used.
export default function ConsentScreen() {
  // Consent gates the shutter itself (the photo is what gets sent off for
  // recognition), so accepting just returns to the camera — no photo or
  // result exists yet at this point, so there's nothing to hand to /share.
  const accept = () => {
    captureConsent.granted = true;
    router.back();
    session.consentGranted = true;
    setConsent(true).catch(() => {
      // best-effort — the session flag above already lets this session
      // move on.
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(28,32,30,0.5)",
        }}
        onPress={() => router.back()}
      />

      <View
        pointerEvents="box-none"
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: rs(20) }}
      >
        <Glass tone={glass.white} radius={rs(24)} style={{ padding: rs(20) }}>
          <MongleMascot size={64} style={{ alignSelf: "center" }} />
          <Text
            className="font-bold"
            style={{
              fontSize: rs(18),
              color: glass.ink,
              textAlign: "center",
              marginTop: rs(14),
            }}
          >
            사진은 서버로 전송돼요
          </Text>
          <Text
            style={{
              fontSize: rs(12.5),
              color: glass.sub,
              textAlign: "center",
              marginTop: rs(6),
              lineHeight: rs(18),
            }}
          >
            구름 종류를 인식하기 위해 촬영한 사진만{"\n"}서버로 보내 분석해요.
          </Text>

          {/* A plain list, not three repeated icon-badge cards — closer to
              how an actual iOS permission screen reads a checklist. */}
          <View style={{ marginTop: rs(16), gap: rs(7) }}>
            <ConsentPoint text="사진은 구름 인식 용도로만 사용돼요" />
            <ConsentPoint text="위치·시간 정보는 서버로 보내지 않아요" />
            <ConsentPoint text="분석 결과는 내 도감에 기록돼요" />
          </View>

          <Pressable onPress={accept} style={{ marginTop: rs(18) }}>
            <Glass
              tone={glass.blue}
              radius={rs(999)}
              style={{ paddingVertical: rs(14), alignItems: "center" }}
            >
              <Text
                className="font-bold"
                style={{ fontSize: rs(14), color: glass.ink }}
              >
                동의하고 계속하기
              </Text>
            </Glass>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={{ paddingVertical: rs(11), alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: rs(12.5),
                fontWeight: "600",
                color: glass.subMuted,
              }}
            >
              다음에 할게요
            </Text>
          </Pressable>
        </Glass>
      </View>
    </View>
  );
}

function ConsentPoint({ text }: { text: string }) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "flex-start", gap: rs(8) }}
    >
      <View
        style={{
          width: rs(4),
          height: rs(4),
          borderRadius: rs(2),
          backgroundColor: glass.subMuted,
          marginTop: rs(7),
        }}
      />
      <Text
        style={{
          flex: 1,
          fontSize: rs(12.5),
          color: glass.sub,
          lineHeight: rs(18),
        }}
      >
        {text}
      </Text>
    </View>
  );
}
