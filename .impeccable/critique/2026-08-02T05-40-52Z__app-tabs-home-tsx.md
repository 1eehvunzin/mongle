---
target: home screen (app/(tabs)/home.tsx)
total_score: 21
max_score: 28
na_heuristics: 5,9,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-02T05-40-52Z
slug: app-tabs-home-tsx
---
Method: dual-agent (A: a5836c31c762f0c8c · B: a82ef344c233112e9)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Date/time/level/progress all visible; minor gaps only |
| 2 | Match System / Real World | 4 | Korean voice and cloud imagery fit the mental model fluently |
| 3 | User Control and Freedom | 3 | Standard tab navigation, nothing trapping |
| 4 | Consistency and Standards | 2 | Headline pattern matches sibling screens, but shadow-color and gray-hex drift within this one file |
| 5 | Error Prevention | n/a | No destructive/input actions on this screen |
| 6 | Recognition Rather Than Recall | 4 | Everything on-screen is visible, nothing to memorize |
| 7 | Flexibility and Efficiency | 2 | No shortcuts, no personalization for a returning user |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, but the level card is visually flat versus the rest of the screen |
| 9 | Error Recovery | n/a | No error states possible here |
| 10 | Help and Documentation | n/a | Glanceable home screen, correctly doesn't need it |
| **Total** | | **21/28** | **Good (75%)** |

## Design Specificity Verdict

**LLM assessment:** Mostly specific, with one generic patch. The mascot-anchored speech bubble, the Korean low-pressure voice ("찍어볼까?"), the ultra-light "22°" against a gradient, and the pastel catch-tile grid all read as unmistakably mongle. The weak link is the "Lv.4 구름 관측가" progress card: a label, a percentage bar, and "다음까지 6회" — generic gamification chrome with zero collector-specific visual language (no star glyph, no rarity color, no flame). Drop it into an unrelated app and nothing breaks.

**Deterministic scan:** The bundled detector (plugin-cache `detect.mjs`, since no project-local copy exists) ran cleanly against this `.tsx` file and flagged 3 "design-system-color" advisories — hardcoded near-ink grays at lines 40 (`#2A3444`), 80 (`#6A8FC8`), and 119 (`#2A2E36`) that fall outside DESIGN.md's token list. A full manual token audit (Assessment B) found the picture is bigger than the detector alone shows: 27 total hex literals in the file, only 7 token-matched, 20 undocumented. Most of those 20 are decorative per-cloud/per-weather gradient stops that DESIGN.md itself treats as expected variation (the spec explicitly calls for "cloud-name-specific pastel gradient panels"), so they're not real violations — the detector's narrower 3-item flag is closer to the actual signal: near-neutral grays that should have been `ink`/`ink-sub` tokens instead of one-off hex, plus one shadow the detector's color-token check doesn't catch at all — a flat-black `shadowColor: '#000'` at line 94, a direct violation of DESIGN.md's "Tinted Glow Rule," sitting between two correctly hue-tinted shadows (lines 53, 136) elsewhere in the same file.

## Overall Impression

The top two-thirds of this screen is a faithful, well-executed expression of the system DESIGN.md describes — the ultra-light "22°" digit, the hue-tinted glows on the weather card and catch tiles, the speech-bubble's one deliberately flattened corner. Then the level/progress card breaks character: it's the one card with a black shadow, the one place using ad-hoc gray hex instead of theme tokens, and — more importantly — the one moment on the app's most-visited daily screen that should be celebrating the user's progress and instead just shows a bar and a number. The biggest opportunity isn't fixing the token drift (that's mechanical); it's making this card actually perform the "Pastel Pokédex" identity the rest of the screen already nails.

## What's Working

- **The ultra-light digit is textbook.** Line 80's `fontWeight: '200'`, `fontSize: rs(52)` on "22°" is the Ultra-Light Digit Rule executed exactly as specified — the system's one moment of typographic drama landing right where it should.
- **The speech-bubble exception is implemented precisely.** `borderTopLeftRadius: rs(5)` against an `rs(18)` base is the documented deliberate asymmetry, not just "a rounded chat bubble that happens to look different."
- **Most shadows already get the Tinted Glow Rule right.** The weather card (`#82A2D2`) and catch tiles (`#284682`) prove the pattern is understood — which is exactly why the one black shadow reads as a slip, not a gap in understanding.

## Priority Issues

**[P1] Flat black shadow on the level/progress card**
- **Why it matters:** Line 94's `shadowColor: '#000'` directly violates DESIGN.md's Tinted Glow Rule ("no shadow in this system is ever pure black"), and it's an isolated regression — the correct token (`cardShadow`, already defined in `constants/theme.ts` with the right hue) exists and simply isn't imported here.
- **Fix:** Replace the inline shadow object with `constants/theme.ts`'s `cardShadow` token.
- **Suggested command:** `/impeccable harden`

