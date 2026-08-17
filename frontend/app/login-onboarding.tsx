import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import MongleMascot from "../components/MongleMascot";
import Glass from "../components/Glass";
import AuthButtons from "../components/AuthButtons";
import { glass } from "../constants/aquaTheme";
import { rs } from "../constants/scale";
import { setLoginOnboardingSeen } from "../lib/localStore";

// A dedicated onboarding step, not a section tacked onto nickname.tsx's
// card — reached either right after it (nickname.tsx chains here once the
// nickname is confirmed) or on its own for a returning device that already
// has a nickname but has never seen this step (see home.tsx's boot check
// and lib/localStore.ts's getLoginOnboardingSeen). Same dimmed-backdrop +
// floating-card shape as nickname.tsx/consent.tsx.
export default function LoginOnboardingScreen() {
  const dismiss = () => {
    setLoginOnboardingSeen().catch(() => {
      // best-effort — worst case this step offers itself again next launch.
    });
    router.back();
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
        onPress={dismiss}
      />

      <View
        pointerEvents="box-none"
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: rs(20) }}
      >
        <Glass tone={glass.white} radius={rs(24)} style={{ padding: rs(20) }}>
          <MongleMascot size={58} bob duration={3400} style={{ alignSelf: "center" }} />
          <Text
            className="font-bold"
            style={{
              fontSize: rs(18),
              color: glass.ink,
              textAlign: "center",
              marginTop: rs(14),
            }}
          >
            기록을 안전하게 보관해요
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
            로그인하면 포착한 구름이 계정에 저장돼서{"\n"}기기를 바꿔도 도감을 그대로 이어볼 수 있어요
          </Text>

          <View style={{ marginTop: rs(20) }}>
            <AuthButtons onSignedIn={dismiss} />
          </View>

          <Pressable onPress={dismiss} style={{ paddingVertical: rs(14), alignItems: "center" }}>
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
