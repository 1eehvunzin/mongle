"""Fixed per-species reference data — the single source of truth shared by
/api/recognize's classification prompt and the dex/catch logic.

Rarity label (일반/희귀/전설) and star count are fixed per species. Card
finish (bronze/silver/gold/holo) is a *per-catch* attribute derived from the
GPT recognition confidence (see finish_for_confidence) — a dex entry shows
the best finish ever pulled for that species, gacha-style.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class CloudSpecies:
    name: str
    type: str
    rarity_label: str  # 일반 / 희귀 / 전설
    stars: int  # 1-3
    description: str  # visual cue for the /api/recognize classification prompt


KNOWN_CLOUDS: list[CloudSpecies] = [
    CloudSpecies(
        "뭉게구름", "적운", "일반", 1,
        "맑은 날 뭉게뭉게 솜사탕처럼 뭉쳐 있고 윤곽이 뚜렷한 하얀 구름",
    ),
    CloudSpecies(
        "새털구름", "권운", "일반", 1,
        "아주 높은 하늘에 하얗고 가늘게 실처럼 퍼진 구름",
    ),
    CloudSpecies(
        "양떼구름", "권적운", "희귀", 2,
        "작은 뭉치들이 촘촘히 줄지어 양떼처럼 하늘을 뒤덮은 구름",
    ),
    CloudSpecies(
        "비늘구름", "고적운", "희귀", 2,
        "물고기 비늘처럼 자잘한 조각들이 규칙적으로 흩어진 회백색 구름",
    ),
    CloudSpecies(
        "먹구름", "적란운", "전설", 3,
        "탑처럼 높이 솟아오른 두껍고 짙은 회색/검은색 소나기·번개 구름 — 단순히 흐린 하늘이 아니라 뚜렷하게 우뚝 솟은 형태일 때만",
    ),
    CloudSpecies(
        "안개구름", "층운", "일반", 1,
        "하늘 전체를 낮고 평평하게 뒤덮는 옅은 회색 안개 같은 구름 — 흐린 날 가장 흔한 형태",
    ),
    CloudSpecies(
        "렌즈구름", "렌즈운", "전설", 3,
        "UFO처럼 매끈한 렌즈/원반 모양의 독특한 구름",
    ),
]

CLOUD_BY_NAME: dict[str, CloudSpecies] = {c.name: c for c in KNOWN_CLOUDS}

FINISH_ORDER = ["bronze", "silver", "gold", "holo"]


def stars_to_str(n: int) -> str:
    return "★" * n + "☆" * (3 - n)


def finish_for_confidence(confidence: float | None) -> str:
    if confidence is None or confidence < 0.5:
        return "bronze"
    if confidence < 0.7:
        return "silver"
    if confidence < 0.9:
        return "gold"
    return "holo"


def best_finish(finishes: list[str]) -> str:
    best = "bronze"
    for f in finishes:
        if FINISH_ORDER.index(f) > FINISH_ORDER.index(best):
            best = f
    return best
