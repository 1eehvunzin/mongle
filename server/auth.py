"""Sign in with Apple or Kakao: verifies whichever provider's token the
client hands us, maps it to a local `accounts` row, and issues our own
session JWT so later requests don't need to re-verify against the provider
every time.

Separate from the legacy `users`/`catches` tables already sitting in
mongle.db (dead leftovers from the old device-id backend — see main.py's
module docstring) — this owns its own `accounts` table instead of trying to
reuse that unrelated schema.
"""

import os
import sqlite3
import tempfile
import time
from datetime import datetime, timezone

import httpx
import jwt
from fastapi import HTTPException

APPLE_ISSUER = "https://appleid.apple.com"
APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys"
APPLE_BUNDLE_ID = os.getenv("APPLE_BUNDLE_ID")  # native app (iOS)
APPLE_SERVICES_ID = os.getenv("APPLE_SERVICES_ID")  # web (Sign in with Apple JS)
KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")  # web only — native uses the SDK directly
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI")  # must exactly match what the browser used
SESSION_JWT_SECRET = os.getenv("SESSION_JWT_SECRET")
SESSION_TTL_SECONDS = 180 * 24 * 60 * 60  # 180 days — a mobile app session,
# not a browser one; there's no refresh flow, so this is the whole lifetime.

# Serverless hosts (Vercel's Python runtime, at least) ship the deployed
# bundle read-only — only /tmp is writable, and it's wiped between cold
# starts / not shared across concurrent instances. SQLite still needs
# *somewhere* it can open for writing, so this falls back to /tmp there
# rather than crashing on every request the way trying to write into the
# read-only bundle dir did. This does NOT make accounts/catches durable on
# such a host — that needs a real hosted DB — it just stops one broken
# feature from taking the whole app (including unrelated routes like
# /health and /api/recognize) down with it.
DB_PATH = (
    os.path.join(tempfile.gettempdir(), "mongle.db")
    if os.getenv("VERCEL")
    else os.path.join(os.path.dirname(__file__), "mongle.db")
)


def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with _db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                apple_sub TEXT UNIQUE,
                kakao_id TEXT UNIQUE,
                email TEXT,
                nickname TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        # accounts already existed (created by an earlier auth.py revision)
        # without these columns — ALTER errors if re-run once added, so only
        # add each the first time.
        columns = {row["name"]: row for row in conn.execute("PRAGMA table_info(accounts)")}
        if "nickname" not in columns:
            conn.execute("ALTER TABLE accounts ADD COLUMN nickname TEXT")
        if "kakao_id" not in columns:
            # SQLite can't ALTER ADD a UNIQUE column directly — add it plain,
            # then enforce uniqueness via an index (also covers the fresh
            # CREATE TABLE path, where the inline UNIQUE already did this,
            # but IF NOT EXISTS makes re-running harmless).
            conn.execute("ALTER TABLE accounts ADD COLUMN kakao_id TEXT")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_kakao_id ON accounts (kakao_id)")
        # An even earlier revision had apple_sub NOT NULL, which blocks
        # Kakao-only accounts — SQLite can't drop a column constraint
        # in-place, so rebuild the table instead (empty/dev-only db in
        # practice, but this preserves any rows either way).
        if columns.get("apple_sub") and columns["apple_sub"]["notnull"]:
            # Without this, SQLite rewrites *other* tables' REFERENCES
            # clauses to follow the rename below (catches.py's
            # account_catches says "REFERENCES accounts") — then dropping
            # accounts_old leaves that FK dangling. With it, other tables'
            # FK text is left untouched, so it keeps resolving to whichever
            # table is actually named "accounts" once we're done.
            conn.execute("PRAGMA legacy_alter_table = ON")
            conn.execute("ALTER TABLE accounts RENAME TO accounts_old")
            conn.execute(
                """
                CREATE TABLE accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    apple_sub TEXT UNIQUE,
                    kakao_id TEXT UNIQUE,
                    email TEXT,
                    nickname TEXT,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                INSERT INTO accounts (id, apple_sub, kakao_id, email, nickname, created_at)
                SELECT id, apple_sub, kakao_id, email, nickname, created_at FROM accounts_old
                """
            )
            conn.execute("DROP TABLE accounts_old")
            conn.execute("PRAGMA legacy_alter_table = OFF")
        conn.commit()


# Apple rotates its signing keys occasionally; cache the JWKS for a while
# instead of fetching on every login.
_jwks_cache: dict | None = None
_jwks_fetched_at: float = 0.0
JWKS_CACHE_TTL = 60 * 60


async def _get_apple_jwks() -> dict:
    global _jwks_cache, _jwks_fetched_at
    if _jwks_cache is not None and time.time() - _jwks_fetched_at < JWKS_CACHE_TTL:
        return _jwks_cache
    async with httpx.AsyncClient() as client:
        resp = await client.get(APPLE_KEYS_URL, timeout=10.0)
    resp.raise_for_status()
    _jwks_cache = resp.json()
    _jwks_fetched_at = time.time()
    return _jwks_cache


def _apple_audiences() -> list[str]:
    # Native Sign in with Apple's identity token carries the app's Bundle ID
    # as `aud`; the web JS SDK flow carries the separate Services ID
    # instead. Both are valid depending on which client authenticated.
    return [a for a in (APPLE_BUNDLE_ID, APPLE_SERVICES_ID) if a]


