# Feed pile grouping — parked idea

**Status:** Rolled back 2026-08-03 at user request ("일단 롤백"). Not present in
current code. This note exists so the idea and its hard-won implementation
notes aren't lost if it comes back later.

## The idea

When the feed has multiple posts of the *same cloud type* (e.g. three
양떼구름 catches), collapse them into one "pile" card instead of listing
each separately:

- **Collapsed cover card** (stands in for the group):
  - Weather badge drops the cloud name, showing only condition + temp
    (e.g. "맑음 · 22°").
  - The info row (normally avatar + nickname) instead shows the **cloud
    name in bold, no avatar** — the cover represents the cloud, not a person.
  - Top-right badge replaces a plain count ("3장") with a playful line:
    `{cloud}을 {count}번이나 찍었음!!` (e.g. "양떼구름을 3번이나 찍었음!!").
  - A couple of card-edge slivers peek out from behind the cover at
    mismatched angles/offsets, for a genuinely messy stack rather than a
    tidy aligned one.
  - Tapping the cover unfolds the group.
- **Expanded state**: every post in the group renders as an ordinary post
  card — avatar, nickname, full weather badge (with cloud name) — exactly
  like a standalone feed post. A small pill ("{cloud} {count}개 접기") sits
  above the list to re-collapse.
- **Standalone posts** (no other post shares that cloud type) are unaffected
  — same card as always.

## Implementation shape (last working version)

All in `app/(tabs)/feed.tsx`:
- `groupFeedsByCloud(feeds)` — groups the flat `feeds` array by `.cloud`,
  preserving first-appearance order.
- `FeedCard({ item })` — the original single-post card (avatar, nickname,
  full weather badge). Reused for standalone posts *and* for every post
  inside an expanded pile, so expanding never feels like a different
  feature.
- `FeedPileCover({ group, onPress })` — the collapsed summary card described
  above.
- `FeedGroup({ group })` — stateful (`useState` expanded/collapsed) switch
  between `FeedPileCover` and the expanded list of `FeedCard`s + collapse
  pill.

## Hard-won gotcha: don't anchor the stacked peek to the top

The first instinct is to rotate a full-card-width `View`/`ImageBackground`
and offset it upward so it peeks out above the cover card (like the
`assets/ref/pile1.jpg` / `pile2.jpg` references). Two things bite you:

1. **Rotating a very wide element produces a huge corner lift.** The visual
   displacement at the far corner is roughly `(width / 2) × sin(angle)`. On
   a real phone-width card (~350–400px) a 2–3° rotation lifts the corner by
   a reasonable ~10–13px. But this repo's screenshot-verification flow runs
   Expo *web* in a desktop Chrome window, where the card stretches to the
   full (much wider, ~1600px+) viewport — the same rotation there produces
   a ~50px+ corner lift, which reads as broken rather than "irregular."
   **Don't judge this effect's rotation/offset values from a wide desktop
   web screenshot; the math only looks right at real phone widths.**
2. **The feed header uses `position: sticky` only on web**
   (`Platform.OS === 'web' ? { position: 'sticky', ... } : null` in
   `feed.tsx`). On web, that opaque sticky header can fully hide a peek that
   protrudes upward from the very first card in the list. This isn't an
   issue on native (no sticky header there), but it means a web screenshot
   of the first card can show "nothing" even when the layering is correct.

The fix that actually worked reliably (including in the web
screenshot-verification flow): anchor the peeking slivers to the **bottom**
of the cover card instead (`bottom: rs(-N)`, extending down into the empty
`marginBottom` gap before the next card). That gap is guaranteed empty
regardless of scroll position or platform, so the peek is never occluded.
Use asymmetric left/right insets and small opposing rotation angles
(~1.5–3°) on the two sliver layers for the "irregular" look, rather than a
perfectly mirrored/symmetric pair.

## Mock data

`constants/mock.ts` `feeds` array had two extra `양떼구름` entries added
temporarily to demo the grouping (3 total). Reverted back to the original 3
distinct-cloud entries when this was rolled back.
