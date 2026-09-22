// Dev-only mock catches for eyeballing the feed / folders / search / map /
// home components without shooting real photos. Written straight to this
// device's local store (see seedLocalMockCatches) — never to the server, and
// only visible while signed out, since a signed-in account reads its catches
// from the server instead.
import { Asset } from "expo-asset";
import type { CloudTier } from "./cloudSpecies";
import {
  clearLocalMockCatches,
  MockCatchInput,
  seedLocalMockCatches,
} from "./localStore";

const PHOTOS = [
  require("../assets/ref/cloud-1.jpg"),
  require("../assets/ref/cloud-2.jpg"),
  require("../assets/ref/cloud-3.jpg"),
  require("../assets/ref/cloud (1).jpg"),
  require("../assets/ref/cloud (2).jpg"),
  require("../assets/ref/cloud (3).jpg"),
];

const SPECIES: { name: string; type: string }[] = [
  { name: "뭉게구름", type: "적운" },
  { name: "새털구름", type: "권운" },
  { name: "양떼구름", type: "권적운" },
  { name: "비늘구름", type: "고적운" },
  { name: "먹구름", type: "적란운" },
  { name: "렌즈구름", type: "렌즈운" },
];

const PLACES = [
  { name: "서울 성동구", lat: 37.5446, lng: 127.0557 },
  { name: "서울 영등포구", lat: 37.5285, lng: 126.9327 },
  { name: "서울 용산구", lat: 37.5512, lng: 126.9882 },
  { name: "서울 종로구", lat: 37.5796, lng: 126.977 },
  { name: "서울 마포구", lat: 37.5779, lng: 126.8915 },
  { name: "부산 해운대구", lat: 35.1587, lng: 129.1604 },
];

const CONDITIONS = ["맑음", "구름 조금", "흐림", "노을"];
const FINISHES: CloudTier[] = ["bronze", "silver", "gold", "holo"];
const MEMOS = [
  "퇴근길 노을",
  "한강에서 발견",
  "점심 산책 중",
  "하늘이 너무 예뻐서",
  "비 오기 전",
  "",
  "",
  "",
];

// Days-ago for each mock catch, oldest gaps last. Today + the three days
// before it make a 4-day running streak; the rest are spread over ~7 weeks.
const DAYS_AGO = [
  0, 0, 1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 15, 16, 18, 19, 21, 22, 24, 26, 27, 29,
  31, 33, 34, 36, 38, 40, 42, 44, 46, 48,
];

// Weighted so the feed has plenty of common clouds and a few rare ones.
const SPECIES_PICK = [0, 0, 1, 2, 0, 3, 1, 0, 2, 4, 1, 0, 5, 2, 3, 0];

function build(): MockCatchInput[] {
  const now = Date.now();
  return DAYS_AGO.map((daysAgo, i) => {
    const species = SPECIES[SPECIES_PICK[i % SPECIES_PICK.length]];
    const place = PLACES[i % PLACES.length];
    const photo = Asset.fromModule(PHOTOS[i % PHOTOS.length]);
    const capturedAt = new Date(
      now - daysAgo * 86400000 - ((i * 37) % 300) * 60000,
    );
    // Keep "today" catches actually on today's local date.
    if (daysAgo === 0) capturedAt.setTime(now - (i + 1) * 20 * 60000);
    return {
      cloudName: species.name,
      cloudType: species.type,
      confidence: 0.5 + ((i * 7) % 5) / 10,
      finish: FINISHES[(i * 3 + SPECIES_PICK[i % SPECIES_PICK.length]) % 4],
      memo: MEMOS[i % MEMOS.length] || null,
      placeName: place.name,
      lat: place.lat + ((i % 5) - 2) * 0.004,
      lng: place.lng + ((i % 3) - 1) * 0.004,
      tempC: 12 + ((i * 5) % 17),
      weatherCondition: CONDITIONS[i % CONDITIONS.length],
      photoUri: photo.uri,
      capturedAt: capturedAt.toISOString(),
    };
  });
}

// Edge cases for the feed's folder piles: a species with a single catch (a
// one-photo pile), and a place whose only catch has no photo (placeholder).
// Together with the bulk data above (2-photo folders like 먹구름/렌즈구름, and
// 3+ photo ones), every pile size shows up.
function edgeCases(): MockCatchInput[] {
  const now = Date.now();
  return [
    {
      cloudName: "안개구름",
      cloudType: "층운",
      confidence: 0.7,
      finish: "silver",
      memo: "안개 낀 아침",
      placeName: "인천 중구",
      lat: 37.4738,
      lng: 126.6217,
      tempC: 14,
      weatherCondition: "흐림",
      photoUri: Asset.fromModule(PHOTOS[1]).uri,
      capturedAt: new Date(now - 5 * 3600000).toISOString(),
    },
    {
      cloudName: "새털구름",
      cloudType: "권운",
      confidence: 0.6,
      finish: "bronze",
      memo: "사진 없이 기록",
      placeName: "제주 제주시",
      lat: 33.4996,
      lng: 126.5312,
      tempC: 19,
      weatherCondition: "맑음",
      photoUri: null,
      capturedAt: new Date(now - 7 * 3600000).toISOString(),
    },
  ];
}

export async function addMockCatches(): Promise<number> {
  return seedLocalMockCatches([...build(), ...edgeCases()]);
}

export async function removeMockCatches(): Promise<void> {
  await clearLocalMockCatches();
}
