---
name: mongle
description: A restrained, information-forward cloud-collecting dex, referencing github.com/1eehvunzin/personalweb
colors:
  bg: "#F5F4F1"
  card: "#FFFFFF"
  card-alt: "#EAE9E5"
  border: "#E1DFDA"
  ink: "#1C1C1E"
  sub: "#75747A"
  sub-muted: "#8B897F"
  blue: "#3E6DAE"
  blue-tint: "#DCE8F7"
  common: "#3E6DAE"
  rare: "#7558B0"
  legendary: "#805E1D"
  rose: "#C06F92"
  green: "#5E9E74"
  bronze: "#B08258"
  silver: "#A6A49B"
  gold: "#805E1D"
typography:
  headline:
    fontFamily: "Pretendard-Bold"
    fontSize: "24-26px base"
    fontWeight: 700
    letterSpacing: "-0.3px"
  title:
    fontFamily: "Pretendard-Bold / Pretendard-SemiBold"
    fontSize: "13-19px base"
    fontWeight: 700
  body:
    fontFamily: "Pretendard-Regular / Pretendard-Medium / Pretendard-SemiBold"
    fontSize: "11.5-14px base"
    fontWeight: 400
  label:
    fontFamily: "Pretendard-SemiBold / Pretendard-Bold"
    fontSize: "9-12.5px base"
    fontWeight: 600
rounded:
  sm: "9-11px base"
  md: "14px base"
  lg: "16-22px base"
  full: "pill (buttons, avatars, medallions)"
spacing:
  xs: "4px base"
  sm: "8-9px base"
  md: "12-14px base"
  lg: "16px base"
  xl: "18-22px base"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
    typography: "{typography.body}"
    rounded: "full"
    padding: "15px 24px"
  button-primary-disabled:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
    rounded: "full"
    padding: "15px 24px"
  segmented-track:
    backgroundColor: "{colors.card-alt}"
    rounded: "{rounded.sm}"
  segmented-active:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "9px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "14px"
    padding: "14px 16px"
---

# Design System: mongle

## Overview

**Creative North Star: "The Editorial Dex"**

mongle's second visual generation trades the original's soft pastel-glow-everywhere language for the restraint of a well-made personal site: a warm neutral canvas, one blue "point" color doing all the interactive work, black pill buttons for primary actions, and small flat color swatches — not saturated gradients — carrying category meaning. It is directly informed by a real reference the user pointed at (github.com/1eehvunzin/personalweb, a macOS-window-styled portfolio that becomes a native iOS app below the desktop breakpoint): not copied wholesale — mongle stayed a native app, not a desktop-chrome simulation — but its actual visual language (palette discipline, flat swatches, pill buttons, soft neutral shadows, information-dense two-column and row layouts) was adopted directly, and its own mobile-breakpoint patterns (bottom sheet with a grabber handle, active-tab background pill) were lifted as-is since mongle already is the native context those patterns describe.

