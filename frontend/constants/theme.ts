// Reference-informed system (github.com/1eehvunzin/personalweb): neutral warm-gray
// canvas, one blue "point" accent, flat category-color swatches, black pill buttons,
// soft neutral shadows. See DESIGN.md.

export const sys = {
  bg: '#F5F4F1',
  card: '#FFFFFF',
  cardAlt: '#EAE9E5',
  border: '#E1DFDA',
  ink: '#1C1C1E',
  sub: '#75747A',
  subMuted: '#8B897F',
  blue: '#5670B0',
  blueTint: '#E4E9F5',
  blueGradient: ['#6C85C0', '#5670B0'] as const,
  common: '#5670B0',
  rare: '#7558B0',
  legendary: '#805E1D',
  rose: '#C06F92',
  green: '#5E9E74',
  bronze: '#B08258',
  silver: '#A6A49B',
  gold: '#805E1D',
} as const;

export const rarity = {
  common: { swatch: sys.common, label: '일반' },
  rare: { swatch: sys.rare, label: '희귀' },
  legendary: { swatch: sys.legendary, label: '전설' },
};

// Flat, desaturated tints of each rarity's swatch — gives dex cards a
// rarity-legible background without breaking the system's flat-color rule.
export const rarityTint = {
  common: sys.blueTint,
  rare: '#EAE5F5',
  legendary: '#F3ECDA',
};

export const softShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

// iOS-Weather-style condition gradients — the one deliberately saturated
// surface in the system, distinct per condition so the color itself reads
// as weather information, not just decoration.
export const weatherGradients = {
  clear: { colors: ['#4E90DE', '#2F6FE0'] as const, shadow: '#2F6FE0' },
  partlyCloudy: { colors: ['#7F97B5', '#66829F'] as const, shadow: '#66829F' },
  cloudy: { colors: ['#93979E', '#7D8087'] as const, shadow: '#7D8087' },
  rain: { colors: ['#5C7A99', '#3E5670'] as const, shadow: '#3E5670' },
  sunset: { colors: ['#D48F58', '#C06F92'] as const, shadow: '#C06F92' },
} as const;

export type WeatherKey = keyof typeof weatherGradients;

export function weatherGradientFor(condition: string): (typeof weatherGradients)[WeatherKey] {
  if (condition.includes('노을')) return weatherGradients.sunset;
  if (condition.includes('비') || condition.includes('소나기')) return weatherGradients.rain;
  if (condition.includes('흐림') || condition.includes('구름많음')) return weatherGradients.cloudy;
  if (condition.includes('구름조금') || condition.includes('구름 조금')) return weatherGradients.partlyCloudy;
  return weatherGradients.clear;
}
