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
        "양떼구름", "고적운", "희귀", 2,
        "작은 뭉치들이 촘촘히 줄지어 양떼처럼 하늘을 뒤덮은 구름",
    ),
    CloudSpecies(
        "비늘구름", "권적운", "희귀", 2,
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
    CloudSpecies(
        "물결구름", "파상운", "희귀", 2,
        "하늘에 길고 평행한 줄무늬가 반복되어 물결이나 잔물결처럼 보이는 구름",
    ),
    CloudSpecies(
        "면사포구름", "권층운", "희귀", 2,
        "하늘을 넓고 얇게 덮는 투명한 흰 막으로, 해나 달 주변에 햇무리나 달무리를 만들기도 하는 구름",
    ),
    CloudSpecies(
        "높층구름", "고층운", "일반", 1,
        "회색이나 푸른빛을 띤 넓고 고른 구름층으로, 해나 달이 희미한 둥근 얼룩처럼 비치는 중층 구름",
    ),
    CloudSpecies(
        "비구름", "난층운", "희귀", 2,
        "하늘 전체를 두껍고 어두운 회색으로 덮고, 지속적인 비나 눈을 내리는 넓은 층 모양의 구름",
    ),
    CloudSpecies(
        "층적구름", "층적운", "일반", 1,
        "낮은 하늘에 회색이나 흰색의 크고 둥근 덩어리들이 층을 이루며 넓게 이어진 구름",
    ),
    CloudSpecies(
        "두루마리구름", "롤운", "희귀", 2,
        "긴 원통이나 두루마리처럼 수평으로 길게 뻗어 있으며, 다른 구름과 떨어져 보이는 낮은 구름",
    ),
    CloudSpecies(
        "파도구름", "켈빈-헬름홀츠운", "전설", 3,
        "바람의 세기 차이로 생긴 파도 꼭대기처럼 말려 올라간 연속된 물결 모양의 구름",
    ),
    CloudSpecies(
        "모루구름", "철상운", "전설", 3,
        "발달한 적란운 꼭대기가 옆으로 넓고 평평하게 퍼져 대장간 모루처럼 보이는 구름",
    ),
    CloudSpecies(
        "유방구름", "유방운", "전설", 3,
        "적란운이나 모루구름의 밑면에 둥근 주머니들이 아래로 여러 개 늘어진 구름",
    ),
    CloudSpecies(
        "무지개구름", "채운", "전설", 3,
        "얇은 구름 가장자리나 작은 구름 조각에 분홍, 초록, 파랑 등 무지개빛이 은은하게 나타난 구름",
    ),
    CloudSpecies(
        "구름구멍", "운공", "전설", 3,
        "고적운이나 권적운 구름층 가운데에 둥글거나 타원형의 뚜렷한 빈 구멍이 난 구름",
    ),
    CloudSpecies(
        "야광운", "야광운", "전설", 3,
        "해가 진 뒤 또는 뜨기 전의 어두운 하늘에 푸른빛이나 은빛으로 빛나는 매우 높고 가는 구름",
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
