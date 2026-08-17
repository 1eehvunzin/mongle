import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Ionicons } from "@expo/vector-icons";
import { rs } from "../constants/scale";
import { AccountOut } from "../lib/api";
import { signInWithApple, signInWithKakao } from "../lib/auth";

// Shared between profile.tsx's account settings and nickname.tsx's
// onboarding step — both just need "render whichever sign-in buttons apply
// and hand back the resulting account" without re-implementing either
// provider's error handling twice.
export default function AuthButtons({
  onSignedIn,
}: {
  onSignedIn: (info: AccountOut) => void;
}) {
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  const handleAppleSignIn = async () => {
    try {
      onSignedIn(await signInWithApple());
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") return;
      Alert.alert("로그인 실패", "Apple 로그인에 실패했어요. 다시 시도해주세요.");
    }
  };

  const handleKakaoSignIn = async () => {
    try {
      onSignedIn(await signInWithKakao());
    } catch (e: any) {
      // The native SDK's own cancel reason reliably includes this word —
      // there's no single stable error code across its iOS/Android bridges.
      if (typeof e?.message === "string" && /cancel/i.test(e.message)) return;
      Alert.alert("로그인 실패", "카카오 로그인에 실패했어요. 다시 시도해주세요.");
    }
  };

  return (
    <View style={{ gap: rs(8) }}>
      {appleAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={rs(12)}
          style={{ width: "100%", height: rs(46) }}
          onPress={handleAppleSignIn}
        />
      ) : null}
      <Pressable
        onPress={handleKakaoSignIn}
        style={{
          height: rs(46),
          borderRadius: rs(12),
          backgroundColor: "#FEE500",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: rs(8),
        }}
      >
        <Ionicons name="chatbubble" size={rs(17)} color="#181600" />
        <Text style={{ fontSize: rs(14), fontWeight: "700", color: "#181600" }}>
          카카오로 로그인
        </Text>
      </Pressable>
    </View>
  );
}
