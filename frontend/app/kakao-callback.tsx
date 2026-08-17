import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MongleMascot from "../components/MongleMascot";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { completeKakaoWebSignIn } from "../lib/auth";

// The redirect_uri registered in Kakao Developers (see
// EXPO_PUBLIC_KAKAO_REDIRECT_URI / server's KAKAO_REDIRECT_URI) points
// here — web-only, since native Kakao login never leaves the app. Not a
// modal like login-onboarding.tsx: this is a real page reached by the
// browser navigating away and back, so it needs to stand on its own.
export default function KakaoCallbackScreen() {
  const { code, error: kakaoError } = useLocalSearchParams<{
    code?: string;
    error?: string;
  }>();
  const [status, setStatus] = useState<"working" | "error">("working");

  useEffect(() => {
    if (kakaoError) {
      // User cancelled on Kakao's own consent screen — not a real error.
      router.replace("/home");
      return;
    }
    if (!code) {
      setStatus("error");
      return;
    }
    completeKakaoWebSignIn(code)
      .then(() => router.replace("/home"))
      .catch(() => setStatus("error"));
  }, [code, kakaoError]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: glass.bg }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: rs(20) }}>
        <Glass tone={glass.white} radius={rs(24)} style={{ padding: rs(24), alignItems: "center", width: "100%", maxWidth: rs(320) }}>
          <MongleMascot size={52} bob duration={3400} />
          {status === "working" ? (
            <>
              <ActivityIndicator size="small" color={glass.ink} style={{ marginTop: rs(16) }} />
              <Text style={{ fontSize: rs(12.5), color: glass.sub, marginTop: rs(10) }}>
                로그인하는 중이에요…
              </Text>
            </>
          ) : (
            <>
              <Text
                className="font-bold"
                style={{ fontSize: rs(15), color: glass.ink, marginTop: rs(16), textAlign: "center" }}
              >
                로그인에 실패했어요
              </Text>
              <Pressable onPress={() => router.replace("/home")} style={{ marginTop: rs(14) }}>
                <Glass tone={glass.blue} radius={rs(999)} style={{ paddingVertical: rs(12), paddingHorizontal: rs(24) }}>
                  <Text className="font-bold" style={{ fontSize: rs(13), color: glass.ink }}>
                    홈으로 돌아가기
                  </Text>
                </Glass>
              </Pressable>
            </>
          )}
        </Glass>
      </View>
    </SafeAreaView>
  );
}
