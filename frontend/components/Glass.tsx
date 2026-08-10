import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { GlassTone } from '../constants/aquaTheme';
import { rs } from '../constants/scale';

type Props = {
  tone: GlassTone;
  radius?: number;
  style?: object;
  children?: React.ReactNode;
};

// The reusable "Aqua button" surface: fill gradient + specular highlight +
// base rim. Every glossy element in this exploration is one of these.
export default function Glass({ tone, radius = rs(16), style, children }: Props) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <LinearGradient colors={[tone.top, tone.mid]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      {children}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '48%' }}
      />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: rs(1.5), backgroundColor: tone.rim, opacity: 0.4 }} />
    </View>
  );
}
