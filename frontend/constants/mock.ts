export type CloudTier = "bronze" | "silver" | "gold" | "holo";

export type Cloud = {
  no: string;
  name?: string;
  type?: string;
  stars: string;
  obs?: number;
  tier?: CloudTier;
  locked: boolean;
};

export const clouds: Cloud[] = [
  {
    no: "No.001",
    name: "뭉게구름",
    type: "적운",
    stars: "★☆☆",
    obs: 24,
    tier: "holo",
    locked: false,
  },
  {
    no: "No.002",
    name: "새털구름",
    type: "권운",
    stars: "★★☆",
    obs: 9,
    tier: "gold",
    locked: false,
  },
  {
    no: "No.003",
    name: "양떼구름",
    type: "권적운",
    stars: "★★☆",
    obs: 12,
    tier: "holo",
    locked: false,
  },
  {
    no: "No.004",
    name: "비늘구름",
    type: "고적운",
    stars: "★★☆",
    obs: 5,
    tier: "silver",
    locked: false,
  },
  {
    no: "No.005",
    name: "먹구름",
    type: "적란운",
    stars: "★★★",
    obs: 3,
    tier: "bronze",
    locked: false,
  },
  {
    no: "No.006",
    name: "안개구름",
    type: "층운",
    stars: "★☆☆",
    obs: 2,
    tier: "bronze",
    locked: false,
  },
  { no: "No.007", stars: "★★★", locked: true },
  { no: "No.008", stars: "★★★", locked: true },
  { no: "No.???", stars: "★★★", locked: true },
];

export const tierColors: Record<CloudTier, string> = {
  bronze: "#B08258",
  silver: "#A6A49B",
  gold: "#805E1D",
  holo: "#7558B0",
};

export type Feed = {
  handle: string;
  place: string;
  time: string;
  temp: string;
  cond: string;
  cloud: string;
  tier: string;
  stars: string;
  color: string;
  tint: string;
};

export const feeds: Feed[] = [
  {
    handle: "@구름지기",
    place: "서울 · 한강공원",
    time: "12분 전",
    temp: "22°",
    cond: "☀︎ 맑음",
    cloud: "양떼구름",
    tier: "희귀",
    stars: "★★★",
    color: "#7558B0",
    tint: "#EFE9F7",
  },
  {
    handle: "@sky_diary",
    place: "부산 · 광안리",
    time: "1시간 전",
    temp: "25°",
    cond: "⛅ 구름조금",
    cloud: "뭉게구름",
    tier: "일반",
    stars: "★☆☆",
    color: "#5670B0",
    tint: "#E4E9F5",
  },
  {
    handle: "@새벽러",
    place: "제주 · 성산",
    time: "3시간 전",
    temp: "19°",
    cond: "🌅 노을",
    cloud: "노을구름",
    tier: "희귀",
    stars: "★★★",
    color: "#7558B0",
    tint: "#F7EAEF",
  },
];

export type Pin = {
  place: string;
  name: string;
  time: string;
  stars: string;
  lat: number;
  lng: number;
};

export const pins: Pin[] = [
  {
    place: "한강공원",
    name: "뭉게구름",
    time: "오늘 06:12",
    stars: "★☆☆",
    lat: 37.5283,
    lng: 126.9145,
  },
  {
    place: "남산",
    name: "양떼구름",
    time: "어제 17:40",
    stars: "★★☆",
    lat: 37.5512,
    lng: 126.9882,
  },
  {
    place: "북한산",
    name: "렌즈구름",
    time: "7.26 05:30",
    stars: "★★★",
    lat: 37.6584,
    lng: 126.9772,
  },
  {
    place: "올림픽공원",
    name: "먹구름",
    time: "7.24 18:10",
    stars: "★★★",
    lat: 37.5206,
    lng: 127.1218,
  },
];

// 관측 달력 히트맵(35칸, 0~4 강도)
export const heat: number[] = [
  0, 1, 0, 2, 3, 1, 0, 1, 2, 4, 3, 2, 1, 0, 0, 3, 4, 4, 3, 2, 1, 2, 4, 3, 2, 1,
  0, 1, 3, 2, 1, 0, 4, 1, 2,
];

export const heatColors = [
  "#EAE9E5",
  "#C7D6EC",
  "#9FB9DE",
  "#77A0D2",
  "#5670B0",
];
