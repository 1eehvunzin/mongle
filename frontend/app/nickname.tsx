import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MongleMascot from "../components/MongleMascot";
import Glass from "../components/Glass";
import { glass } from "../constants/aquaTheme";
import { onboardingState } from "../constants/onboarding";
import { rs } from "../constants/scale";
import { getNickname, setNickname as saveNickname } from "../lib/localStore";
import { session } from "../lib/session";

const MAX_LEN = 12;

// A modal over the home screen (same dimmed-backdrop + floating-card shape
// consent.tsx uses) rather than a standalone onboarding page — home renders
// underneath from the very first frame instead of a blank page first.
//
// Only ever reached *after* login-onboarding.tsx has already had its turn
// (skipped, or signed into an account that still has no nickname) — see
// home.tsx's boot check — so there's nothing left to chain into here.
export default function NicknameScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const editing = mode === "edit";
  const [nickname, setNickname] = useState("구름지기");
  const [saving, setSaving] = useState(false);
  const disabled = nickname.trim().length < 2 || saving;

  useEffect(() => {
    if (!editing) return;
    getNickname().then((current) => {
      if (current) setNickname(current);
    });
  }, [editing]);

  // Waits for the save (local mirror + server, if signed in) to actually
  // land before closing — this used to fire the first-time save-and-close
  // without awaiting it, so a slow/failed network call quietly left the
  // account's server-side nickname empty and the modal reappeared on every
  // later launch even though the user had already "finished" onboarding.
  const start = async () => {
    const trimmed = nickname.trim();
    setSaving(true);
    try {
      await saveNickname(trimmed);
    } catch {
      setSaving(false);
      const message = "닉네임 저장에 실패했어요. 다시 시도해주세요.";
      if (Platform.OS === "web") {
        (globalThis as any).window?.alert(message);
      } else {
        Alert.alert("저장 실패", message);
      }
      return;
    }
    if (!editing) {
      onboardingState.nicknameSet = true;
      session.nickname = trimmed;
    }
    setSaving(false);
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
        onPress={editing ? () => router.back() : start}
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
            {editing ? "닉네임을 수정할까요?" : "어떻게 불러드릴까요?"}
          </Text>
          <Text
            style={{
              fontSize: rs(12.5),
              color: glass.sub,
              textAlign: "center",
              marginTop: rs(4),
            }}
          >
            {editing
              ? "새로운 닉네임을 입력해주세요"
              : "몽글이가 부를 이름을 알려주세요"}
          </Text>

          {/* Just a text field — a rounded input bar with the counter tucked
              at its trailing edge, the way an actual iOS text field reads,
              not a labeled "NICKNAME" form card. */}
          <View style={{ marginTop: rs(20) }}>
            <View
              style={{
                borderRadius: rs(999),
                backgroundColor: "rgba(255,255,255,0.96)",
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
                style={{
                  flex: 1,
                  fontSize: rs(16),
                  fontWeight: "700",
                  fontFamily: "Pretendard-Bold",
                  color: glass.ink,
                  padding: 0,
                }}
                selectionColor={glass.accent}
                placeholder="닉네임"
                placeholderTextColor={glass.subMuted}
              />
              <Text style={{ fontSize: rs(11), color: glass.subMuted }}>
                {nickname.length}/{MAX_LEN}
              </Text>
            </View>
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
                {saving ? "저장 중…" : editing ? "저장하기" : "시작하기"}
              </Text>
            </Glass>
          </Pressable>
        </Glass>
      </View>
    </View>
  );
}
