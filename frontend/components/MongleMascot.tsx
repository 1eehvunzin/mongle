import { useEffect } from 'react';
import { Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { rs } from '../constants/scale';

type Props = {
  size?: number;
  bob?: boolean;
  duration?: number;
  style?: any;
};

export default function MongleMascot({ size = 100, bob = false, duration = 3200, style }: Props) {
  const scaledSize = rs(size);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (bob) {
      translateY.value = withRepeat(
        withTiming(-6, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }
  }, [bob, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={bob ? animatedStyle : undefined}>
      <Image
        source={require('../assets/mongle.png')}
        style={[{ width: scaledSize, height: scaledSize }, style]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
