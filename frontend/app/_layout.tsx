import "../global.css";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import * as Sentry from "@sentry/react-native";
import { ensureSession, session } from "../lib/session";
import { ensureAccount } from "../lib/auth";
import { flushPendingCrash, recordCrash } from "../lib/crashLog";
import { captureConsent } from "../constants/consent";
import { onboardingState } from "../constants/onboarding";

// The production iOS build has been aborting within a few seconds of launch
// since build 10, from a native ObjC exception (a TurboModule void method
// invocation) that never reaches JS — the ErrorUtils handler below can't see
// it, and the raw device crash logs don't carry the exception's reason or
// original stack either. Sentry's native iOS SDK hooks the same
// NSException path lib/crashLog.ts can't reach, so its report should
// finally show which native module is actually throwing.
const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0,
  });
}

// Installed at module scope (not inside the component) so it's active as
// early as possible — see lib/crashLog.ts for why this exists.
const globalAny = global as any;
const defaultErrorHandler = globalAny.ErrorUtils?.getGlobalHandler?.();
globalAny.ErrorUtils?.setGlobalHandler?.((error: unknown, isFatal?: boolean) => {
  recordCrash(error, !!isFatal).finally(() => {
    defaultErrorHandler?.(error, isFatal);
  });
});

function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.otf"),
    Cloudsofa: require("../assets/fonts/Cloudsofa_namgim-Regular.ttf"),
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
    ensureAccount().catch(() => {
      // best-effort — screens fall back to signed-out state.
    });
    if (__DEV__) {
      import("../lib/devSeed").then(({ seedDevCatchesOnce }) => {
        seedDevCatchesOnce().catch(() => {
          // best-effort dev-only seed — never block app startup.
        });
      });
    }
    flushPendingCrash();
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
        <Stack.Screen
          name="login-onboarding"
          options={{ presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen name="share" />
      </Stack>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
