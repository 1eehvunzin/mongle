# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primary users are photo/social content creators — people who enjoy capturing and sharing sky photography. They're motivated by getting a beautiful, shareable cloud photo, not by meteorological accuracy. The collection/rarity game loop (rare cloud "catches," streaks, levels) is what pulls them back daily and gives them something worth posting.

## Product Purpose

Mongle turns spotting and photographing clouds into a Pokédex-style collecting game. Users photograph the sky, the app identifies the cloud type, and it's added to a personal "cloud dex" (구름 도감) with rarity tiers (일반/희귀/전설, and a separate bronze/silver/gold/holo card finish). Observer level, XP, and daily observation streaks reward continued use. Success means users build a daily habit of looking up, work toward completing their dex, and share catches with others.

## Positioning

A weather app answers "what's the weather"; a generic camera app just stores photos. Mongle's mechanism is the collection game layered on real sky photography: an actual captured cloud becomes a collectible "catch" with rarity and dex-completion status, and turns into a shareable poster-style story card. The combination a neighboring product couldn't truthfully copy is real-world capture + Pokédex-style collect-and-complete progression + location-tagged social sharing (feed and map of catches).

## Operating Context

- Capture happens outdoors, often on the move (park, commute, balcony), typically one-handed and in daylight.
- Each catch auto-attaches location and local weather (temperature, condition).
- Users also browse indoors: reviewing the dex, streak/level progress, and the social feed/map of nearby catches from others.
- Sharing produces a poster-style "story card" (see `app/share.tsx`) meant for external sharing to Instagram/KakaoTalk-style story surfaces.
- The app is Korean-language throughout (UI copy, cloud names, all mock content); no localization work has happened.

## Capabilities and Constraints

- Confirmed and implemented: camera capture (expo-camera), a cloud registration flow, a personal dex with locked/unlocked entries and rarity tiers, an XP/level progress bar, observation-streak tracking, a social feed of per-post cards, a map view of nearby catches, and shareable story-card generation.
- Not yet implemented / undecided: real cloud-type recognition (capture.tsx currently hardcodes the recognized cloud), backend/data persistence, auth/accounts, real location and weather data sourcing, feed moderation.
- Terminology to preserve: "구름 도감" (cloud dex), "관측" (observation), "포착" (a captured/registered cloud), star-rating rarity (★) plus the separate 일반/희귀/전설 label and bronze/silver/gold/holo card-tier system for dex entries.

## Brand Commitments

- Name: mongle / 몽글, from "몽글몽글," a Korean onomatopoeia for something soft and fluffy like a cloud. Unchanged across every visual revision so far.
- Mascot: the cloud-character concept is product truth (load-bearing on the name itself) and stays through every visual revision, though its on-screen role has shrunk from hero-scale to avatar-scale in the current generation. The illustration asset (`assets/mongle.png`) itself has never been redrawn — no image-generation tool has been available in this environment across any revision.
- Typeface: Pretendard (Regular–ExtraBold) remains the Korean-text backbone across every revision — non-negotiable, the product is Korean-first.
- **Visual history**: (1) original soft-pastel/gradient identity (blues/purples/pinks, glow shadows) — the store-launch baseline. (2) 2026-08-02: a full rebrand to a "National Park Poster" world was attempted and reverted same-day at the user's explicit request (found it uglier); pastel was restored. (3) 2026-08-02, same day: a second deliberate redesign, this time visually referencing a real external design system (github.com/1eehvunzin/personalweb — neutral warm-gray canvas, one blue point accent, black pill buttons, flat category swatches, soft neutral shadows) was requested and built; see current DESIGN.md for the resulting system. Palette and component language are therefore not casually fixed — but a *third* full visual swap should still be confirmed explicitly before starting, given how much churn this has already been.

## Evidence on Hand

- Full placeholder content exists for dex entries, feed posts, map pins, and a heatmap calendar (`constants/mock.ts`) — realistic-looking mock data, not real backend or user data.
- No user research, external design mock file, press, or testimonials are present in the repo. `constants/scale.ts` references measurements taken from "the design mock's phone frame," but no such mock file exists in the repository — treat the current implementation itself as the visual source of truth.

## Product Principles

1. The real-world capture always comes first — game and social layers reward and frame something the user actually did outside; they never replace or abstract it away.
2. Collecting stays legible at a glance: rarity, lock state, and progress must read clearly across dex, feed, and profile.
3. Every catch should produce something worth sharing outside the app — the story card is a first-class output, not an afterthought.
4. Voice is Korean-first, playful, warm, and low-pressure ("오늘의 하늘," "다시 찍어볼까?") rather than urgent or grindy.
5. Because this is heading toward a real store launch, brand assets (mascot, name, palette, Pretendard type) are fixed identity to preserve, not to redesign without a deliberate rebrand request.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established yet.
