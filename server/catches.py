"""Server-side storage for a signed-in account's cloud catches —
`account_catches`, keyed off auth.py's `accounts`. Kept separate from the
legacy device-id-based `catches` table already sitting in mongle.db (dead,
unused — see main.py's module docstring) to avoid colliding two unrelated
schemas under one name.

Species metadata (dex number, rarity label, star count) stays purely
client-side in frontend/lib/cloudSpecies.ts — this module only round-trips
the raw fields a catch was created with, same as frontend/lib/localStore.ts
does for the on-device copy. `finish` is computed client-side too (from
confidence) and passed in rather than recomputed here, so this module needs
no species knowledge at all.
"""

from datetime import datetime, timezone

import auth
import supabase_store

# Database rows and photos are stored in Supabase, so they survive serverless
# cold starts and are shared by all backend instances.
def init_db() -> None:
    supabase_store.init_db()


def create_catch(account_id: int, data: dict) -> dict:
    photo_path = supabase_store.save_photo(account_id, data["photo_base64"]) if data.get("photo_base64") else None
    with supabase_store.db() as conn:
        cur = conn.execute(
            """
            INSERT INTO account_catches
                (account_id, cloud_name, cloud_type, confidence, finish, memo,
                 place_name, lat, lng, temp_c, weather_condition, photo_path, captured_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                account_id,
                data["cloud_name"],
                data["cloud_type"],
                data.get("confidence"),
                data["finish"],
                data.get("memo"),
                data.get("place_name"),
                data.get("lat"),
                data.get("lng"),
                data.get("temp_c"),
                data.get("weather_condition"),
                photo_path,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        return conn.execute("SELECT * FROM account_catches WHERE id = %s", (cur.fetchone()["id"],)).fetchone()


def get_catch(account_id: int, catch_id: int) -> dict | None:
    with supabase_store.db() as conn:
        return conn.execute(
            "SELECT * FROM account_catches WHERE id = %s AND account_id = %s",
            (catch_id, account_id),
        ).fetchone()


def list_catches(account_id: int, limit: int) -> list[dict]:
    with supabase_store.db() as conn:
        return conn.execute(
            "SELECT * FROM account_catches WHERE account_id = %s ORDER BY id DESC LIMIT %s",
            (account_id, limit),
        ).fetchall()


def list_map_pins(account_id: int, limit: int) -> list[dict]:
    with supabase_store.db() as conn:
        return conn.execute(
            """
            SELECT * FROM account_catches
            WHERE account_id = %s AND lat IS NOT NULL AND lng IS NOT NULL
            ORDER BY id DESC LIMIT %s
            """,
            (account_id, limit),
        ).fetchall()


def catch_to_out(row: dict, base_url: str) -> dict:
    photo_url = supabase_store.photo_url(row["photo_path"])
    return {
        "id": row["id"],
        "cloud_name": row["cloud_name"],
        "cloud_type": row["cloud_type"],
        "confidence": row["confidence"],
        "finish": row["finish"],
        "memo": row["memo"],
        "place_name": row["place_name"],
        "lat": row["lat"],
        "lng": row["lng"],
        "temp_c": row["temp_c"],
        "weather_condition": row["weather_condition"],
        "photo_url": photo_url,
        "captured_at": row["captured_at"],
    }
