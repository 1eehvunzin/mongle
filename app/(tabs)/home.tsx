import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import MongleMascot from '../../components/MongleMascot';
import HeroBlobs from '../../components/HeroBlobs';
import Glass from '../../components/Glass';
import { glass } from '../../constants/aquaTheme';
import { rs } from '../../constants/scale';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

type ConditionKey = '맑음' | '구름조금' | '흐림' | '비' | '노을';

const CONDITIONS: Record<ConditionKey, { icon: keyof typeof Ionicons.glyphMap; tempRange: [number, number]; cloud: string }> = {
  맑음: { icon: 'sunny-outline', tempRange: [21, 28], cloud: '뭉게구름' },
  구름조금: { icon: 'partly-sunny-outline', tempRange: [18, 24], cloud: '양떼구름' },
  흐림: { icon: 'cloud-outline', tempRange: [16, 21], cloud: '안개구름' },
  비: { icon: 'rainy-outline', tempRange: [14, 19], cloud: '먹구름' },
  노을: { icon: 'partly-sunny-outline', tempRange: [17, 23], cloud: '새털구름' },
};

const CONDITION_KEYS = Object.keys(CONDITIONS) as ConditionKey[];

// Weather condition → desaturated glass tone (function preserved from the
// old weatherGradients, saturation pulled way down per direction feedback).
const SKY_GLASS: Record<ConditionKey, { top: string; mid: string; rim: string; shadow: string }> = {
  맑음: { top: '#D2E9F1', mid: '#93C4D6', rim: '#4C8199', shadow: '#5D96AC' },
  구름조금: { top: '#DBE0EF', mid: '#AFB7D8', rim: '#6B74A0', shadow: '#7680AC' },
  흐림: { top: '#E6E6E2', mid: '#C6C6BD', rim: '#8F8F83', shadow: '#98988C' },
  비: { top: '#CCDDE0', mid: '#8FAEB3', rim: '#557D80', shadow: '#5C8689' },
  노을: { top: '#F4D6CC', mid: '#E3A794', rim: '#BC6B54', shadow: '#CB8064' },
};

