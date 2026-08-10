import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  duration?: number;
  opacity?: number;
};

export default function Sheen({ duration = 3200, opacity = 1 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-260, 260]) },
      { rotate: '20deg' },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', opacity }]}>
      <Animated.View style={[styles.beam, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.75)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  beam: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 60,
  },
});
