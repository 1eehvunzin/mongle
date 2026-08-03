/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#F5F4F1',
        card: '#FFFFFF',
        cardAlt: '#EAE9E5',
        border: '#E1DFDA',
        ink: '#1C1C1E',
        sub: '#75747A',
        subMuted: '#8B897F',
        blue: '#5670B0',
        blueTint: '#E4E9F5',
        common: '#5670B0',
        rare: '#7558B0',
        legendary: '#805E1D',
        rose: '#C06F92',
        green: '#5E9E74',
      },
      fontFamily: {
        normal: ['Pretendard-Regular'],
        medium: ['Pretendard-Medium'],
        semibold: ['Pretendard-SemiBold'],
        bold: ['Pretendard-Bold'],
        extrabold: ['Pretendard-ExtraBold'],
      },
    },
  },
  plugins: [],
};
