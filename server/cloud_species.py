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


KNOWN_CLOUDS: list[CloudSpecies] = [
    CloudSpecies("뭉게구름", "적운", "일반", 1),
    CloudSpecies("새털구름", "권운", "일반", 1),
    CloudSpecies("양떼구름", "권적운", "희귀", 2),
    CloudSpecies("비늘구름", "고적운", "희귀", 2),
    CloudSpecies("먹구름", "적란운", "전설", 3),
    CloudSpecies("안개구름", "층운", "일반", 1),
    CloudSpecies("렌즈구름", "렌즈운", "전설", 3),
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
