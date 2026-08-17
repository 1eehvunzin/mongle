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

import base64
import os
import sqlite3
import uuid
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "mongle.db")
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")


def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    with _db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS account_catches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
                cloud_name TEXT NOT NULL,
                cloud_type TEXT NOT NULL,
                confidence REAL,
                finish TEXT NOT NULL,
                memo TEXT,
                place_name TEXT,
                lat REAL,
                lng REAL,
                temp_c REAL,
                weather_condition TEXT,
                photo_path TEXT,
                captured_at TEXT NOT NULL
            )
            """
        )


def _save_photo(account_id: int, base64_data: str) -> str:
    """Writes a base64-encoded JPEG to disk; returns its path relative to
    UPLOADS_DIR (also what main.py mounts /uploads to serve from)."""
    account_dir = os.path.join(UPLOADS_DIR, str(account_id))
    os.makedirs(account_dir, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.jpg"
    raw = base64_data.split(",", 1)[-1] if base64_data.startswith("data:") else base64_data
    with open(os.path.join(account_dir, filename), "wb") as f:
        f.write(base64.b64decode(raw))
    return f"{account_id}/{filename}"


def create_catch(account_id: int, data: dict) -> sqlite3.Row:
    photo_path = _save_photo(account_id, data["photo_base64"]) if data.get("photo_base64") else None
    with _db() as conn:
        cur = conn.execute(
            """
            INSERT INTO account_catches
                (account_id, cloud_name, cloud_type, confidence, finish, memo,
                 place_name, lat, lng, temp_c, weather_condition, photo_path, captured_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        conn.commit()
        return conn.execute("SELECT * FROM account_catches WHERE id = ?", (cur.lastrowid,)).fetchone()


def get_catch(account_id: int, catch_id: int) -> sqlite3.Row | None:
    with _db() as conn:
        return conn.execute(
            "SELECT * FROM account_catches WHERE id = ? AND account_id = ?",
            (catch_id, account_id),
        ).fetchone()


def list_catches(account_id: int, limit: int) -> list[sqlite3.Row]:
    with _db() as conn:
        return conn.execute(
            "SELECT * FROM account_catches WHERE account_id = ? ORDER BY id DESC LIMIT ?",
            (account_id, limit),
        ).fetchall()


def list_map_pins(account_id: int, limit: int) -> list[sqlite3.Row]:
    with _db() as conn:
        return conn.execute(
            """
            SELECT * FROM account_catches
            WHERE account_id = ? AND lat IS NOT NULL AND lng IS NOT NULL
            ORDER BY id DESC LIMIT ?
            """,
            (account_id, limit),
        ).fetchall()


def catch_to_out(row: sqlite3.Row, base_url: str) -> dict:
    photo_url = f"{base_url}uploads/{row['photo_path']}" if row["photo_path"] else None
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
