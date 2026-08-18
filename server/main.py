"""FastAPI backend for mongle: a thin proxy for the two things that must
stay server-side — the OpenAI and OpenWeatherMap API keys — plus Apple
Sign In and, for signed-in accounts, their synced catches (see auth.py and
catches.py).

/api/recognize is a port of the old Expo API route
(frontend/app/api/recognize+api.ts) — same prompt, same species list, same
response shape. /api/today-sky drives the home screen's weather card.
A signed-out device still keeps catches/nickname purely on-device (see
frontend/lib/localStore.ts); once signed in, frontend/lib/localStore.ts
switches to reading/writing them here instead, under the account's own
`account_catches` rows.
"""

import json
import os
from datetime import datetime, timedelta

from dotenv import load_dotenv

# Must run before any of this project's own modules are imported — they read
# API keys from the environment at *module import time*, not per-request.
# Importing them before the .env file is loaded silently leaves those keys
# as None for the process's whole lifetime.
load_dotenv()

import httpx
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import APIStatusError, AsyncOpenAI
from pydantic import BaseModel

import auth
import catches
from cloud_species import KNOWN_CLOUDS

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# The database schema lives in Supabase and is created idempotently at startup.
try:
    auth.init_db()
    catches.init_db()
except Exception as e:
    print(f"[startup] Supabase initialization failed, account features will 500: {e}")


