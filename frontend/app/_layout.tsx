import "../global.css";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { ensureSession, session } from "../lib/session";
import { captureConsent } from "../constants/consent";
import { onboardingState } from "../constants/onboarding";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.otf"),
  });

  // One-time device-identity bootstrap: upserts the anonymous device_id with
  // the backend, then mirrors what the server already knows about this
  // device onto the two session-scoped flags nickname.tsx/consent.tsx read —
  // so a returning device isn't re-prompted every reload.
  useEffect(() => {
    ensureSession()
      .then(() => {
        captureConsent.granted = session.consentGranted;
        onboardingState.nicknameSet = !!session.nickname;
      })
      .catch(() => {
        // backend unreachable — screens fall back to session-only gating.
      });
  }, []);

  if (!fontsLoaded) {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="capture" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="consent"
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen
          name="nickname"
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen name="share" />
      </Stack>
    </SafeAreaProvider>
  );
}
