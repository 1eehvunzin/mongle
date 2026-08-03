import { Pressable, Text, View } from 'react-native';
import { sys } from '../constants/theme';
import { rs } from '../constants/scale';

type Segment = {
  key: string;
  label: string;
  color?: string;
  count?: number;
};

type Props = {
  segments: Segment[];
  value: string;
  onChange: (key: string) => void;
  trackColor?: string;
};

export default function SegmentedControl({ segments, value, onChange, trackColor = sys.cardAlt }: Props) {
  return (
    <View
      style={{ backgroundColor: trackColor, borderRadius: rs(11), padding: 3, flexDirection: 'row' }}
    >
      {segments.map((seg) => {
        const active = seg.key === value;
        return (
          <Pressable
            key={seg.key}
            onPress={() => onChange(seg.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: rs(8),
              borderRadius: rs(9),
              backgroundColor: active ? sys.card : 'transparent',
              shadowColor: active ? '#000' : undefined,
              shadowOpacity: active ? 0.1 : 0,
              shadowRadius: active ? 5 : 0,
              shadowOffset: { width: 0, height: 1 },
              elevation: active ? 1 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: rs(4) }}>
              <Text
                className="font-semibold"
                style={{ fontSize: rs(12.5), color: active ? sys.ink : seg.color ?? sys.sub }}
              >
                {seg.label}
              </Text>
              {typeof seg.count === 'number' && (
                <Text
                  className="font-semibold"
                  style={{ fontSize: rs(10), color: active ? sys.subMuted : sys.subMuted }}
                >
                  {seg.count}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
