// Catch/profile data lives on-device (AsyncStorage for the JSON records,
// expo-file-system for the photos) for a signed-out device. Once
// lib/auth.ts's `account.token` is set, every function below switches to
// reading/writing the account's synced copy on the server instead — see
// lib/api.ts's /api/catches endpoints. Species metadata (dex number,
// rarity, stars) stays purely client-side either way; the server only ever
// sees the raw fields a catch was created with.
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import {
  bestFinish,
  CLOUD_BY_NAME,
  CloudTier,
  dexNo,
  finishForConfidence,
  starsToStr,
} from "./cloudSpecies";
import { computeLevel } from "./levelSystem";
import { account } from "./auth";
import {
  AccountOut,
  createServerCatch,
  getServerCatch,
  getServerFeed,
  getServerMapPins,
  ServerCatch,
  updateNickname as updateServerNickname,
} from "./api";

const CATCHES_KEY = "mongle.catches";
const NICKNAME_KEY = "mongle.nickname";
const CONSENT_KEY = "mongle.consentGranted";
const FIRST_LAUNCH_KEY = "mongle.firstLaunchAt";
const NEXT_ID_KEY = "mongle.nextCatchId";
const LOGIN_ONBOARDING_SEEN_KEY = "mongle.loginOnboardingSeen";

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

// The server never learns species metadata — it only round-trips the raw
// fields a catch was created with — so a server row maps onto the same
// StoredCatch shape the rest of this file already knows how to turn into a
// CatchOut via toOut().
function serverCatchToStored(c: ServerCatch): StoredCatch {
  return {
    id: c.id,
    cloudName: c.cloud_name,
    cloudType: c.cloud_type,
    confidence: c.confidence,
    finish: c.finish as CloudTier,
    memo: c.memo,
    placeName: c.place_name,
    lat: c.lat,
    lng: c.lng,
    tempC: c.temp_c,
    weatherCondition: c.weather_condition,
    photoUri: c.photo_url,
    capturedAt: c.captured_at,
  };
}

