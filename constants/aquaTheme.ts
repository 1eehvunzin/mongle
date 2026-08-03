// Shared tokens for the "Aqua glass" exploration (desaturated 2000s Mac OS X
// button chrome: fill gradient + specular highlight + base rim). Scoped to
// the screens/components currently in this direction — home.tsx, TabBar —
// not yet promoted to the app-wide theme.
export const glass = {
  bg: '#F2F5F3',
  ink: '#3C4440',
  sub: '#828A84',
  subMuted: '#9FA69C',
  card: '#FDFDFB',
  border: '#E2E6DE',
  white: { top: '#FFFFFF', mid: '#F5F6F3', rim: '#D3D7CD', shadow: '#C3C8BC' },
  gray: { top: '#EEF0EB', mid: '#DBDED5', rim: '#ABAFA2', shadow: '#9DA195' },
  // Sky blue is the primary accent — interactive elements, progress fills,
  // the camera dock icon. Kept low-saturation on purpose (dusty, not
  // candy-bright), but lightened so it reads as sky rather than mud.
  blue: { top: '#DCEEF5', mid: '#A9D3E2', rim: '#4E8CA0', shadow: '#4E8CA0' },
  charcoal: { top: '#5B635D', mid: '#3C4440', rim: '#22271F', shadow: '#20241E' },
  // A deeper, readable version of the accent blue for text/icons on light
  // backgrounds — `blue.rim` alone was too washed out at small sizes.
  accent: '#3D7F97',
} as const;

export type GlassTone = { top: string; mid: string; rim: string; shadow?: string };