**[P1] Accent color doubles as non-interactive emphasis**
- **Why it matters:** `#6F96D4` (Morning Sky Blue text tint) appears identically on the one real tap target (`Link` at line 122) and on purely decorative/static text (lines 41, 104). DESIGN.md's One Accent Rule frames this color as meaning "tap this" — when static text wears the same color with no other distinguishing affordance (no chevron, no underline), users lose the one visual cue that tells them what's interactive, worse for a one-handed outdoor user (Casey) or anyone relying on more than color alone (Sam).
- **Fix:** Reserve `#6F96D4` for actual tap targets; render the static emphasis text (line 41's cloud name, line 104's counter) in `ink`/`ink-sub` weight instead, or give the real link a chevron.
- **Suggested command:** `/impeccable clarify`

**[P2] Hardcoded off-token grays throughout the file**
- **Why it matters:** `#8E8E93` (vs. the theme's `sub: #8A8A8E`), `#2A3444`, and `#2A2E36` (vs. `ink: #1C1C1E`) are all near-neutral colors that should be theme tokens but aren't — this file imports no theme constants at all, which is exactly the kind of drift that produced the P1 black-shadow bug above. Two of these three were independently caught by the automated detector.
- **Fix:** Replace with `className="text-ink"` / `"text-sub"` (NativeWind classes already defined in `tailwind.config.js`) instead of new hex literals.
- **Suggested command:** `/impeccable harden`

**[P2] The level/progress card has no signature reward motif**
- **Why it matters:** PRODUCT.md frames daily habit-building as the core loop, and DESIGN.md's own Overview says the system is "not shy about celebrating a catch" — yet the one progress indicator on the app's most-visited screen is a plain label, a bar, and a number, with no star, flame, or rarity-tier color anywhere near it. It's functionally fine but identity-flat against everything else on the same screen.
- **Fix:** Give the level card a stronger hero treatment consistent with the profile screen's streak card (gradient background, tinted glow, a small collector-game motif) rather than a bare white progress bar.
- **Suggested command:** `/impeccable delight`

**[P3] Progress track/fill radius under the documented floor**
- **Why it matters:** Lines 108 and 113 use `rs(8)` for the progress track and fill — below DESIGN.md's stated 14px radius floor for cards/pills/badges/buttons. Minor, and progress tracks aren't explicitly named in that rule's scope, but worth a deliberate call rather than an accident.
- **Fix:** Either bump to 12–14px+ or add progress tracks as a named, intentional exception in DESIGN.md alongside the speech-bubble and map-pin exceptions.
- **Suggested command:** `/impeccable polish`

## Persona Red Flags

**Casey (distracted, outdoors, one-handed):** The "22°" digit renders `#6A8FC8` on a `#DCECFB→#F2F8FF` gradient — low enough contrast to risk washing out in daylight glare. "전체 보기" (line 122) carries no visual weight beyond its blue color to catch a fast glance while walking.

**Jordan (first-timer):** Nothing on the home screen itself points to the camera — the entire core "go capture a cloud" loop is implied only by a floating FAB that lives outside this file (`TabBar.tsx`). A new user reading only what's on this screen has no explicit "start here."

**Sam (accessibility-dependent):** The link vs. static-text distinction (lines 41/104 vs. 122) is color-only at a small size (~13–14px) — nothing else (weight, underline, icon) tells a user relying on more than hue which text is tappable. `#8E8E93` gray-on-white at this weight also sits close to the WCAG AA edge.

## Minor Observations

- Hardcoded stale content: `TODAY_CAPTION = '7월 29일 화요일'` and "오전 9:41" will visibly mismatch real dates at launch — this is a content/data issue, not a visual one, but worth flagging before ship.
- `gap: rs(9)` (line 29) doesn't match any of DESIGN.md's documented spacing steps (xs 3 / sm 8 / md 12 / lg 16).
- The "☀︎" unicode glyph (line 70) breaks from the Ionicons set used everywhere else in the app (TabBar, dex.tsx) — a small stylistic inconsistency.

## Questions to Consider

- If the flame/star motif is the system's signature reward device, why doesn't the one screen users open every day show it anywhere?
- Two shadows on this screen are correctly hue-tinted and one isn't — was this file ever checked against DESIGN.md before, or is this the first pass catching it?
- Is "One Accent" being read internally as "our brand blue, use it when something feels important" rather than "the color that specifically means tap here" — and if the latter is the intent, should the rule's wording say so more explicitly?
