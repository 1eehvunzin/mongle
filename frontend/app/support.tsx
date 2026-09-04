import { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";

// Reachable both as an in-app screen (pushed from profile.tsx's "피드백
// 보내기" row) and, once `npx expo export -p web` deploys, as a public URL
// at mongle.expo.app/support — this is what App Store Connect's "Support
// URL" field should point at. That field previously pointed at /profile,
// which is just the in-app profile screen and has no standalone support
// info for a signed-out visitor, which is exactly what got the app
// rejected under guideline 1.5.
const CONTACT_EMAIL = "monglegroom@gmail.com";

const FAQS: { q: string; a: string }[] = [
  {
    q: "구름 인식이 잘 안 돼요",
    a: "하늘이 최대한 넓게 나오도록, 역광이나 흔들림 없이 촬영하면 인식률이 올라가요. 그래도 결과가 이상하면 아래 문의로 사진과 함께 알려주세요.",
  },
  {
    q: "기록한 구름이나 사진이 사라졌어요",
    a: "로그인 없이 이용 중이었다면 기기에만 저장돼요 — 앱 삭제·재설치나 기기 변경 시 함께 사라질 수 있어요. 로그인 계정으로 남기고 싶다면 나 탭에서 로그인해주세요.",
  },
  {
    q: "위치 권한을 껐는데 계속 물어봐요",
    a: "기기 설정 앱 > 몽글 > 위치에서 권한 상태를 바꿀 수 있어요. 권한이 없어도 구름 기록·인식 자체는 계속 이용할 수 있어요.",
  },
  {
    q: "계정을 삭제하고 싶어요",
    a: "나 탭 > 계정 탈퇴에서 바로 삭제할 수 있어요. 탈퇴 시 서버에 저장된 기록도 함께 삭제돼요.",
  },
];

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

function emailSupport() {
  Linking.openURL(
    "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("몽글 문의"),
  );
}

export default function SupportScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: glass.bg }}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: rs(16),
          paddingTop: rs(4),
          paddingBottom: rs(6),
        }}
      >
        <Pressable
          onPress={goBack}
          style={{ padding: rs(10), marginLeft: -rs(10) }}
        >
          <Ionicons name="chevron-back" size={rs(24)} color={glass.ink} />
        </Pressable>
        <Text
          className="font-bold"
          style={{ fontSize: rs(19), color: glass.ink, letterSpacing: -0.3 }}
        >
          고객 지원
        </Text>
      </View>

      <ScrollView
        style={[
          { flex: 1, minHeight: 0 },
          Platform.OS === "web" ? ({ overflow: "auto" } as any) : null,
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: rs(16),
          paddingBottom: rs(60),
        }}
      >
        <Text
          style={{ fontSize: rs(12.5), color: glass.sub, lineHeight: rs(19) }}
        >
          몽글 이용 중 궁금한 점이나 오류를 아래에서 먼저 확인해보고, 해결되지
          않으면 이메일로 알려주세요.
        </Text>

        <View style={{ marginTop: rs(18), gap: rs(10) }}>
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </View>

        <Pressable onPress={emailSupport} style={{ marginTop: rs(22) }}>
          <Glass
            tone={glass.blue}
            radius={rs(999)}
            style={{
              paddingVertical: rs(14),
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: rs(7),
            }}
          >
            <Ionicons name="mail-outline" size={rs(15)} color={glass.ink} />
            <Text
              className="font-bold"
              style={{ fontSize: rs(13.5), color: glass.ink }}
            >
              이메일로 문의하기
            </Text>
          </Glass>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Glass
      tone={glass.white}
      radius={rs(14)}
      style={{
        borderWidth: 1,
        borderColor: glass.border,
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: rs(14),
        }}
      >
        <Text
          className="font-bold"
          style={{ flex: 1, fontSize: rs(13.5), color: glass.ink }}
        >
          {q}
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={rs(16)}
          color={glass.subMuted}
        />
      </Pressable>
      {open && (
        <Text
          style={{
            fontSize: rs(12),
            color: glass.sub,
            lineHeight: rs(18),
            paddingHorizontal: rs(14),
            paddingBottom: rs(14),
          }}
        >
          {a}
        </Text>
      )}
    </Glass>
  );
}
