import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { sys } from '../constants/theme';
import { rs } from '../constants/scale';

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
};

export default function GradientButton({ label, icon, onPress, style, disabled }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={style}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: sys.ink,
            borderRadius: rs(28),
            paddingVertical: rs(15),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: rs(7),
            overflow: 'hidden',
            opacity: pressed ? 0.85 : disabled ? 0.4 : 1,
          }}
        >
          {/* Restrained specular highlight — the one tactile cue kept from the
              glossy-button reference, reduced to a faint top gradient rather
              than the reference's full glass-and-gradient fill. */}
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%' }}
          />
          {icon && <Ionicons name={icon} size={rs(15)} color="#fff" />}
          <Text className="font-bold" style={{ fontSize: rs(15), color: '#FFFFFF', letterSpacing: 0.2 }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
