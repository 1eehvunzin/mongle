import { getConsent, getNickname } from "./localStore";

// Mirrors the existing captureConsent/onboardingState pattern (plain mutable
// object, no store/re-render wiring) — good enough since it's only read
// synchronously after ensureSession() has resolved once at app start.
// `ready` replaces the old device-id-as-readiness-signal now that there's
// no backend session round-trip to wait on — just an AsyncStorage read.
export const session = {
  ready: false,
  nickname: null as string | null,
  consentGranted: false,
};

// Memoized so every caller (root layout, home's nickname-gate check, ...)
// shares one in-flight load instead of each hitting AsyncStorage separately.
let ensureSessionPromise: Promise<void> | null = null;

export function ensureSession(): Promise<void> {
  if (!ensureSessionPromise) {
    ensureSessionPromise = (async () => {
      session.nickname = await getNickname();
      session.consentGranted = await getConsent();
      session.ready = true;
    })();
  }
  return ensureSessionPromise;
}