def current_account_id(authorization: str | None = Header(default=None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="로그인이 필요해요.")
    return auth.decode_session_token(authorization.removeprefix("Bearer "))


class RecognizeRequest(BaseModel):
    imageBase64: str


@app.get("/health")
async def health():
    return {"ok": True}


class AppleSignInRequest(BaseModel):
    identity_token: str
    email: str | None = None


@app.post("/api/auth/apple")
async def apple_sign_in(payload: AppleSignInRequest):
    claims = await auth.verify_apple_identity_token(payload.identity_token)
    apple_sub = claims.get("sub")
    if not apple_sub:
        raise HTTPException(status_code=401, detail="Apple 로그인 토큰이 올바르지 않아요.")

    # The identity token itself only carries an email when Apple's relay
    # forwards one; the client also passes along the (only-sent-once, only
    # on first authorization) email from the native credential as a
    # fallback so we don't lose it on the one chance we get it.
    email = claims.get("email") or payload.email
    account = auth.get_or_create_account("apple", apple_sub, email)
    token = auth.create_session_token(account["id"])
    return {"token": token, "account": auth.account_to_out(account)}


class KakaoSignInRequest(BaseModel):
    # Native (app already has an access token from the SDK) sends
    # access_token; web (redirect flow only ever gets an authorization
    # code) sends code instead — exactly one of the two.
    access_token: str | None = None
    code: str | None = None


@app.post("/api/auth/kakao")
async def kakao_sign_in(payload: KakaoSignInRequest):
    if payload.code:
        access_token = await auth.exchange_kakao_code(payload.code)
    elif payload.access_token:
        access_token = payload.access_token
    else:
        raise HTTPException(status_code=400, detail="access_token 또는 code가 필요해요.")

    claims = await auth.verify_kakao_access_token(access_token)
    account = auth.get_or_create_account("kakao", claims["id"], claims.get("email"))
    token = auth.create_session_token(account["id"])
    return {"token": token, "account": auth.account_to_out(account)}


@app.get("/api/auth/me")
async def get_me(account_id: int = Depends(current_account_id)):
    row = auth.get_account(account_id)
    if row is None:
        raise HTTPException(status_code=401, detail="계정을 찾을 수 없어요.")
    return auth.account_to_out(row)


class UpdateNicknameRequest(BaseModel):
    nickname: str


@app.put("/api/auth/me")
async def update_me(payload: UpdateNicknameRequest, account_id: int = Depends(current_account_id)):
    row = auth.update_nickname(account_id, payload.nickname)
    return auth.account_to_out(row)


@app.delete("/api/auth/withdraw")
async def withdraw(account_id: int = Depends(current_account_id)):
    auth.delete_account(account_id)
    return {"ok": True}


class CreateCatchRequest(BaseModel):
    cloud_name: str
    cloud_type: str
    confidence: float | None = None
    finish: str
    memo: str | None = None
    place_name: str | None = None
    lat: float | None = None
    lng: float | None = None
    temp_c: float | None = None
    weather_condition: str | None = None
    photo_base64: str | None = None


@app.post("/api/catches")
async def create_catch(
    payload: CreateCatchRequest, request: Request, account_id: int = Depends(current_account_id)
):
    row = catches.create_catch(account_id, payload.model_dump())
    return catches.catch_to_out(row, str(request.base_url))


@app.get("/api/catches")
async def list_catches(request: Request, limit: int = 30, account_id: int = Depends(current_account_id)):
    rows = catches.list_catches(account_id, limit)
    return [catches.catch_to_out(r, str(request.base_url)) for r in rows]


@app.get("/api/catches/map")
async def list_map_pins(request: Request, limit: int = 50, account_id: int = Depends(current_account_id)):
    rows = catches.list_map_pins(account_id, limit)
    return [catches.catch_to_out(r, str(request.base_url)) for r in rows]


@app.get("/api/catches/{catch_id}")
async def get_catch(catch_id: int, request: Request, account_id: int = Depends(current_account_id)):
    row = catches.get_catch(account_id, catch_id)
    if row is None:
        raise HTTPException(status_code=404, detail="기록을 찾을 수 없어요.")
    return catches.catch_to_out(row, str(request.base_url))


@app.post("/api/recognize")
async def recognize(payload: RecognizeRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500, detail="서버에 OPENAI_API_KEY가 설정되어 있지 않아요."
        )

    if not payload.imageBase64:
        raise HTTPException(status_code=400, detail="imageBase64가 필요해요.")

    data_url = (
        payload.imageBase64
        if payload.imageBase64.startswith("data:")
        else f"data:image/jpeg;base64,{payload.imageBase64}"
    )

    option_list = "\n".join(
        f"- {c.name} ({c.type}): {c.description}" for c in KNOWN_CLOUDS
    )

    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    try:
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            max_tokens=300,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "너는 하늘 사진을 보고 구름 종류를 식별하는 분류기야. "
                        "사진에 하늘이나 구름이 찍혀있지 않으면(사람, 실내, 사물, 음식 등) "
                        "절대 아래 목록에서 고르지 말고 name을 null로 답해. "
                        "하늘이 찍혔다면 아래 목록 중 실제 구름 모양과 가장 비슷한 것 하나만 골라. "
                        "특히 하늘 전체를 뒤덮은 밋밋한 회색은 대부분 안개구름(층운)이고, "
                        "먹구름(적란운)은 탑처럼 솟아오른 두껍고 짙은 소나기구름일 때만 골라 — "
                        "단순히 날이 흐리다고 먹구름을 고르면 안 돼.\n"
                        f"목록:\n{option_list}\n"
                        'JSON으로만 답해: {"name": "목록의 한글 이름 또는 null", '
                        '"type": "목록의 괄호 안 한자어 또는 null", '
                        '"confidence": 0~1 사이 숫자, "reasoning": "한 문장 이유(한국어)"}.'
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 사진의 구름 종류를 식별해줘."},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=502,
            detail={"error": "이미지 인식에 실패했어요.", "detail": e.message},
        )

    raw = completion.choices[0].message.content if completion.choices else None
    if not raw:
        raise HTTPException(status_code=502, detail="인식 결과를 읽지 못했어요.")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail={"error": "인식 결과 형식이 올바르지 않아요.", "detail": raw},
        )

    match = next(
        (c for c in KNOWN_CLOUDS if c.name == parsed.get("name")), None
    )
    if match is None:
        raise HTTPException(
            status_code=422,
            detail={"error": "구름 사진이 아닌 것 같아요. 하늘을 찍어주세요."},
        )

    return {
        "name": match.name,
        "type": match.type,
        "confidence": parsed.get("confidence"),
        "reasoning": parsed.get("reasoning", ""),
    }


