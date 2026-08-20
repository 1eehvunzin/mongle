import { useEffect } from 'react';
import { Image, InteractionManager } from 'react-native';
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
    if (!bob) return;
    // Deferred past mount — this is often the very first Reanimated
    // animation the app ever drives (e.g. right as the splash screen's
    // transition into home is still animating), and starting one mid-transition
    // has been a source of native crashes.
    const task = InteractionManager.runAfterInteractions(() => {
      translateY.value = withRepeat(
        withTiming(-6, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    });
    return () => task.cancel();
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
