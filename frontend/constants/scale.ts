import { Dimensions } from 'react-native';

// All screen specs/measurements were taken from the design mock's phone
// frame, which has a 302px-wide content area. Real devices are wider, so
// every size value is scaled up by the ratio between the two.
const BASE_WIDTH = 302;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RAW_RATIO = SCREEN_WIDTH / BASE_WIDTH;
// Dampen the raw ratio so wide phones don't get scaled up as aggressively.
const DAMPENED_RATIO = 1 + (RAW_RATIO - 1) * 0.5;
export const SCALE_RATIO = Math.min(Math.max(DAMPENED_RATIO, 1), 1.3);

export function rs(size: number): number {
  return Math.round(size * SCALE_RATIO);
}
