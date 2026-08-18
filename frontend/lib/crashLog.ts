// Diagnostic-only: the production iOS build has been aborting within ~3s of
// launch since build 10, and Hermes doesn't put a JS stack in the native
// crash log — so there's no way to see *what* threw without this. A global
// ErrorUtils handler (installed in app/_layout.tsx) calls recordCrash()
// before letting the default (fatal) handler run; since the app usually has
// no time left for a network round-trip before it aborts, that just writes
// to AsyncStorage. flushPendingCrash() is called on the *next* launch to
// actually upload it to the backend, where it lands in the server logs.
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getApiBaseUrl } from "./api";

const PENDING_KEY = "mongle.pendingCrash";

export async function recordCrash(
  error: unknown,
  isFatal: boolean,
): Promise<void> {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const record = {
      message,
      stack,
      isFatal,
      buildVersion: Constants.nativeBuildVersion ?? null,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(record));
  } catch {
    // best-effort — if even this fails, there's nothing more we can do.
  }
}

export async function flushPendingCrash(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    if (!raw) return;
    await AsyncStorage.removeItem(PENDING_KEY);
    await fetch(`${getApiBaseUrl()}/api/log-crash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    });
  } catch {
    // best-effort — network unreachable or backend down, nothing to do.
  }
}
