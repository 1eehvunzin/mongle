type Name =
  | "location"
  | "sunny"
  | "checkmark"
  | "flame"
  | "sparkles"
  | "camera"
  | "share"
  | "download"
  | "link"
  | "chevron-back"
  | "chevron-forward"
  | "close"
  | "cloud"
  | "partly-sunny"
  | "refresh"
  | "chatbubble"
  | "info";

// Small hand-rolled icon set in the same thin-outline language as the
// Ionicons the real app uses (@expo/vector-icons) — kept local so this
// static canvas has no runtime icon-font dependency.
const PATHS: Record<Name, JSX.Element> = {
  location: (
    <path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13Zm0-9.5A3.5 3.5 0 1 1 12 5.5a3.5 3.5 0 0 1 0 7Z" />
  ),
  sunny: (
    <g>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
    </g>
  ),
  checkmark: <path d="M4 12.5 9.5 18 20 6" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
  flame: (
    <path d="M12 2c1 3-3 4-3 7.5A3 3 0 0 0 12 13a3 3 0 0 0 3-3.4c1.4 1 2 2.6 2 4.4a5 5 0 0 1-10 0c0-4 3-5 2-8.5C10.3 4 11 3 12 2Z" />
  ),
  sparkles: (
    <path d="M12 3l1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Zm7 8 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2ZM5 13l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
  ),
  camera: (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.4" />
    </g>
  ),
  share: (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3M8 7l4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </g>
  ),
  download: (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M8 11l4 4 4-4" />
      <path d="M5 19h14" />
    </g>
  ),
  link: (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5l1-1a3.5 3.5 0 0 1 5 5l-1 1M13 17.5l-1 1a3.5 3.5 0 0 1-5-5l1-1" />
    </g>
  ),
  "chevron-back": <path d="M15 5 8 12l7 7" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-forward": <path d="M9 5l7 7-7 7" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  close: <path d="M6 6l12 12M18 6 6 18" fill="none" strokeWidth="2.4" strokeLinecap="round" />,
  chatbubble: (
    <path
      d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
      fill="none"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  info: (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" />
    </g>
  ),
  cloud: (
    <path
      d="M7.5 18a4.5 4.5 0 0 1-.6-8.96 5.5 5.5 0 0 1 10.7-1.6A4.25 4.25 0 0 1 17 18H7.5Z"
      fill="none"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  ),
  "partly-sunny": (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 6.5 7 8M3 12h2M13 3v2" />
      <circle cx="8" cy="9" r="2.6" />
      <path d="M9.5 20a4 4 0 0 1-.5-7.97 4.9 4.9 0 0 1 9.4-1.4A3.8 3.8 0 0 1 18 20H9.5Z" />
    </g>
  ),
  refresh: (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 0 1 14-5.2M20 12a8 8 0 0 1-14 5.2" />
      <path d="M18 4v3.3H14.7M6 20v-3.3h3.3" />
    </g>
  ),
};

export default function Icon({ name, size = 16, color = "currentColor" }: { name: Name; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color}>
      {PATHS[name]}
    </svg>
  );
}