The mascot and the collecting mechanic survive — they are product truth, not decoration — but the mascot's role shrank from "dominant hero visual on every screen" to "a small avatar-scale presence," consistent with the reference's own restraint. Color still carries the rarity system (일반/희귀/전설), but as small solid swatches and dots beside neutral-colored text, not as saturated text or gradient fills — a direct, deliberate craft lesson pulled from the reference (colored text on a light ground reads worse and was a repeat finding across this project's own past audits).

**Key Characteristics:**
- **The core triad — ink black, sky blue, white — user-confirmed as the system's defining combination.** Every screen is built from these three; every other hue (rarity swatches, rose, green) is a deliberately minor accent layered on top, never a replacement for the triad.
- Neutral warm-gray canvas (`#F5F4F1`), white cards, one blue "point" accent — restraint over saturation
- Black ink cards/pills for the highest-weight moments (streak hero, primary buttons); blue for the sky/weather hero and every interactive element; white for the base surface everything else sits on
- Rarity and category meaning carried by small flat swatches/dots beside neutral text, never by colored text itself
- Soft neutral (never colored) drop shadows — low opacity, moderate blur — except the sky-blue hero, which is the one deliberately saturated, colored-shadow surface
- Hero + horizontal-rail composition on the two daily-glance screens (home, profile): one dominant card up top, everything else in a swipeable strip beneath it — not a uniform vertical card stack
- Weather condition drives the hero's gradient color (`weatherGradientFor`, iOS-Weather-style) — clear = sky blue, with cloudy/rain/sunset variants ready as the app gains real weather data

## Colors

### Primary
- **Blue** (`#3E6DAE`, tint `#DCE8F7`): the only interactive/CTA-adjacent color — links, active tab/segment states, the camera FAB, focus borders. Doubles as the 일반(common) rarity swatch — "common" reads as "the app's own default," which fits.

### Rarity / Category (flat swatches, not text fills)
- **Rare** (`#7558B0`): 희귀 rarity swatch and dot.
- **Legendary / Gold** (`#805E1D`): 전설 rarity swatch and dot; shared with the gold card-finish tier.
- **Rose** (`#C06F92`) / **Green** (`#5E9E74`): available secondary accents (map pins, tags) — not yet load-bearing on a specific mechanic.
- **Bronze / Silver** (`#B08258` / `#A6A49B`): card-finish tier outlines, independent of the rarity trio above.

### Neutral
- **Bg** (`#F5F4F1`): base screen canvas — warm, not stark white, not the old cool blue-gray.
- **Card** (`#FFFFFF`) / **Card Alt** (`#EAE9E5`): surface and secondary/track surface.
- **Border** (`#E1DFDA`): the system's only separator — thin 1px hairlines replace the old system's shadow-driven card edges.
- **Ink** (`#1C1C1E`): primary text and every primary button's fill.
- **Sub** (`#75747A`) / **Sub Muted** (`#8B897F`): secondary and tertiary text.

### Named Rules
**The Core Triad Rule.** Ink black, sky blue, and white are the system's defining combination — confirmed directly by the user as the identity to build toward. Every screen's dominant surfaces should read as this triad first; rarity/category hues are minor accents on top of it, never a fourth co-equal color.
**The Swatch, Not Text Rule.** Rarity and category color never colors text directly — it lives in a small solid dot or square beside neutral-colored (ink/sub) text. This is a direct, contrast-motivated lesson from the reference: colored text on a light ground reads worse and is harder to keep accessible than a swatch-plus-neutral-label pair.
**The One Gradient Rule.** Each surface gets at most one gradient moment (the home/story-card hero, colored by `weatherGradientFor` on the home screen). Everywhere else is flat.

## Typography

Pretendard remains the typeface — Korean-first product, non-negotiable — but the hierarchy is calmer than the previous system: fewer extrabold-everywhere moments, more of the weight budget spent on genuine emphasis (numbers, primary titles) with body copy sitting at regular/medium weight throughout.

### Hierarchy
- **Headline** (Bold/700, 24–26px base, −0.3px tracking): top-of-screen tab titles.
- **Title** (Bold–SemiBold/700, 13–19px base): card and stat titles.
- **Body** (Regular–SemiBold/400, 11.5–14px base): running copy, meta rows.
- **Label** (SemiBold–Bold/600, 9–12.5px base): badges, chips, timestamps.

## Layout

Structural patterns replacing the prior system's uniform full-width card stack:

- **Hero + horizontal rail** (home, profile): one dominant, tall card owns the top of the screen — today's sky on home, identity + streak on profile — and every secondary stat/item lives in a single swipeable horizontal strip beneath it, not a vertical stack of cards. This is the default composition for a "daily glance" screen; it was a deliberate structural reroll away from the safer stacked-card layout, not just a palette change.
- **Row/timeline lists**: the map screen's "내 주변 기록" and similar chronological content use a compact row (swatch dot + title + meta + trailing value) instead of a padded card per item.
- **Spotlight header**: a collection-browse screen (dex) keeps its grid — the task genuinely wants a grid — but leads with a dark spotlight card calling out the newest/featured item before the grid starts.

`rs()` scaling and the 16px horizontal margin convention are unchanged from prior generations.

## Elevation & Depth

Soft **neutral** shadows only — the reference's technique, not the previous system's hue-tinted glow.

- **Default card elevation**: `shadowColor: #000`, low opacity (0.1), moderate radius (16px), reserved for cards that need to visually lift (the map "locate me" button, dex cards on press). Most cards use a 1px `border` hairline instead of a shadow at all — the reference's actual preference (borders over shadows for static cards; shadow only for the rare floating/interactive element).
- **The one exception**: the blue gradient hero (home weather card, story card) keeps a soft shadow tinted to blue at low opacity, since it's the system's one deliberately saturated surface.

### Named Rules
**The Border-Over-Shadow Rule.** A static card gets a 1px `border` hairline, not a shadow. Shadow is reserved for elements that visually float or lift on interaction.

## Shapes

Moderate, consistent rounding — softer than the reference's own sharper corners (mongle keeps some warmth) but far more restrained than the prior system's 20–30px cards. Cards run 14–16px radius, buttons are full pills, avatars and swatches are circular/rounded-square respectively.

## Components

### Buttons
- **Primary:** solid ink-black pill, white bold label, no border, no shadow. Pressed state drops to 0.85 opacity. This is the system's only filled-button style — matching the reference's Email/GitHub/LinkedIn button language exactly.

### Segmented Control
- **Track:** `card-alt` rounded rectangle. **Active segment:** white pill with a soft neutral shadow, inactive segments transparent with muted-gray or role-colored text (role colors here are the deepened, contrast-safe rarity tokens, not the light swatch tones).

### Dex Card
- **Corner Style:** 14px radius, 1.5px outline in the card's finish-tier color.
- **Rarity display:** a small colored dot beside the cloud type, star count in neutral gray — not colored star text.
- **Signature behavior:** holo-finish cards keep the `Sheen` light-sweep motion device, unchanged from prior generations (a motion signature independent of the palette shift).

### Tab Bar
- **Style:** frosted-glass bar (`rgba(247,246,244,0.92)` + blur, 1px top border) — the reference's exact mobile tab-bar recipe. The active tab gets a soft rounded ink-tint background pill (`rgba(28,28,30,0.055)`) behind its icon+label, not just a color change.
- **Camera FAB:** the one saturated blue circle in the nav layer — the system's single "primary action" moment.

### Bottom Sheets (capture, discovery)
- **Grabber handle:** a small rounded bar at the top of every bottom-anchored sheet, directly lifted from the reference's mobile detail-sheet pattern.

### The Story Card
Still the shareable poster output, still reused at three scales (share screen, feed embed, discovery-reveal card) — now rendered in the one-gradient-moment blue rather than a three-stop pastel blend, with the rarity tag as a solid `rare`-swatch pill instead of a translucent one.

## Do's and Don'ts

### Do:
- **Do** treat ink black / sky blue / white as the confirmed core triad — every new screen's dominant surfaces should read as this combination first.
- **Do** use blue exclusively for interactive elements; category/rarity color lives in swatches, not text or buttons.
- **Do** give every primary action the same black pill button — no second button language.
- **Do** default to a 1px border for static cards; reserve shadow for elements that lift.
- **Do** keep the mascot present but avatar-scale, not hero-scale.
- **Do** reach for a hero + horizontal-rail composition on daily-glance screens before defaulting to a vertical card stack.

### Don't:
- **Don't** color body text with a rarity/category hue directly — pair a neutral label with a swatch instead.
- **Don't** introduce a second gradient moment on a screen that already has one.
- **Don't** revert to the old hue-tinted glow shadow system.
