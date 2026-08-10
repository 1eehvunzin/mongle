import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import MongleMascot from "../components/MongleMascot";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { onboardingState } from "../constants/onboarding";
import { rs } from "../constants/scale";
import { setNickname as saveNickname } from "../lib/localStore";
import { session } from "../lib/session";

const MAX_LEN = 12;

// A modal over the home screen (same dimmed-backdrop + floating-card shape
// consent.tsx uses) rather than a standalone onboarding page — home renders
// underneath from the very first frame instead of a blank page first.
export default function NicknameScreen() {
  const [nickname, setNickname] = useState("구름지기");
  const disabled = nickname.trim().length < 2;

  const start = () => {
    onboardingState.nicknameSet = true;
    router.back();
    const trimmed = nickname.trim();
    session.nickname = trimmed;
    saveNickname(trimmed).catch(() => {
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
        onPress={start}
      />

      <View
        pointerEvents="box-none"
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: rs(20) }}
      >
        <Glass tone={glass.white} radius={rs(24)} style={{ padding: rs(20) }}>
          <MongleMascot
            size={58}
            bob
            duration={3400}
            style={{ alignSelf: "center" }}
          />
          <Text
            className="font-bold"
            style={{
              fontSize: rs(18),
              color: glass.ink,
              textAlign: "center",
              marginTop: rs(14),
            }}
          >
            어떻게 불러드릴까요?
          </Text>
          <Text
            style={{
              fontSize: rs(12.5),
              color: glass.sub,
              textAlign: "center",
              marginTop: rs(4),
            }}
          >
            몽글이가 부를 이름을 알려주세요
          </Text>

          {/* Just a text field — a rounded input bar with the counter tucked
              at its trailing edge, the way an actual iOS text field reads,
              not a labeled "NICKNAME" form card. */}
          <View style={{ marginTop: rs(20) }}>
            <Glass
              tone={glass.white}
              radius={rs(999)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: rs(18),
                paddingRight: rs(14),
                paddingVertical: rs(13),
                borderWidth: 1.5,
                borderColor: glass.border,
              }}
            >
              <TextInput
                value={nickname}
                onChangeText={(t) => setNickname(t.slice(0, MAX_LEN))}
                maxLength={MAX_LEN}
                className="font-bold"
                style={{
                  flex: 1,
                  fontSize: rs(16),
                  color: glass.ink,
                  padding: 0,
                }}
                placeholder="닉네임"
                placeholderTextColor={glass.subMuted}
              />
              <Text style={{ fontSize: rs(11), color: glass.subMuted }}>
                {nickname.length}/{MAX_LEN}
              </Text>
            </Glass>
            <Text
              style={{
                fontSize: rs(11),
                color: glass.subMuted,
                marginTop: rs(8),
                marginLeft: rs(6),
              }}
            >
              한글·영문·숫자 2~12자
            </Text>
          </View>

          <Pressable
            onPress={start}
            disabled={disabled}
            style={{ marginTop: rs(18) }}
          >
            <Glass
              tone={glass.blue}
              radius={rs(999)}
              style={{
                paddingVertical: rs(15),
                alignItems: "center",
                opacity: disabled ? 0.45 : 1,
              }}
            >
              <Text
                className="font-bold"
                style={{ fontSize: rs(15), color: glass.ink }}
              >
                시작하기
              </Text>
            </Glass>
          </Pressable>
        </Glass>
      </View>
    </View>
  );
}
