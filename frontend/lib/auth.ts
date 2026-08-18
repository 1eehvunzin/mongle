import { Alert, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import {
  AccountOut,
  appleSignIn,
  getMe,
  kakaoSignIn,
  kakaoSignInWithCode,
  withdrawAccount,
} from "./api";

const TOKEN_KEY = "mongle.sessionToken";

// expo-secure-store has no web implementation (its web module is an empty
// stub — calling it throws) — AsyncStorage's own web backend (localStorage)
// stands in there instead. Still SecureStore (real keychain/keystore) on
// native, since that's strictly better for a session token than
// AsyncStorage's plain storage.
async function getStoredToken(): Promise<string | null> {
  return Platform.OS === "web"
    ? AsyncStorage.getItem(TOKEN_KEY)
    : SecureStore.getItemAsync(TOKEN_KEY);
}
async function setStoredToken(token: string): Promise<void> {
  if (Platform.OS === "web") await AsyncStorage.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
}
async function deleteStoredToken(): Promise<void> {
  if (Platform.OS === "web") await AsyncStorage.removeItem(TOKEN_KEY);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Same plain-mutable-object pattern as lib/session.ts — this is separate
// from that module because "am I logged in" (server-backed, Apple/Kakao
// account) and "do I have a nickname/consent" (local-only, no account
// needed) are independent gates; the app works fully signed-out.
export const account = {
  ready: false,
  token: null as string | null,
  info: null as AccountOut | null,
};

let ensureAccountPromise: Promise<void> | null = null;

export function ensureAccount(): Promise<void> {
  if (!ensureAccountPromise) {
    ensureAccountPromise = (async () => {
      const token = await getStoredToken().catch(() => null);
      if (token) {
        try {
          account.info = await getMe(token);
          account.token = token;
        } catch {
          // Token expired/invalid server-side — drop it rather than stay
          // stuck presenting a "logged in" state the server disagrees with.
          await deleteStoredToken();
        }
      }
      account.ready = true;
    })();
  }
  return ensureAccountPromise;
}

async function completeSignIn(
  token: string,
  info: AccountOut,
): Promise<AccountOut> {
  await setStoredToken(token);
  account.token = token;
  account.info = info;
  return finishSignIn(token, info);
}

export async function signInWithApple(): Promise<AccountOut> {
  if (Platform.OS === "web") return signInWithAppleWeb();

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("Apple 로그인에 실패했어요.");
  }

  const { token, account: info } = await appleSignIn(
    credential.identityToken,
    credential.email,
  );
  return completeSignIn(token, info);
}

export async function signInWithKakao(): Promise<AccountOut> {
  if (Platform.OS === "web") {
    redirectToKakaoWebAuthorize();
    // The redirect above navigates the whole page away — this promise is
    // never meant to resolve; app/kakao-callback.tsx (via
    // completeKakaoWebSignIn) picks up the sign-in after Kakao sends the
    // browser back.
    return new Promise<AccountOut>(() => {});
  }

  const kakaoToken = await kakaoLogin();
  const { token, account: info } = await kakaoSignIn(kakaoToken.accessToken);
  return completeSignIn(token, info);
}

// Called from app/kakao-callback.tsx once Kakao's redirect hands back `?code=`.
export async function completeKakaoWebSignIn(
  code: string,
): Promise<AccountOut> {
  const { token, account: info } = await kakaoSignInWithCode(code);
  return completeSignIn(token, info);
}

function redirectToKakaoWebAuthorize(): void {
  const clientId = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
  const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("카카오 웹 로그인 설정이 아직 안 됐어요.");
  }
  const url =
    `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;
  (globalThis as any).window.location.assign(url);
}

// Sign in with Apple JS (https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
// — the web counterpart to expo-apple-authentication, using a popup rather
// than a full-page redirect so it doesn't need its own callback route the
// way Kakao's flow does. Uses a Services ID (a separate Apple identifier
// from the app's Bundle ID) — see auth.py's APPLE_SERVICES_ID.
let appleJsSdkPromise: Promise<void> | null = null;
function loadAppleJsSdk(): Promise<void> {
  if (!appleJsSdkPromise) {
    appleJsSdkPromise = new Promise((resolve, reject) => {
      const w = (globalThis as any).window;
      if (w.AppleID) {
        resolve();
        return;
      }
      const script = w.document.createElement("script");
      script.src =
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Apple 로그인 스크립트를 불러오지 못했어요."));
      w.document.head.appendChild(script);
    });
  }
  return appleJsSdkPromise;
}

async function signInWithAppleWeb(): Promise<AccountOut> {
  const clientId = process.env.EXPO_PUBLIC_APPLE_SERVICES_ID;
  const redirectURI = process.env.EXPO_PUBLIC_APPLE_WEB_REDIRECT_URI;
  if (!clientId || !redirectURI) {
    throw new Error("Apple 웹 로그인 설정이 아직 안 됐어요.");
  }

  await loadAppleJsSdk();
  const AppleID = (globalThis as any).window.AppleID;
  AppleID.auth.init({
    clientId,
    scope: "name email",
    redirectURI,
    usePopup: true,
  });

  const res = await AppleID.auth.signIn();
  const idToken: string | undefined = res?.authorization?.id_token;
  if (!idToken) {
    throw new Error("Apple 로그인에 실패했어요.");
  }
  // Apple only ever sends the name/email in `user`, and only on the very
  // first authorization for this Services ID — same one-shot rule as the
  // native flow's credential.email.
  const email: string | null = res?.user?.email ?? null;

  const { token, account: info } = await appleSignIn(idToken, email);
  return completeSignIn(token, info);
}

// If this device has pre-existing local-only data, ask before touching
// anything — migrateLocalDataToServer() transfers it (deletes the local
// copy once it's confirmed on the server), so this isn't undoable.
function confirmMigration(): Promise<boolean> {
  if (Platform.OS === "web") {
    const confirmed = (globalThis as any).window?.confirm(
      "이 기기에 저장된 닉네임과 구름 기록을 계정에 연결하시겠어요?",
    );
    return Promise.resolve(Boolean(confirmed));
  }

  return new Promise((resolve) => {
    Alert.alert(
      "로컬 데이터를 연결하시겠습니까?",
      "이 기기에 저장된 닉네임과 구름 기록을 계정에 연결할 수 있어요. 연결하면 이 기기에는 더 이상 따로 남아있지 않아요.",
      [
        { text: "아니요", style: "cancel", onPress: () => resolve(false) },
        { text: "연결하기", onPress: () => resolve(true) },
      ],
      { cancelable: false },
    );
  });
}

// Re-fetches the account after sign-in, first offering to migrate any
// pre-existing local-only data (see localStore.ts's migrateLocalDataToServer)
// — asked once per device either way (hasLocalDataToMigrate turns false
// after an answer), so this never nags on repeat logins.
async function finishSignIn(
  token: string,
  fallback: AccountOut,
): Promise<AccountOut> {
  const {
    hasLocalDataToMigrate,
    markMigrationDecided,
    migrateLocalDataToServer,
  } = await import("./localStore");
  if (await hasLocalDataToMigrate()) {
    if (await confirmMigration()) {
      const result = await migrateLocalDataToServer(token);
      if (result.failed > 0) {
        const message = `일부 로컬 데이터를 옮기지 못했어요 (${result.failed}건). 다음 로그인 때 다시 시도할게요.`;
        if (Platform.OS === "web") {
          (globalThis as any).window?.alert(message);
        } else {
          Alert.alert("일부 데이터 이전 실패", message);
        }
      }
    } else {
      await markMigrationDecided();
    }
  }
  try {
    account.info = await getMe(token);
  } catch {
    // best-effort — keep the pre-migration account info rather than fail
    // a sign-in that otherwise already succeeded.
  }
  return account.info ?? fallback;
}

export async function signOut(): Promise<void> {
  await deleteStoredToken();
  account.token = null;
  account.info = null;
}

export async function withdraw(): Promise<void> {
  if (account.token) {
    await withdrawAccount(account.token);
  }
  await signOut();
}
