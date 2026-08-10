import { Platform } from "react-native";
import Constants from "expo-constants";

// The backend is the standalone FastAPI service in ../server — a thin proxy
// for the two things that must stay server-side (the OpenAI and
// OpenWeatherMap API keys). Everything else (catches, dex, profile, feed,
// map) now lives entirely on-device — see lib/localStore.ts.
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
