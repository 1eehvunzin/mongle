import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import { login as kakaoLogin } from "@react-native-seoul/kakao-login";
import { AccountOut, appleSignIn, getMe, kakaoSignIn, withdrawAccount } from "./api";
import { migrateLocalDataToServer } from "./localStore";

const TOKEN_KEY = "mongle.sessionToken";

// Same plain-mutable-object pattern as lib/session.ts — this is separate
// from that module because "am I logged in" (server-backed, Apple account)
// and "do I have a nickname/consent" (local-only, no account needed) are
// independent gates; the app works fully signed-out.
export const account = {
  ready: false,
  token: null as string | null,
  info: null as AccountOut | null,
};

let ensureAccountPromise: Promise<void> | null = null;

export function ensureAccount(): Promise<void> {
  if (!ensureAccountPromise) {
    ensureAccountPromise = (async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        try {
          account.info = await getMe(token);
          account.token = token;
        } catch {
          // Token expired/invalid server-side — drop it rather than stay
          // stuck presenting a "logged in" state the server disagrees with.
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      }
      account.ready = true;
    })();
  }
  return ensureAccountPromise;
}

export async function signInWithApple(): Promise<AccountOut> {
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
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  account.token = token;
  account.info = info;
  return finishSignIn(token, info);
}

export async function signInWithKakao(): Promise<AccountOut> {
  const kakaoToken = await kakaoLogin();
  const { token, account: info } = await kakaoSignIn(kakaoToken.accessToken);
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  account.token = token;
  account.info = info;
  return finishSignIn(token, info);
}

// Uploads any pre-existing local-only data (see localStore.ts's
// migrateLocalDataToServer), then re-fetches the account since that
// migration may have just set its nickname server-side.
async function finishSignIn(token: string, fallback: AccountOut): Promise<AccountOut> {
  await migrateLocalDataToServer(token);
  try {
    account.info = await getMe(token);
  } catch {
    // best-effort — keep the pre-migration account info rather than fail
    // a sign-in that otherwise already succeeded.
  }
  return account.info ?? fallback;
}

export async function signOut(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  account.token = null;
  account.info = null;
}

export async function withdraw(): Promise<void> {
  if (account.token) {
    await withdrawAccount(account.token);
  }
  await signOut();
}
