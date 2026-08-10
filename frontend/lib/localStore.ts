// All catch/profile data now lives entirely on-device — no backend DB.
// AsyncStorage holds the JSON records; expo-file-system holds the photos.
// /api/recognize and /api/today-sky are the only things that still need a
// server (they hold the OpenAI/OpenWeatherMap keys), see lib/api.ts.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";
import {
  bestFinish,
  CLOUD_BY_NAME,
  CloudTier,
  dexNo,
  finishForConfidence,
  starsToStr,
} from "./cloudSpecies";
import { computeLevel } from "./levelSystem";

const CATCHES_KEY = "mongle.catches";
const NICKNAME_KEY = "mongle.nickname";
const CONSENT_KEY = "mongle.consentGranted";
const FIRST_LAUNCH_KEY = "mongle.firstLaunchAt";
const NEXT_ID_KEY = "mongle.nextCatchId";

type StoredCatch = {
  id: number;
  cloudName: string;
  cloudType: string;
  confidence: number | null;
  finish: CloudTier;
  memo: string | null;
  placeName: string | null;
  lat: number | null;
  lng: number | null;
  tempC: number | null;
  weatherCondition: string | null;
  photoUri: string | null;
  capturedAt: string;
};

export type CatchOut = {
  id: number;
  dex_no: string;
  cloud_name: string;
  cloud_type: string;
  rarity_label: string;
  stars: string;
  finish: CloudTier;
  memo: string | null;
  place_name: string | null;
  lat: number | null;
  lng: number | null;
  temp_c: number | null;
  weather_condition: string | null;
  photo_url: string | null;
  captured_at: string;
  handle: string | null;
};

