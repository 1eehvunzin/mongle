import { Platform } from "react-native";
import Constants from "expo-constants";

// The backend is the standalone FastAPI service in ../server — a thin proxy
// for the two things that must stay server-side (the OpenAI and
// OpenWeatherMap API keys), plus Apple/Kakao sign-in and, once signed in, a
// synced copy of catches/nickname (lib/localStore.ts decides whether to hit
// these or AsyncStorage based on lib/auth.ts's account state).
const API_PORT = 8000;

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (Platform.OS === "web") return `http://localhost:${API_PORT}`;
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:${API_PORT}` : `http://localhost:${API_PORT}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  return handleApiResponse<T>(res);
}

async function handleApiResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string" ? detail : detail?.error ?? "요청에 실패했어요";
    throw new Error(message);
  }
  return data as T;
}

export type RecognizeResult = {
  name: string;
  type: string;
  confidence: number | null;
  reasoning: string;
};

export function recognize(imageBase64: string) {
  return apiFetch<RecognizeResult>("/api/recognize", {
    method: "POST",
    body: JSON.stringify({ imageBase64 }),
  });
}

export type TodaySkyOut = {
  temp_c: number;
  condition: "맑음" | "구름조금" | "흐림" | "비" | "노을";
  cloud_name: string;
  cloud_type: string;
  message: string;
};

export function getTodaySky(lat: number, lng: number) {
  return apiFetch<TodaySkyOut>(`/api/today-sky?lat=${lat}&lng=${lng}`);
}

export type AccountOut = {
  id: number;
  email: string | null;
  nickname: string | null;
  created_at: string;
};

export function appleSignIn(identityToken: string, email: string | null) {
  return apiFetch<{ token: string; account: AccountOut }>("/api/auth/apple", {
    method: "POST",
    body: JSON.stringify({ identity_token: identityToken, email }),
  });
}

export function kakaoSignIn(accessToken: string) {
  return apiFetch<{ token: string; account: AccountOut }>("/api/auth/kakao", {
    method: "POST",
    body: JSON.stringify({ access_token: accessToken }),
  });
}

// Web only — the browser redirect flow only ever gets an authorization
// code (native gets an access token straight from the SDK instead); the
// server does the code→token exchange itself (see auth.py's
// exchange_kakao_code) so the REST API key never ships to the browser.
export function kakaoSignInWithCode(code: string) {
  return apiFetch<{ token: string; account: AccountOut }>("/api/auth/kakao", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

function authHeader(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export function getMe(token: string) {
  return apiFetch<AccountOut>("/api/auth/me", { headers: authHeader(token) });
}

export function updateNickname(token: string, nickname: string) {
  return apiFetch<AccountOut>("/api/auth/me", {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify({ nickname }),
  });
}

export async function withdrawAccount(token: string): Promise<void> {
  await apiFetch<{ ok: boolean }>("/api/auth/withdraw", {
    method: "DELETE",
    headers: authHeader(token),
  });
}

export type ServerCatch = {
  id: number;
  cloud_name: string;
  cloud_type: string;
  confidence: number | null;
  finish: string;
  memo: string | null;
  place_name: string | null;
  lat: number | null;
  lng: number | null;
  temp_c: number | null;
  weather_condition: string | null;
  photo_url: string | null;
  captured_at: string;
};

export type CreateServerCatchInput = {
  cloud_name: string;
  cloud_type: string;
  confidence: number | null;
  finish: string;
  memo?: string | null;
  place_name?: string | null;
  lat?: number | null;
  lng?: number | null;
  temp_c?: number | null;
  weather_condition?: string | null;
  photo_base64?: string | null;
};

export function createServerCatch(token: string, input: CreateServerCatchInput) {
  return apiFetch<ServerCatch>("/api/catches", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function getServerFeed(token: string, limit = 30) {
  return apiFetch<ServerCatch[]>(`/api/catches?limit=${limit}`, { headers: authHeader(token) });
}

export function getServerMapPins(token: string, limit = 50) {
  return apiFetch<ServerCatch[]>(`/api/catches/map?limit=${limit}`, { headers: authHeader(token) });
}

export function getServerCatch(token: string, id: number | string) {
  return apiFetch<ServerCatch>(`/api/catches/${id}`, { headers: authHeader(token) });
}
