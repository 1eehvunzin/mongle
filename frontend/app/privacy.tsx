import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";

// Reachable both as an in-app screen (pushed from login-onboarding.tsx /
// profile.tsx) and, once `npx expo export -p web` deploys, as a public URL
// at mongle.expo.app/privacy — the same one App Store Connect's "Privacy
// Policy URL" field points at, so the back button always needs somewhere
// to go even when there's no push history to pop (a cold visit to the
// standalone URL) — falls back to home instead of hiding itself.
const CONTACT_EMAIL = "monglegroom@gmail.com";
const EFFECTIVE_DATE = "2026년 8월 17일";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. 수집하는 개인정보 항목",
    body:
      "Apple 또는 카카오로 로그인할 때: 계정 식별자, 이메일(제공에 동의한 경우)\n" +
      "서비스 이용 중: 닉네임, 촬영한 구름 사진, 구름을 지도에 기록할 때의 위치정보(위도·경도), 메모, 관측 시각\n" +
      "로그인하지 않고 이용하는 경우 위 정보는 서버로 전송되지 않고 기기에만 저장돼요.",
  },
  {
    title: "2. 개인정보 수집 방법",
    body: "Apple·카카오 소셜 로그인 과정에서 자동으로 전달받거나, 이용자가 사진을 촬영하고 구름을 등록할 때 직접 입력·수집해요.",
  },
  {
    title: "3. 개인정보의 수집 및 이용 목적",
    body:
      "· 회원 식별 및 로그인 유지\n" +
      "· 촬영한 사진을 분석해 구름 종류를 인식(AI 이미지 인식)\n" +
      "· 구름 도감·지도 등 서비스 기능 제공\n" +
      "· 문의 응대 및 서비스 개선",
  },
  {
    title: "4. 개인정보의 제3자 제공 및 처리위탁",
    body:
      "서비스는 아래 업체에 개인정보 처리를 위탁하거나 정보를 제공해요.\n" +
      "· Apple Inc. / 카카오: 소셜 로그인 인증\n" +
      "· OpenAI: 촬영한 사진의 구름 종류 인식을 위한 이미지 분석 (사진이 인식 목적으로 전송돼요)",
  },
  {
    title: "5. 개인정보의 보유 및 이용 기간",
    body:
      "회원 탈퇴 시 계정 정보 및 이와 연동된 구름 기록은 지체 없이 삭제돼요. 관련 법령에 따라 보관 의무가 있는 경우는 예외로 해당 기간 동안 보관해요. 로그인하지 않고 이용한 정보는 기기에만 저장되며, 앱을 삭제하면 함께 삭제돼요.",
  },
  {
    title: "6. 이용자의 권리",
    body:
      '이용자는 언제든지 자신의 개인정보를 열람·정정·삭제하거나 처리 정지를 요청할 수 있어요. 앱 내 "나 > 계정 탈퇴"로 직접 삭제하거나, 아래 문의처로 연락하면 도와드려요.',
  },
  {
    title: "7. 아동의 개인정보",
    body: "서비스는 만 14세 미만 아동을 주 이용 대상으로 하지 않으며, 만 14세 미만 아동의 개인정보를 고의로 수집하지 않아요.",
  },
  {
    title: "8. 문의처",
    body: `개인정보 관련 문의는 아래 이메일로 연락해주세요.\n${CONTACT_EMAIL}`,
  },
  {
    title: "9. 고지의 의무",
    body: "이 개인정보 처리방침은 관련 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가·삭제·수정될 수 있으며, 변경 시 서비스 내 공지를 통해 안내해요.",
  },
];

// Same treatment as share.tsx's back chevron (size, padding-based hit
// area) — the only other back button in the app, so this is what "back
// button" means here rather than inventing a second style for it.
function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: glass.bg }} edges={["top"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: rs(16),
          paddingTop: rs(4),
          paddingBottom: rs(6),
        }}
      >
        <Pressable onPress={goBack} style={{ padding: rs(10), marginLeft: -rs(10) }}>
          <Ionicons name="chevron-back" size={rs(24)} color={glass.ink} />
        </Pressable>
        <Text className="font-bold" style={{ fontSize: rs(19), color: glass.ink, letterSpacing: -0.3 }}>
          개인정보 처리방침
        </Text>
      </View>

      <ScrollView
        style={[{ flex: 1, minHeight: 0 }, Platform.OS === "web" ? ({ overflow: "auto" } as any) : null]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: rs(16), paddingBottom: rs(60) }}
      >
        <Text style={{ fontSize: rs(12.5), color: glass.sub, lineHeight: rs(19) }}>
          몽글(이하 "서비스")은 이용자의 개인정보를 소중히 다루며, 「개인정보보호법」 등 관련 법령을 준수하기 위해 다음과 같이 개인정보 처리방침을 안내해요.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginTop: rs(20), gap: rs(6) }}>
            <Text className="font-bold" style={{ fontSize: rs(14.5), color: glass.ink }}>
              {section.title}
            </Text>
            <Text style={{ fontSize: rs(12.5), color: glass.sub, lineHeight: rs(19) }}>{section.body}</Text>
          </View>
        ))}

        <Text style={{ fontSize: rs(11.5), color: glass.subMuted, marginTop: rs(24) }}>
          시행일: {EFFECTIVE_DATE}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
