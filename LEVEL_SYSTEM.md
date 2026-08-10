# Level System

<!-- design doc — v1, levels 1–10 -->

## Goal

Give every catch a sense of progress without turning the app into a grind.
Early levels come fast (hooks a first-time user in their first session or
two); later levels stretch out and reward the users who keep coming back
daily. Matches `PRODUCT.md`'s voice principle: warm and low-pressure, not
urgent or grindy.

## What counts

Level is driven purely by **cumulative catches** (`총 포착 수`) — every
registered catch counts equally, regardless of rarity or card finish.
Rarity/finish are their own separate reward axes (dex completion, bronze→holo
card pulls) and shouldn't be double-counted into leveling too — keeps each
system legible on its own, per Product Principle #2 ("collecting stays
legible at a glance").

*Future extension (not in v1): weight rare/legendary catches more heavily
than common ones, so a lucky legendary catch nudges level progress harder.
Left out for now to keep the v1 formula simple and easy to explain in-app.*

## Level curve (1–10, capped)

| Level | Title (칭호) | Catches to reach | Catches needed *this* level |
|------:|--------------|------------------:|------------------------------:|
| 1 | 몽글 새싹 | 0 | — (starting level) |
| 2 | 구름 초보 | 3 | 3 |
| 3 | 하늘 관찰가 | 7 | 4 |
| 4 | 구름 수집가 | 12 | 5 |
| 5 | 몽글 애호가 | 18 | 6 |
| 6 | 하늘 탐험가 | 26 | 8 |
| 7 | 구름 박사 | 36 | 10 |
| 8 | 몽글 장인 | 48 | 12 |
| 9 | 하늘 지킴이 | 63 | 15 |
| 10 | 구름 그랜드마스터 | 80 | 17 |

- **Level 10 is a hard cap for v1.** Once a user passes 80 total catches,
  they stay at Lv.10 / 100% progress — there's no overflow or negative
  state. `TODO(v2)`: extend the curve past 10 once there's real usage data
  on how fast users are actually climbing it.
- The gap between levels grows roughly by +1~3 catches per level — quick
  wins early (Lv.2 in 3 catches, achievable in one enthusiastic first day),
  a real commitment by the top (Lv.9→10 needs 17 more catches, i.e.
  multiple weeks of regular observation at a catch-or-two-a-day pace).

## Formulas

```
CUMULATIVE = [0, 3, 7, 12, 18, 26, 36, 48, 63, 80]  # index 0 → level 1

level(total):
  L = largest index i (1-based) such that total >= CUMULATIVE[i-1]
  capped at 10

level_progress_pct(total):
  if level == 10: 100
  else:
    span = CUMULATIVE[level] - CUMULATIVE[level - 1]
    into = total - CUMULATIVE[level - 1]
    pct = into / span * 100
```

This replaces the previous placeholder formula (`level = 1 + total // 5`,
uncapped, flat 5-catches-per-level) that shipped with the first backend
pass — that one was a stand-in, not a designed curve.

## Where it's used

- `server/routers/profile.py` — `_level()` implements the table above and
  returns `(level, progress_pct, title)`.
- `GET /api/profile` and `GET /api/home` — both expose `level`,
  `level_progress_pct`, and the new `level_title` field.
- Frontend: `home.tsx`'s weather-card level chip, `profile.tsx`'s identity
  card (title line + "다음까지 N회" + progress bar).

## Open questions for a v2

- Should rare/legendary catches count extra toward level (weighted XP)?
- Should there be an explicit "MAX LEVEL" badge/state in the UI once a user
  hits Lv.10, instead of the progress bar just sitting at 100%?
- Streak currently doesn't feed into level at all — intentional for v1 (kept
  as its own separate stat), but worth revisiting once both systems have
  real usage data.