async def verify_apple_identity_token(identity_token: str) -> dict:
    """Validates signature, issuer, audience and expiry; returns the token's
    claims (notably `sub`, the stable per-app Apple user id, and `email`)."""
    audiences = _apple_audiences()
    if not audiences:
        raise HTTPException(
            status_code=500,
            detail="서버에 APPLE_BUNDLE_ID/APPLE_SERVICES_ID가 설정되어 있지 않아요.",
        )

    try:
        header = jwt.get_unverified_header(identity_token)
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Apple 로그인 토큰이 올바르지 않아요.")

    jwks = await _get_apple_jwks()
    matching_key = next((k for k in jwks.get("keys", []) if k.get("kid") == header.get("kid")), None)
    if matching_key is None:
        # Key rotated since our last fetch — refresh once and retry.
        global _jwks_cache
        _jwks_cache = None
        jwks = await _get_apple_jwks()
        matching_key = next((k for k in jwks.get("keys", []) if k.get("kid") == header.get("kid")), None)
        if matching_key is None:
            raise HTTPException(status_code=401, detail="Apple 로그인 토큰을 검증할 수 없어요.")

    public_key = jwt.PyJWK.from_dict(matching_key).key
    try:
        claims = jwt.decode(
            identity_token,
            key=public_key,
            algorithms=["RS256"],
            audience=audiences,
            issuer=APPLE_ISSUER,
        )
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Apple 로그인 토큰이 올바르지 않아요.")

    return claims


def get_or_create_account(provider: str, external_id: str, email: str | None) -> sqlite3.Row:
    column = "apple_sub" if provider == "apple" else "kakao_id"
    with _db() as conn:
        row = conn.execute(f"SELECT * FROM accounts WHERE {column} = ?", (external_id,)).fetchone()
        if row is not None:
            # Apple only sends the email on the very first authorization, and
            # Kakao's email scope may not always be granted — keep whatever
            # we already have unless we're seeing a fresh one.
            if email and email != row["email"]:
                conn.execute("UPDATE accounts SET email = ? WHERE id = ?", (email, row["id"]))
                conn.commit()
                row = conn.execute("SELECT * FROM accounts WHERE id = ?", (row["id"],)).fetchone()
            return row

        cur = conn.execute(
            f"INSERT INTO accounts ({column}, email, created_at) VALUES (?, ?, ?)",
            (external_id, email, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
        return conn.execute("SELECT * FROM accounts WHERE id = ?", (cur.lastrowid,)).fetchone()


async def verify_kakao_access_token(access_token: str) -> dict:
    """Forwards the client's Kakao access token to Kakao's own userinfo
    endpoint — a bad/expired token simply gets rejected there, so there's no
    signature to verify locally the way Apple's JWT needs."""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                KAKAO_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0,
            )
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="카카오 로그인 확인에 실패했어요.")

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="카카오 로그인 토큰이 올바르지 않아요.")

    data = resp.json()
    kakao_account = data.get("kakao_account") or {}
    return {"id": str(data["id"]), "email": kakao_account.get("email")}


async def exchange_kakao_code(code: str) -> str:
    """Web-only: the browser redirect flow hands back an authorization
    code, not an access token directly (that's the native SDK's job) — this
    is the other half of that exchange, done server-side so the REST API
    key never ships to the browser bundle. Requires KAKAO_REDIRECT_URI to
    exactly match the redirect_uri the browser was sent to originally."""
    if not KAKAO_REST_API_KEY or not KAKAO_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="서버에 KAKAO_REST_API_KEY/KAKAO_REDIRECT_URI가 설정되어 있지 않아요.",
        )

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                KAKAO_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "client_id": KAKAO_REST_API_KEY,
                    "redirect_uri": KAKAO_REDIRECT_URI,
                    "code": code,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"},
                timeout=10.0,
            )
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="카카오 로그인 확인에 실패했어요.")

    data = resp.json()
    access_token = data.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail={"error": "카카오 로그인 코드가 올바르지 않아요.", "detail": data},
        )
    return access_token


def get_account(account_id: int) -> sqlite3.Row | None:
    with _db() as conn:
        return conn.execute("SELECT * FROM accounts WHERE id = ?", (account_id,)).fetchone()


def delete_account(account_id: int) -> None:
    with _db() as conn:
        conn.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        conn.commit()


def update_nickname(account_id: int, nickname: str) -> sqlite3.Row:
    with _db() as conn:
        conn.execute("UPDATE accounts SET nickname = ? WHERE id = ?", (nickname, account_id))
        conn.commit()
        return conn.execute("SELECT * FROM accounts WHERE id = ?", (account_id,)).fetchone()


def create_session_token(account_id: int) -> str:
    if not SESSION_JWT_SECRET:
        raise HTTPException(status_code=500, detail="서버에 SESSION_JWT_SECRET이 설정되어 있지 않아요.")
    now = int(time.time())
    payload = {"sub": str(account_id), "iat": now, "exp": now + SESSION_TTL_SECONDS}
    return jwt.encode(payload, SESSION_JWT_SECRET, algorithm="HS256")


def decode_session_token(token: str) -> int:
    """Returns the account id encoded in a valid session token."""
    if not SESSION_JWT_SECRET:
        raise HTTPException(status_code=500, detail="서버에 SESSION_JWT_SECRET이 설정되어 있지 않아요.")
    try:
        payload = jwt.decode(token, SESSION_JWT_SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="로그인이 만료됐어요. 다시 로그인해주세요.")
    return int(payload["sub"])


def account_to_out(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "email": row["email"],
        "nickname": row["nickname"],
        "created_at": row["created_at"],
    }
