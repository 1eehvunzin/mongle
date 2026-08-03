import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MongleMascot from '../../components/MongleMascot';
import Glass from '../../components/Glass';
import { glass } from '../../constants/aquaTheme';
import { rs } from '../../constants/scale';

const MAX_LEN = 12;

export default function NicknameScreen() {
  const [nickname, setNickname] = useState('구름지기');
  const disabled = nickname.trim().length < 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: glass.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, paddingHorizontal: rs(20), paddingTop: rs(28), paddingBottom: rs(24) }}>
        {/* The mascot "asks" the question via a speech bubble — the same
            device the home hero uses — instead of a generic centered
            avatar-then-headline stack. */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: rs(12) }}>
          <View style={{ width: rs(68), height: rs(68), alignItems: 'center', justifyContent: 'center' }}>
            <MongleMascot size={58} bob duration={3400} />
          </View>

          <View style={{ flex: 1, marginTop: rs(14) }}>
            {/* Tail points left at the avatar — absolutely anchored to the
                bubble's own left edge, not stacked above it (that read as
                a stray floating triangle, not a pointer). */}
            <View
              style={{
                position: 'absolute',
                left: -rs(6),
                top: rs(14),
                width: 0,
                height: 0,
                borderTopWidth: rs(6),
                borderBottomWidth: rs(6),
                borderRightWidth: rs(7),
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                borderRightColor: glass.white.top,
                zIndex: 1,
              }}
            />
            <Glass tone={glass.white} radius={rs(16)} style={{ padding: rs(14), borderWidth: 1, borderColor: glass.border }}>
              <Text className="font-bold" style={{ fontSize: rs(19), color: glass.ink, letterSpacing: -0.3, lineHeight: rs(25) }}>
                어떻게 불러드릴까요?
              </Text>
              <Text style={{ fontSize: rs(12), color: glass.sub, marginTop: rs(4) }}>
                몽글이가 부를 이름을 알려주세요
              </Text>
            </Glass>
          </View>
        </View>

        {/* Just a text field — a rounded input bar with the counter tucked
            at its trailing edge, the way an actual iOS text field reads,
            not a labeled "NICKNAME" form card. */}
        <View style={{ marginTop: rs(28) }}>
          <Glass tone={glass.white} radius={rs(999)} style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: rs(18), paddingRight: rs(14), paddingVertical: rs(13), borderWidth: 1.5, borderColor: glass.border }}>
            <TextInput
              value={nickname}
              onChangeText={(t) => setNickname(t.slice(0, MAX_LEN))}
              maxLength={MAX_LEN}
              className="font-bold"
              style={{ flex: 1, fontSize: rs(16), color: glass.ink, padding: 0 }}
              placeholder="닉네임"
              placeholderTextColor={glass.subMuted}
            />
            <Text style={{ fontSize: rs(11), color: glass.subMuted }}>{nickname.length}/{MAX_LEN}</Text>
          </Glass>
          <Text style={{ fontSize: rs(11), color: glass.subMuted, marginTop: rs(8), marginLeft: rs(6) }}>한글·영문·숫자 2~12자</Text>
        </View>

        <View style={{ marginTop: 'auto' }}>
          <Pressable onPress={() => router.replace('/home')} disabled={disabled}>
            <Glass tone={glass.blue} radius={rs(999)} style={{ paddingVertical: rs(15), alignItems: 'center', opacity: disabled ? 0.45 : 1 }}>
              <Text className="font-bold" style={{ fontSize: rs(15), color: glass.ink }}>시작하기</Text>
            </Glass>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
