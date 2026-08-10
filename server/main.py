"""FastAPI backend for mongle: a thin proxy for the two things that must
stay server-side — the OpenAI and OpenWeatherMap API keys.

/api/recognize is a port of the old Expo API route
(frontend/app/api/recognize+api.ts) — same prompt, same species list, same
response shape. /api/today-sky drives the home screen's weather card.
Everything else (catches, dex, profile, feed, map) lives entirely on-device
now — see frontend/lib/localStore.ts — so this server holds no user data at
all.
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
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import APIStatusError, AsyncOpenAI
from pydantic import BaseModel

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


class RecognizeRequest(BaseModel):
    imageBase64: str


@app.get("/health")
async def health():
    return {"ok": True}


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

    option_list = ", ".join(f"{c.name} ({c.type})" for c in KNOWN_CLOUDS)

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
                        f"반드시 다음 목록 중 하나만 골라: {option_list}. "
                        "애매하면 가장 가까운 걸 골라. "
                        'JSON으로만 답해: {"name": "목록의 한글 이름", "type": "목록의 괄호 안 한자어", '
                        '"confidence": 0~1 사이 숫자, "reasoning": "한 문장 이유(한국어)"}.'
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 하늘 사진의 구름 종류를 식별해줘."},
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
        (c for c in KNOWN_CLOUDS if c.name == parsed.get("name")), KNOWN_CLOUDS[0]
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
