import { Ionicons } from '@expo/vector-icons';
import { Text, View, ViewStyle } from 'react-native';
import { sys } from '../constants/theme';
import { rs } from '../constants/scale';

type Variant = 'plain' | 'dot' | 'icon';
type Tone = 'card' | 'translucent';

type Props = {
  label: string;
  variant?: Variant;
  tone?: Tone;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
  compact?: boolean;
  style?: ViewStyle;
};

// Shared pill primitive: 'dot' mirrors the reference's sidebar swatch+label
// rows, 'icon' mirrors its flight-card icon-circle badges, 'plain' mirrors
// its flat gray interest-tag pills. One shape, three reference lineages.
export default function Chip({ label, variant = 'plain', tone = 'card', color = sys.blue, icon, count, compact, style }: Props) {
  const translucent = tone === 'translucent';
  const textColor = translucent ? '#fff' : sys.ink;
  const bg = translucent ? 'rgba(255,255,255,0.2)' : sys.cardAlt;
  const dotSize = compact ? 5 : 6;
  const fontSize = compact ? 9 : 11;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: rs(variant === 'icon' ? 6 : compact ? 3 : 5),
          alignSelf: 'flex-start',
          backgroundColor: bg,
          borderRadius: rs(999),
          paddingLeft: variant === 'icon' ? rs(4) : rs(compact ? 6 : 9),
          paddingRight: rs(compact ? 6 : 9),
          paddingVertical: variant === 'icon' ? rs(4) : rs(compact ? 2 : 5),
        },
        style,
      ]}
    >
      {variant === 'dot' && (
        <View style={{ width: rs(dotSize), height: rs(dotSize), borderRadius: rs(dotSize / 2), backgroundColor: color }} />
      )}
      {variant === 'icon' && icon && (
        <View
          style={{
            width: rs(18),
            height: rs(18),
            borderRadius: rs(9),
            backgroundColor: translucent ? 'rgba(255,255,255,0.28)' : color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={rs(11)} color="#fff" />
        </View>
      )}
      <Text className="font-bold" style={{ fontSize: rs(fontSize), color: textColor }}>
        {label}
      </Text>
      {typeof count === 'number' && (
        <Text
          className="font-semibold"
          style={{ fontSize: rs(10), color: translucent ? 'rgba(255,255,255,0.7)' : sys.subMuted }}
        >
          {count}
        </Text>
      )}
    </View>
  );
}