class TodaySkyOut(BaseModel):
    temp_c: float
    condition: str  # 맑음 / 구름조금 / 흐림 / 비 / 노을 — matches home.tsx's ConditionKey
    cloud_name: str
    cloud_type: str
    message: str


def _map_condition(owm_main: str, clouds_pct: int, is_evening: bool) -> str:
    if owm_main == "Clear":
        return "노을" if is_evening else "맑음"
    if owm_main == "Clouds":
        return "구름조금" if clouds_pct < 40 else "흐림"
    if owm_main in ("Rain", "Drizzle", "Thunderstorm"):
        return "비"
    return "흐림"  # Mist/Fog/Haze/Snow/etc — closest visual match we have


@app.get("/api/today-sky", response_model=TodaySkyOut)
async def today_sky(lat: float, lng: float):
    if not OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=500, detail="서버에 OPENWEATHER_API_KEY가 설정되어 있지 않아요."
        )
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=500, detail="서버에 OPENAI_API_KEY가 설정되어 있지 않아요."
        )

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lng,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "metric",
                    "lang": "kr",
                },
                timeout=10.0,
            )
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="날씨 정보를 가져오지 못했어요.")

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="날씨 정보를 가져오지 못했어요.")

    data = resp.json()
    owm_main = data.get("weather", [{}])[0].get("main", "Clouds")
    clouds_pct = data.get("clouds", {}).get("all", 0)
    temp_c = data.get("main", {}).get("temp", 20.0)
    tz_offset = data.get("timezone", 0)
    local_hour = (datetime.utcnow() + timedelta(seconds=tz_offset)).hour
    condition = _map_condition(owm_main, clouds_pct, is_evening=17 <= local_hour <= 19)

    option_list = ", ".join(f"{c.name} ({c.type})" for c in KNOWN_CLOUDS)

    ai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    try:
        completion = await ai_client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            max_tokens=200,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "너는 오늘 하늘에서 어떤 구름이 잘 보일지 추천해주는 다정한 도우미야. "
                        f"반드시 다음 목록 중 하나만 골라: {option_list}. "
                        'JSON으로만 답해: {"name": "목록의 한글 이름", "type": "목록의 괄호 안 한자어", '
                        '"message": "한 문장 추천 멘트(한국어, 다정하고 캐주얼한 반말체 아님, '
                        '\'~보일 것 같아요\' 같은 존댓말)"}.'
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"오늘 날씨: {condition}, 기온 {round(temp_c)}도, "
                        f"구름량 {clouds_pct}%. 오늘 하늘에서 어떤 구름이 잘 보일까?"
                    ),
                },
            ],
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=502,
            detail={"error": "구름 추천에 실패했어요.", "detail": e.message},
        )

    raw = completion.choices[0].message.content if completion.choices else None
    if not raw:
        raise HTTPException(status_code=502, detail="구름 추천 결과를 읽지 못했어요.")

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail={"error": "구름 추천 결과 형식이 올바르지 않아요.", "detail": raw},
        )

    match = next(
        (c for c in KNOWN_CLOUDS if c.name == parsed.get("name")), KNOWN_CLOUDS[0]
    )

    return TodaySkyOut(
        temp_c=temp_c,
        condition=condition,
        cloud_name=match.name,
        cloud_type=match.type,
        message=parsed.get("message", ""),
    )


if __name__ == "__main__":
    import uvicorn

    # 0.0.0.0 so devices on the LAN (phone running Expo Go) can reach this,
    # not just the machine it's running on.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