async function readCatches(): Promise<StoredCatch[]> {
  const raw = await AsyncStorage.getItem(CATCHES_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeCatches(catches: StoredCatch[]): Promise<void> {
  await AsyncStorage.setItem(CATCHES_KEY, JSON.stringify(catches));
}

async function nextId(): Promise<number> {
  const raw = await AsyncStorage.getItem(NEXT_ID_KEY);
  const id = raw ? parseInt(raw, 10) : 1;
  await AsyncStorage.setItem(NEXT_ID_KEY, String(id + 1));
  return id;
}

async function toOut(c: StoredCatch): Promise<CatchOut> {
  const species = CLOUD_BY_NAME[c.cloudName];
  return {
    id: c.id,
    dex_no: dexNo(c.cloudName),
    cloud_name: c.cloudName,
    cloud_type: c.cloudType,
    rarity_label: species?.rarityLabel ?? "일반",
    stars: starsToStr(species?.stars ?? 1),
    finish: c.finish,
    memo: c.memo,
    place_name: c.placeName,
    lat: c.lat,
    lng: c.lng,
    temp_c: c.tempC,
    weather_condition: c.weatherCondition,
    photo_url: c.photoUri,
    captured_at: c.capturedAt,
    handle: (await getNickname()) ?? "구름지기",
  };
}

// Photos are saved into the app's own document directory (survives
// restarts, unlike the cache dir the camera itself writes the shot to) so a
// catch's photo doesn't disappear once the OS reclaims cache space.
function photosDir(): Directory {
  const dir = new Directory(Paths.document, "catches");
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function savePhotoBase64(base64: string): string {
  const file = new File(
    photosDir(),
    `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
  );
  file.write(base64, { encoding: "base64" });
  return file.uri;
}

export type CreateCatchInput = {
  cloud_name: string;
  cloud_type: string;
  confidence?: number | null;
  memo?: string | null;
  place_name?: string | null;
  lat?: number | null;
  lng?: number | null;
  temp_c?: number | null;
  weather_condition?: string | null;
  photo_base64?: string | null;
};

export async function createCatch(input: CreateCatchInput): Promise<CatchOut> {
  const catches = await readCatches();
  const stored: StoredCatch = {
    id: await nextId(),
    cloudName: input.cloud_name,
    cloudType: input.cloud_type,
    confidence: input.confidence ?? null,
    finish: finishForConfidence(input.confidence ?? null),
    memo: input.memo ?? null,
    placeName: input.place_name ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    tempC: input.temp_c ?? null,
    weatherCondition: input.weather_condition ?? null,
    photoUri: input.photo_base64 ? savePhotoBase64(input.photo_base64) : null,
    capturedAt: new Date().toISOString(),
  };
  catches.push(stored);
  await writeCatches(catches);
  return toOut(stored);
}

export async function getCatch(id: number | string): Promise<CatchOut> {
  const catches = await readCatches();
  const found = catches.find((c) => c.id === Number(id));
  if (!found) throw new Error("기록을 찾을 수 없어요.");
  return toOut(found);
}

export async function getFeed(limit = 30): Promise<CatchOut[]> {
  const catches = await readCatches();
  const sorted = [...catches].sort((a, b) => b.id - a.id).slice(0, limit);
  return Promise.all(sorted.map(toOut));
}

export async function getMapPins(): Promise<CatchOut[]> {
  const catches = await readCatches();
  const withLocation = catches
    .filter((c) => c.lat != null && c.lng != null)
    .sort((a, b) => b.id - a.id)
    .slice(0, 50);
  return Promise.all(withLocation.map(toOut));
}

export async function getNickname(): Promise<string | null> {
  return AsyncStorage.getItem(NICKNAME_KEY);
}

export async function setNickname(nickname: string): Promise<void> {
  await AsyncStorage.setItem(NICKNAME_KEY, nickname);
}

export async function getConsent(): Promise<boolean> {
  return (await AsyncStorage.getItem(CONSENT_KEY)) === "1";
}

export async function setConsent(granted: boolean): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY, granted ? "1" : "0");
}

async function getFirstLaunchAt(): Promise<Date> {
  const raw = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
  if (raw) return new Date(raw);
  const now = new Date();
  await AsyncStorage.setItem(FIRST_LAUNCH_KEY, now.toISOString());
  return now;
}

function toLocalDateKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function streaks(dateKeys: string[]): { current: number; longest: number } {
  if (dateKeys.length === 0) return { current: 0, longest: 0 };
  const daySet = new Set(dateKeys);
  const todayKey = toLocalDateKey(new Date().toISOString());
  const cursor = new Date();
  if (!daySet.has(todayKey)) cursor.setDate(cursor.getDate() - 1);

  let current = 0;
  while (daySet.has(toLocalDateKey(cursor.toISOString()))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [...daySet].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const d = new Date(key);
    if (prev && (d.getTime() - prev.getTime()) / 86400000 === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}

function heat(dateKeys: string[]): number[] {
  const counts = new Map<string, number>();
  for (const key of dateKeys) counts.set(key, (counts.get(key) ?? 0) + 1);
  const cells: number[] = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const n = counts.get(toLocalDateKey(d.toISOString())) ?? 0;
    let level = 0;
    if (n === 1) level = 1;
    else if (n >= 2 && n <= 3) level = 2;
    else if (n >= 4 && n <= 5) level = 3;
    else if (n > 5) level = 4;
    cells.push(level);
  }
  return cells;
}

function weekChecks(dateKeys: string[]): boolean[] {
  const daySet = new Set(dateKeys);
  const today = new Date();
  const monday = new Date(today);
  const weekday = (today.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(today.getDate() - weekday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return daySet.has(toLocalDateKey(d.toISOString()));
  });
}

function mostObserved(catches: StoredCatch[]): string | null {
  if (catches.length === 0) return null;
  const counts = new Map<string, number>();
  for (const c of catches) counts.set(c.cloudName, (counts.get(c.cloudName) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export type ProfileOut = {
  nickname: string;
  level: number;
  level_title: string;
  level_progress_pct: number;
  catches_to_next_level: number;
  days_active: number;
  streak_current: number;
  streak_longest: number;
  week_checks: boolean[];
  heat: number[];
  most_observed: string | null;
};

export async function getProfile(): Promise<ProfileOut> {
  const catches = await readCatches();
  const dateKeys = catches.map((c) => toLocalDateKey(c.capturedAt));
  const { current, longest } = streaks(dateKeys);
  const lvl = computeLevel(catches.length);
  const firstLaunchAt = await getFirstLaunchAt();
  const daysActive =
    Math.floor((Date.now() - firstLaunchAt.getTime()) / 86400000) + 1;

  return {
    nickname: (await getNickname()) ?? "구름지기",
    level: lvl.level,
    level_title: lvl.levelTitle,
    level_progress_pct: lvl.levelProgressPct,
    catches_to_next_level: lvl.catchesToNextLevel,
    days_active: daysActive,
    streak_current: current,
    streak_longest: longest,
    week_checks: weekChecks(dateKeys),
    heat: heat(dateKeys),
    most_observed: mostObserved(catches),
  };
}

export type HomeOut = {
  level: number;
  level_title: string;
  level_progress_pct: number;
  streak_current: number;
  recent_catches: CatchOut[];
};

export async function getHome(): Promise<HomeOut> {
  const catches = await readCatches();
  const dateKeys = catches.map((c) => toLocalDateKey(c.capturedAt));
  const { current } = streaks(dateKeys);
  const lvl = computeLevel(catches.length);
  const recent = [...catches].sort((a, b) => b.id - a.id).slice(0, 3);

  return {
    level: lvl.level,
    level_title: lvl.levelTitle,
    level_progress_pct: lvl.levelProgressPct,
    streak_current: current,
    recent_catches: await Promise.all(recent.map(toOut)),
  };
}

// Dex "best finish ever pulled" per species, kept around for anything that
// wants a Pokédex-style summary later even though the dex screen itself was
// dropped (see TabBar.tsx history) — not currently rendered anywhere.
export async function getBestFinishBySpecies(): Promise<Record<string, CloudTier>> {
  const catches = await readCatches();
  const bySpecies = new Map<string, CloudTier[]>();
  for (const c of catches) {
    bySpecies.set(c.cloudName, [...(bySpecies.get(c.cloudName) ?? []), c.finish]);
  }
  const result: Record<string, CloudTier> = {};
  for (const [name, finishes] of bySpecies) result[name] = bestFinish(finishes);
  return result;
}
