import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Glass from '../components/Glass';
import { glass } from '../constants/aquaTheme';
import { captureConsent } from '../constants/consent';
import { rs } from '../constants/scale';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const register = () => {
    if (!captureConsent.granted) {
      router.push('/consent');
      return;
    }
    router.back();
    router.push('/share');
  };

  return (
    <View style={{ flex: 1, backgroundColor: glass.bg }}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {permission?.granted ? (
          <CameraView style={{ flex: 1 }} facing="back" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: rs(13) }}>카메라 권한이 필요해요</Text>
          </View>
        )}

        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' }}>
          <Glass tone={glass.white} radius={rs(999)} style={{ marginTop: rs(20), paddingLeft: rs(5), paddingRight: rs(11), paddingVertical: rs(5) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
              <Glass tone={glass.blue} radius={rs(9)} style={{ width: rs(18), height: rs(18), alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="scan" size={rs(11)} color={glass.ink} />
              </Glass>
              <Text className="font-bold" style={{ fontSize: rs(11), color: glass.ink }}>인식 중…</Text>
            </View>
          </Glass>
        </SafeAreaView>
      </View>

      <View
        style={{
          backgroundColor: glass.card,
          borderTopLeftRadius: rs(20),
          borderTopRightRadius: rs(20),
          marginTop: rs(-16),
          paddingBottom: rs(26),
        }}
      >
        <View style={{ width: rs(36), height: rs(4), borderRadius: rs(2), backgroundColor: glass.border, alignSelf: 'center', marginTop: rs(10) }} />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: rs(16),
            paddingTop: rs(12),
            paddingBottom: rs(12),
            borderBottomWidth: 1,
            borderBottomColor: glass.border,
          }}
        >
          <Text className="font-bold" style={{ fontSize: rs(15), color: glass.ink }}>구름 등록</Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={rs(20)} color={glass.subMuted} />
          </Pressable>
        </View>

        <Row label="이름" value="양떼구름 (권적운)" />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: rs(10),
            paddingHorizontal: rs(16),
            paddingVertical: rs(12),
            borderBottomWidth: 1,
            borderBottomColor: glass.border,
          }}
        >
          <Text style={{ color: glass.sub, fontSize: rs(13), width: rs(44) }}>기록</Text>
          <View style={{ flexDirection: 'row', gap: rs(6) }}>
            <MetaChip icon="location" label="한강공원" />
            <MetaChip icon="sunny" label="22°" />
          </View>
        </View>

        <View style={{ padding: rs(16) }}>
          <Text style={{ fontSize: rs(13), color: glass.sub }}>한 줄 메모</Text>
          <Text style={{ fontSize: rs(14), color: glass.subMuted, marginTop: rs(5) }}>솜사탕 같이 몽글몽글한 아침…</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(26), paddingTop: rs(14), paddingHorizontal: rs(16) }}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ paddingVertical: rs(10), paddingHorizontal: rs(6) }}>
            <Text style={{ fontSize: rs(14), fontWeight: '600', color: glass.subMuted }}>다시</Text>
          </Pressable>

          <Pressable onPress={register}>
            <Glass
              tone={glass.white}
              radius={rs(31)}
              style={{ width: rs(62), height: rs(62), alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: glass.blue.rim }}
            >
              <Glass tone={glass.blue} radius={rs(23)} style={{ width: rs(46), height: rs(46) }} />
            </Glass>
          </Pressable>

          <Pressable onPress={register} hitSlop={12} style={{ paddingVertical: rs(10), paddingHorizontal: rs(6) }}>
            <Text style={{ fontSize: rs(14), fontWeight: '700', color: glass.accent }}>등록</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MetaChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <Glass tone={glass.white} radius={rs(999)} style={{ paddingLeft: rs(4), paddingRight: rs(9), paddingVertical: rs(4), borderWidth: 1, borderColor: glass.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
        <Glass tone={glass.gray} radius={rs(9)} style={{ width: rs(18), height: rs(18), alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={rs(11)} color={glass.ink} />
        </Glass>
        <Text className="font-bold" style={{ fontSize: rs(11), color: glass.ink }}>{label}</Text>
      </View>
    </Glass>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(10),
        paddingHorizontal: rs(16),
        paddingVertical: rs(12),
        borderBottomWidth: 1,
        borderBottomColor: glass.border,
      }}
    >
      <Text style={{ color: glass.sub, fontSize: rs(13), width: rs(44) }}>{label}</Text>
      <Text style={{ color: glass.ink, fontWeight: '600', fontSize: rs(14) }}>{value}</Text>
    </View>
  );
}
