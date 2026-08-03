import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Glass from '../../components/Glass';
import { glass } from '../../constants/aquaTheme';
import { pins } from '../../constants/mock';
import { rs } from '../../constants/scale';

const PIN_POSITIONS = [
  { top: 70, left: 90 },
  { top: 130, left: 210 },
  { top: 40, left: 250 },
  { top: 190, left: 60 },
];

export default function MapScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: glass.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: rs(16), paddingTop: rs(2), paddingBottom: rs(6) }}>
        <Text className="font-bold" style={{ fontSize: rs(24), color: glass.ink, letterSpacing: -0.3 }}>
          구름 지도
        </Text>
      </View>

      <Glass
        tone={glass.gray}
        radius={rs(20)}
        style={{ marginHorizontal: rs(16), height: rs(230), borderWidth: 1, borderColor: glass.border }}
      >
        {pins.map((p, i) => (
          <View
            key={p.place}
            style={{
              position: 'absolute',
              top: rs(PIN_POSITIONS[i % PIN_POSITIONS.length].top),
              left: rs(PIN_POSITIONS[i % PIN_POSITIONS.length].left),
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: rs(9),
                fontWeight: '700',
                color: glass.ink,
                backgroundColor: 'rgba(255,255,255,0.92)',
                borderRadius: rs(8),
                paddingHorizontal: rs(6),
                paddingVertical: rs(1),
              }}
            >
              {p.place}
            </Text>
            <View
              style={{
                width: rs(13),
                height: rs(13),
                backgroundColor: p.color,
                borderWidth: 2,
                borderColor: '#fff',
                borderRadius: rs(6),
                marginTop: rs(3),
              }}
            />
          </View>
        ))}

        <View style={{ position: 'absolute', bottom: rs(12), right: rs(12) }}>
          <Glass
            tone={glass.white}
            radius={rs(14)}
            style={{
              width: rs(36),
              height: rs(36),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: glass.white.shadow,
              shadowOpacity: 0.3,
              shadowRadius: rs(6),
              shadowOffset: { width: 0, height: rs(2) },
              elevation: 3,
            }}
          >
            <Ionicons name="navigate" size={rs(18)} color={glass.accent} />
          </Glass>
        </View>
      </Glass>

      <Text className="font-semibold" style={{ fontSize: rs(11.5), color: glass.subMuted, marginHorizontal: rs(16), marginTop: rs(16), marginBottom: rs(7) }}>
        내 주변 기록
      </Text>

      <Glass tone={glass.white} radius={rs(18)} style={{ marginHorizontal: rs(16), borderWidth: 1, borderColor: glass.border }}>
        {pins.map((p, i) => (
          <View
            key={p.place}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: rs(12),
              padding: rs(12),
              borderBottomWidth: i === pins.length - 1 ? 0 : 1,
              borderBottomColor: glass.border,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: p.color }} />
            <View style={{ flex: 1 }}>
              <Text className="font-semibold" style={{ fontSize: rs(13), color: glass.ink }}>
                {p.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(3), marginTop: 2 }}>
                <Ionicons name="location" size={rs(10)} color={glass.subMuted} />
                <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>{p.place} · {p.time}</Text>
              </View>
            </View>
            <Text style={{ fontSize: rs(10.5), color: glass.subMuted }}>{p.stars}</Text>
          </View>
        ))}
      </Glass>
    </SafeAreaView>
  );
}
