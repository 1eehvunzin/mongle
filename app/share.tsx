import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MongleMascot from '../components/MongleMascot';
import Glass from '../components/Glass';
import { glass } from '../constants/aquaTheme';
import { rs } from '../constants/scale';

// Everything below the card: back-button row, the two-up action row, and
// the CTA pill, plus their gaps — reserved so the card's own height never
// pushes "스토리 공유하기" off-screen.
const CHROME_HEIGHT = rs(196);

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const availableHeight = screenH - insets.top - insets.bottom - CHROME_HEIGHT;
  const widthFromHeight = availableHeight * (9 / 16);
  const horizontalCap = screenW - rs(32);
  const cardWidth = Math.max(rs(150), Math.min(horizontalCap, widthFromHeight));

  return (
    <SafeAreaView style={{ flex: 1, minHeight: 0, backgroundColor: glass.bg }} edges={['top', 'bottom']}>
      <Pressable onPress={() => router.back()} style={{ padding: rs(10), paddingLeft: rs(6), alignSelf: 'flex-start' }}>
        <Ionicons name="chevron-back" size={rs(24)} color={glass.ink} />
      </Pressable>

      <View style={{ marginHorizontal: rs(16), marginTop: rs(2) }}>
        <ImageBackground
          source={require('../assets/ref/구름 (2).jpg')}
          style={{
            width: cardWidth,
            alignSelf: 'center',
            aspectRatio: 9 / 16,
            borderRadius: rs(22),
            overflow: 'hidden',
            shadowColor: glass.blue.shadow,
            shadowOpacity: 0.3,
            shadowRadius: rs(16),
            shadowOffset: { width: 0, height: rs(6) },
            elevation: 4,
          }}
        >
          <LinearGradient pointerEvents="none" colors={['rgba(20,30,36,0.05)', 'rgba(20,30,36,0.55)']} style={StyleSheet.absoluteFill} />

          <View style={{ position: 'absolute', top: rs(13), left: rs(13) }}>
            <Glass tone={glass.white} radius={rs(999)} style={{ paddingHorizontal: rs(7), paddingVertical: rs(3) }}>
              <Text className="font-semibold" style={{ fontSize: rs(9), color: glass.ink }}>No.003</Text>
            </Glass>
          </View>
          <View style={{ position: 'absolute', top: rs(13), right: rs(13) }}>
            <Glass tone={glass.white} radius={rs(999)} style={{ paddingHorizontal: rs(9), paddingVertical: rs(4), borderWidth: 1, borderColor: glass.border }}>
              <Text className="font-bold" style={{ fontSize: rs(9), color: glass.ink }}>★★★ 희귀</Text>
            </Glass>
          </View>

          <View style={{ position: 'absolute', top: rs(52), left: 0, right: 0, alignItems: 'center' }}>
            <Text className="font-semibold" style={{ fontSize: rs(13), color: '#fff' }}>서울 · 한강공원</Text>
            <Text className="font-bold" style={{ fontSize: rs(50), color: '#fff', lineHeight: rs(55) }}>22°</Text>
            <Text className="font-semibold" style={{ fontSize: rs(11), color: '#fff', opacity: 0.85 }}>☀︎ 맑음 · 7월 29일 06:12</Text>
            <Text className="font-bold" style={{ fontSize: rs(12), color: '#fff', marginTop: rs(8) }}>양떼구름 · 권적운</Text>
          </View>

          {/* Mascot sits right beside its own bubble now — chat-avatar +
              bubble, so the caption reads as the cloud actually saying it,
              not a caption floating near an unrelated centered character. */}
          <View style={{ position: 'absolute', bottom: rs(12), left: rs(10), flexDirection: 'row', alignItems: 'flex-end', gap: rs(5) }}>
            <MongleMascot size={38} />
            <View
              style={{
                backgroundColor: '#3C82F6',
                borderRadius: rs(14),
                borderBottomLeftRadius: rs(3),
                paddingHorizontal: rs(10),
                paddingVertical: rs(7),
                marginBottom: rs(4),
              }}
            >
              <Text className="font-semibold" style={{ fontSize: rs(10.5), color: '#fff' }}>오늘 하늘 미쳤다 ☁️</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={{ flexDirection: 'row', gap: rs(9), marginTop: rs(14) }}>
          <Glass tone={glass.white} radius={rs(12)} style={{ flex: 1, alignItems: 'center', paddingVertical: rs(11), borderWidth: 1, borderColor: glass.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
              <Ionicons name="download-outline" size={rs(14)} color={glass.ink} />
              <Text style={{ fontSize: rs(12), fontWeight: '600', color: glass.ink }}>저장</Text>
            </View>
          </Glass>
          <Glass tone={glass.white} radius={rs(12)} style={{ flex: 1, alignItems: 'center', paddingVertical: rs(11), borderWidth: 1, borderColor: glass.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
              <Ionicons name="link-outline" size={rs(14)} color={glass.ink} />
              <Text style={{ fontSize: rs(12), fontWeight: '600', color: glass.ink }}>링크</Text>
            </View>
          </Glass>
        </View>

        <Pressable onPress={() => router.back()} style={{ marginTop: rs(14) }}>
          <Glass tone={glass.blue} radius={rs(999)} style={{ paddingVertical: rs(15), alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(7) }}>
              <Ionicons name="share-outline" size={rs(15)} color={glass.ink} />
              <Text className="font-bold" style={{ fontSize: rs(13), color: glass.ink }}>스토리 공유하기</Text>
            </View>
          </Glass>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
