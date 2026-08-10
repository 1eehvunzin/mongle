import { View } from 'react-native';
import { rs } from '../constants/scale';

type Props = { tint?: string };

// Soft translucent circle texture lifted directly from the reference's blue
// gradient hero card — decoration behind content, never on top of it.
export default function HeroBlobs({ tint = 'rgba(255,255,255,0.12)' }: Props) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <View
        style={{
          position: 'absolute',
          width: rs(170),
          height: rs(170),
          borderRadius: rs(85),
          backgroundColor: tint,
          top: rs(-70),
          right: rs(-50),
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: rs(90),
          height: rs(90),
          borderRadius: rs(45),
          backgroundColor: tint,
          bottom: rs(-34),
          right: rs(26),
        }}
      />
    </View>
  );
}
