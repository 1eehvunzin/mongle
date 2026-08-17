import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { GlassTone } from '../constants/aquaTheme';
import { rs } from '../constants/scale';

type Props = {
  tone: GlassTone;
  radius?: number;
  style?: object;
  children?: React.ReactNode;
  // The top specular streak reads fine on hero/button surfaces (what this
  // was designed for) but washes out low-contrast text sitting right under
  // it — a plain settings list is the case that actually hit this. Off by
  // default would be the wrong call (it's the system's signature look);
  // this just gives content-heavy cards an escape hatch.
  highlight?: boolean;
};

// The reusable "Aqua button" surface: fill gradient + specular highlight +
// base rim. Every glossy element in this exploration is one of these.
export default function Glass({ tone, radius = rs(16), style, children, highlight = true }: Props) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <LinearGradient pointerEvents="none" colors={[tone.top, tone.mid]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      {children}
      {highlight ? (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '48%' }}
        />
      ) : null}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: rs(1.5), backgroundColor: tone.rim, opacity: 0.4 }} />
    </View>
  );
}