function formatTodayCaption(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

function formatTime(date: Date) {
  const hours = date.getHours();
  const period = hours < 12 ? '오전' : '오후';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${period} ${displayHour}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function randomTemp([min, max]: [number, number]) {
  return Math.round(min + Math.random() * (max - min));
}

const recentCatches = [
  { name: '뭉게구름', tint: glass.white },
  { name: '양떼구름', tint: glass.blue },
  { name: '새털구름', tint: glass.gray },
];

export default function HomeScreen() {
  const [condition, setCondition] = useState<ConditionKey>('맑음');
  const [temp, setTemp] = useState(22);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const spin = useSharedValue(0);

  const sky = SKY_GLASS[condition];
  const meta = CONDITIONS[condition];

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  function refreshWeather() {
    if (refreshing) return;
    setRefreshing(true);
    spin.value = 0;
    spin.value = withTiming(1, { duration: 650, easing: Easing.inOut(Easing.ease) });

    setTimeout(() => {
      const others = CONDITION_KEYS.filter((k) => k !== condition);
      const next = others[Math.floor(Math.random() * others.length)];
      setCondition(next);
      setTemp(randomTemp(CONDITIONS[next].tempRange));
      setUpdatedAt(new Date());
      setRefreshing(false);
    }, 650);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: glass.bg }} edges={['top']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rs(108) }}>
        <View style={{ paddingHorizontal: rs(16), paddingTop: rs(4), paddingBottom: rs(10) }}>
          <Text className="font-semibold" style={{ fontSize: rs(12.5), color: glass.sub }}>
            {formatTodayCaption(updatedAt)}
          </Text>
          <Text className="font-bold" style={{ fontSize: rs(25), color: glass.ink, letterSpacing: -0.3, marginTop: 1 }}>
            오늘의 하늘
          </Text>
        </View>

        <View style={{ marginHorizontal: rs(16), marginBottom: rs(22) }}>
          <Glass
            tone={sky}
            radius={rs(24)}
            style={{ padding: rs(14), gap: rs(9), ...glassShadow(sky.shadow) }}
          >
            <HeroBlobs />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Glass tone={glass.white} radius={rs(999)} style={{ paddingHorizontal: rs(11), paddingVertical: rs(6) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
                  <Ionicons name={meta.icon} size={rs(13)} color={glass.ink} />
                  <Text className="font-bold" style={{ fontSize: rs(11), color: glass.ink }}>{condition} · 한강공원</Text>
                </View>
              </Glass>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8) }}>
                <Text style={{ fontSize: rs(11), color: 'rgba(60,68,64,0.6)' }}>{formatTime(updatedAt)} 기준</Text>
                <Pressable onPress={refreshWeather} hitSlop={10} disabled={refreshing}>
                  <Glass tone={glass.white} radius={rs(13)} style={{ width: rs(26), height: rs(26), alignItems: 'center', justifyContent: 'center' }}>
                    <Animated.View style={spinStyle}>
                      <Ionicons name="refresh" size={rs(13)} color={glass.ink} />
                    </Animated.View>
                  </Glass>
                </Pressable>
              </View>
            </View>

            {/* The scene, composed rather than stacked: temp + stats anchor
                the left column (Apple-Weather-style — big number, quiet
                metadata lines beneath), the mascot stands in its own space
                on the right instead of fighting the temp for center stage. */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text className="font-bold" style={{ fontSize: rs(36), color: glass.ink, letterSpacing: -1 }}>{temp}°</Text>
                {/* Level + streak, a divided pair, sized down to keep the
                    whole card landscape rather than stacking tall. */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: rs(6) }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(4) }}>
                      <Ionicons name="sparkles" size={rs(10)} color={glass.accent} />
                      <Text className="font-semibold" style={{ fontSize: rs(10), color: glass.ink }}>Lv.4</Text>
                    </View>
                    <View style={{ marginTop: rs(4), height: rs(3), width: rs(40), borderRadius: rs(1.5), backgroundColor: 'rgba(60,68,64,0.15)', overflow: 'hidden' }}>
                      <View style={{ width: '64%', height: '100%', backgroundColor: glass.accent, borderRadius: rs(1.5) }} />
                    </View>
                  </View>

                  <View style={{ width: 1, height: rs(22), backgroundColor: 'rgba(60,68,64,0.15)', marginHorizontal: rs(12) }} />

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(4) }}>
                    <Ionicons name="flame" size={rs(10)} color={glass.accent} />
                    <Text className="font-semibold" style={{ fontSize: rs(10), color: glass.ink }}>7일째 연속</Text>
                  </View>
                </View>
              </View>

              <View style={{ width: rs(64), alignItems: 'center' }}>
                <MongleMascot size={64} bob duration={3200} />
              </View>
            </View>

            <Pressable onPress={() => router.push('/capture')}>
              {/* Speech-bubble shape, tail pointing up at the mascot's spot. */}
              <View style={{ alignItems: 'flex-end', paddingRight: rs(22) }}>
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: rs(6),
                    borderRightWidth: rs(6),
                    borderBottomWidth: rs(7),
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: glass.white.top,
                  }}
                />
              </View>
              <Glass tone={glass.white} radius={rs(16)} style={{ paddingVertical: rs(10), paddingHorizontal: rs(14) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(9) }}>
                  <Text style={{ fontSize: rs(11.5), color: glass.ink, lineHeight: rs(16), flex: 1 }}>
                    오늘은 <Text className="font-bold">{meta.cloud}</Text>이 잘 보이는 날! 찍어서 채워볼까?
                  </Text>
                  <Ionicons name="camera" size={rs(16)} color={glass.ink} />
                </View>
              </Glass>
            </Pressable>
          </Glass>
        </View>

        <View style={{ paddingHorizontal: rs(16), marginTop: rs(10), marginBottom: rs(11) }}>
          <Text className="font-bold" style={{ fontSize: rs(14.5), color: glass.ink }}>
            최근 포착
          </Text>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: rs(16), gap: rs(8) }}>
          {recentCatches.map((item) => (
            <Pressable key={item.name} onPress={() => router.push('/share')} style={{ flex: 1, alignItems: 'center' }}>
              {/* Porthole thumbnail — a circular glass lens, the click-wheel
                  chrome cue carried onto a piece of real content. */}
              <Glass tone={item.tint} radius={rs(33)} style={{ width: rs(64), height: rs(64), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: rs(22), opacity: 0.75 }}>☁️</Text>
              </Glass>
              <Text className="font-semibold" style={{ fontSize: rs(9.5), color: glass.ink, marginTop: rs(8) }} numberOfLines={1}>
                {item.name}
              </Text>
            </Pressable>
          ))}

          <Link href="/feed" asChild>
            <Pressable style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: rs(4) }}>
              <View
                style={{
                  width: rs(64),
                  height: rs(64),
                  borderRadius: rs(33),
                  borderWidth: 1,
                  borderColor: glass.border,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="arrow-forward" size={rs(16)} color={glass.subMuted} />
              </View>
              <Text style={{ fontSize: rs(9.5), color: glass.subMuted }}>전체</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function glassShadow(color: string) {
  return {
    shadowColor: color,
    shadowOpacity: 0.28,
    shadowRadius: rs(16),
    shadowOffset: { width: 0, height: rs(6) },
    elevation: 4,
  };
}