// Every read path (feed/map/profile/home) needs the full catch list either
// way — this is the one place that decides whether that means "ask the
// server" or "read AsyncStorage".
async function resolveCatches(limit = 500): Promise<StoredCatch[]> {
  if (account.token) {
    const rows = await getServerFeed(account.token, limit);
    return rows.map(serverCatchToStored);
  }
  return readCatches();
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
async function photosDir(): Promise<string> {
  const dir = `${FileSystem.documentDirectory}catches/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists)
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  return dir;
}

async function savePhotoBase64(base64: string): Promise<string> {
  // expo-file-system has no document directory on web — there's no disk to
  // write to — so the photo is kept as a data URI instead of a file:// path.
  // expo-camera's web takePictureAsync already returns a full data URI in
  // its base64 field (unlike native, which returns the raw payload), so
  // only wrap it if it isn't one already.
  if (Platform.OS === "web") {
    return base64.startsWith("data:")
      ? base64
      : `data:image/jpeg;base64,${base64}`;
  }

  const uri = `${await photosDir()}${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
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
  const finish = finishForConfidence(input.confidence ?? null);

  if (account.token) {
    const row = await createServerCatch(account.token, {
      cloud_name: input.cloud_name,
      cloud_type: input.cloud_type,
      confidence: input.confidence ?? null,
      finish,
      memo: input.memo ?? null,
      place_name: input.place_name ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      temp_c: input.temp_c ?? null,
      weather_condition: input.weather_condition ?? null,
      photo_base64: input.photo_base64 ?? null,
    });
    return toOut(serverCatchToStored(row));
  }

  const catches = await readCatches();
  const stored: StoredCatch = {
    id: await nextId(),
    cloudName: input.cloud_name,
    cloudType: input.cloud_type,
    confidence: input.confidence ?? null,
    finish,
    memo: input.memo ?? null,
    placeName: input.place_name ?? null,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    tempC: input.temp_c ?? null,
    weatherCondition: input.weather_condition ?? null,
    photoUri: input.photo_base64
      ? await savePhotoBase64(input.photo_base64)
      : null,
    capturedAt: new Date().toISOString(),
  };
  catches.push(stored);
  await writeCatches(catches);
  return toOut(stored);
}

export async function getCatch(id: number | string): Promise<CatchOut> {
  if (account.token) {
    const row = await getServerCatch(account.token, id);
    return toOut(serverCatchToStored(row));
  }
  const catches = await readCatches();
  const found = catches.find((c) => c.id === Number(id));
  if (!found) throw new Error("기록을 찾을 수 없어요.");
  return toOut(found);
}

export async function getFeed(limit = 30): Promise<CatchOut[]> {
  const catches = await resolveCatches(limit);
  const sorted = [...catches].sort((a, b) => b.id - a.id).slice(0, limit);
  return Promise.all(sorted.map(toOut));
}

export async function getMapPins(): Promise<CatchOut[]> {
  if (account.token) {
    const rows = await getServerMapPins(account.token, 50);
    return Promise.all(rows.map((r) => toOut(serverCatchToStored(r))));
  }
  const catches = await readCatches();
  const withLocation = catches
    .filter((c) => c.lat != null && c.lng != null)
    .sort((a, b) => b.id - a.id)
    .slice(0, 50);
  return Promise.all(withLocation.map(toOut));
}

export async function getNickname(): Promise<string | null> {
  if (account.token) return account.info?.nickname ?? null;
  return AsyncStorage.getItem(NICKNAME_KEY);
}

export async function setNickname(nickname: string): Promise<void> {
  // Always mirrored locally too, even when signed in — so the nickname
  // survives a logout/withdraw without another round trip.
  await AsyncStorage.setItem(NICKNAME_KEY, nickname);
  if (account.token) {
    account.info = await updateServerNickname(account.token, nickname);
  }
}

export async function getConsent(): Promise<boolean> {
  return (await AsyncStorage.getItem(CONSENT_KEY)) === "1";
}

export async function setConsent(granted: boolean): Promise<void> {
  await AsyncStorage.setItem(CONSENT_KEY, granted ? "1" : "0");
}

// Nickname is cheap, low-stakes data — unlike catches (photos + records,
// which need the explicit "연결하시겠어요?" confirmation before anything
// local gets deleted), a local guest nickname always just follows the user
// into whichever account they next sign into, with no prompt of its own.
// Only fills in a still-empty account nickname; never overwrites one the
// account already has. Called from lib/auth.ts's finishSignIn on every
// sign-in, independent of (and before) the catches-migration flow below.
export async function migrateLocalNickname(
  token: string,
  hasServerNickname: boolean,
): Promise<AccountOut | null> {
  if (hasServerNickname) return null;
  const localNickname = await AsyncStorage.getItem(NICKNAME_KEY);
  if (!localNickname) return null;
  try {
    return await updateServerNickname(token, localNickname);
  } catch {
    return null;
  }
}

// Gates login-onboarding.tsx independently of onboardingState.nicknameSet —
// a device that already has a nickname (an earlier session, a reinstall
// that restored AsyncStorage, etc.) still hasn't necessarily seen the login
// step, so it can't ride on the same one-time flag.
export async function getLoginOnboardingSeen(): Promise<boolean> {
  return (await AsyncStorage.getItem(LOGIN_ONBOARDING_SEEN_KEY)) === "1";
}

export async function setLoginOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(LOGIN_ONBOARDING_SEEN_KEY, "1");
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
  for (const c of catches)
    counts.set(c.cloudName, (counts.get(c.cloudName) ?? 0) + 1);
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
  const catches = await resolveCatches();
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
  const catches = await resolveCatches();
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
export async function getBestFinishBySpecies(): Promise<
  Record<string, CloudTier>
> {
  const catches = await readCatches();
  const bySpecies = new Map<string, CloudTier[]>();
  for (const c of catches) {
    bySpecies.set(c.cloudName, [
      ...(bySpecies.get(c.cloudName) ?? []),
      c.finish,
    ]);
  }
  const result: Record<string, CloudTier> = {};
  for (const [name, finishes] of bySpecies) result[name] = bestFinish(finishes);
  return result;
}

const MIGRATED_KEY = "mongle.migratedToServer";

async function photoUriToBase64(uri: string): Promise<string | null> {
  if (uri.startsWith("data:")) return uri;
  try {
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch {
    return null;
  }
}

// Checked before ever prompting "로컬 데이터를 연결하시겠습니까?" (see
// lib/auth.ts's finishSignIn) — catches only, since the nickname now moves
// over silently via migrateLocalNickname above rather than through this
// confirmation. False once MIGRATED_KEY is set, whether migration actually
// ran or the user declined it, so that decision is only ever asked once per
// device.
export async function hasLocalDataToMigrate(): Promise<boolean> {
  if (await AsyncStorage.getItem(MIGRATED_KEY)) return false;
  const catches = await readCatches();
  return catches.length > 0;
}

// Records that the migration prompt was answered (either way) so it never
// asks again on this device.
export async function markMigrationDecided(): Promise<void> {
  await AsyncStorage.setItem(MIGRATED_KEY, "1");
}

// Called from lib/auth.ts's signOut/withdraw: NICKNAME_KEY doubles as both
// "genuine local data waiting to be migrated" (hasLocalDataToMigrate) and a
// same-account display cache (setNickname mirrors it even while signed in),
// so a stale mirror from the account someone just signed out of would
// otherwise look exactly like fresh guest data to the very next sign-in —
// silently offering to migrate account A's nickname onto account B, or
// permanently starving every later sign-in of its own migration offer since
// MIGRATED_KEY is a one-shot-per-device flag. Clearing both on the way out
// resets the device to a clean guest slate: the next signed-out session
// starts from "구름지기" instead of inheriting whoever was last signed in,
// and the next sign-in (same account or a different one) gets an accurate
// read on whatever local data actually accumulated since.
export async function clearLocalAccountMirror(): Promise<void> {
  await AsyncStorage.multiRemove([NICKNAME_KEY, MIGRATED_KEY]);
}

// Runs after the user confirms "로컬 데이터를 연결하시겠습니까?" (see
// lib/auth.ts's finishSignIn): pushes catches up to the account, then
// clears them locally — this is a *transfer*, not a copy, so the device
// doesn't end up with the same data live in two places. Only removes what
// actually made it to the server; anything that fails to upload (network
// blip, bad photo) is left in place rather than lost. Nickname isn't
// handled here — see migrateLocalNickname above.
export async function migrateLocalDataToServer(
  token: string,
): Promise<{ failed: number }> {
  const localCatches = await readCatches();
  const remaining: StoredCatch[] = [];
  for (const c of localCatches) {
    try {
      await createServerCatch(token, {
        cloud_name: c.cloudName,
        cloud_type: c.cloudType,
        confidence: c.confidence,
        finish: c.finish,
        memo: c.memo,
        place_name: c.placeName,
        lat: c.lat,
        lng: c.lng,
        temp_c: c.tempC,
        weather_condition: c.weatherCondition,
        photo_base64: c.photoUri ? await photoUriToBase64(c.photoUri) : null,
      });
      if (c.photoUri && !c.photoUri.startsWith("data:")) {
        FileSystem.deleteAsync(c.photoUri, { idempotent: true }).catch(() => {
          // best-effort — an orphaned local file is harmless, just wasted space.
        });
      }
    } catch {
      // best-effort per catch — one bad photo/network blip shouldn't stop
      // the rest of the migration, but this one stays local since it
      // never actually made it to the account.
      remaining.push(c);
    }
  }
  await writeCatches(remaining);

  const failed = remaining.length;
  if (failed === 0) await markMigrationDecided();
  return { failed };
}
