---
timestamp: 2026-08-22T03-52-26Z
slug: summoner-app-app-components
---
# Design Critique — Summoner App (UI + UX audit)

Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Specificity Verdict
The skin is unmistakably LoL (exact Riot palette #010A13/#C8AA6E/#F0E6D2, real rank/mastery art, correct domain copy) but the composition skeleton is a generic template (centered hero + card-grid sections, Poppins typeface). ~70% specificity: highest in color/art/copy, lowest in composition/typography.

## Heuristic Scores (Nielsen)
1. Visibility of System Status: 3 — layout-mirroring skeleton good; zero in-place feedback on search submit.
2. Match System / Real World: 4 — "Summoner, LP, Solo/Duo, Flex" all correct; "1.5 Mill." should be "1.5M".
3. User Control and Freedom: 3 — reset/back exist; no search from player page (core loop dead-ends).
4. Consistency and Standards: 3 — disciplined tokens; two product names ("Summoner Stats" vs "League Summoner Search"); two animation languages (custom fade-up vs tailwind pulse).
5. Error Prevention: 3 — empty submit ignored; no example hint or name-format guidance before 404.
6. Recognition Rather Than Recall: 4 — icons/badges/emblems are pure recognition.
7. Flexibility and Efficiency of Use: 2 — no accelerators: no shortcut, no header search, no recent players.
8. Aesthetic and Minimalist Design: 3 — clean rhythm; duplicate level datum (pill + subtitle); decorative blur orbs are template warmers.
9. Error Recovery: 2 — 404 copy excellent; raw error.message rendered to users ("RIOT_API_KEY is not configured on the server."); 429 has no retry guidance.
10. Help and Documentation: 1 — no tooltips, no explainer for LP/mastery, no season context.
Total: 28/40 — Good (address weak areas).

## Cognitive Load
7/8 pass. Progressive disclosure FAILS: data already fetched but never surfaced (chestGranted, tokensEarned, miniSeries, hotStreak in lib/types.ts).

## Emotional Journey
Peak: profile header recognition beat + staggered mastery-card reveal. Valleys: raw server-config error on any lookup; silent dead beat after clicking Search; 404 offers no alternative action. Reassurance: layout-mirroring skeleton; honest 429 copy.

## Strengths
1. Faithful, disciplined LoL design tokens + real Riot art.
2. Layout-mirroring loading skeleton (no layout shift, predicts the page).
3. Restrained, accessible motion system (one 450ms entrance, 160ms press, reduced-motion honored).

## Priority Issues
- P0 — Raw server error leaks to users (error.tsx renders error.message verbatim; today that is "RIOT_API_KEY is not configured on the server."). Fix: map RiotApiError statuses to friendly copy; log technical message, never render it.
- P1 — Core loop dead-ends: from any player page the only way to search another name is logo → home → type → submit. Fix: compact search in sticky header.
- P1 — Zero feedback on search submit (no disable, no pending state). Fix: useTransition + "Searching…" button state.
- P2 — Duplicated datum in hero: "Level 427" pill + "Summoner level 427" subtitle. Fix: keep pill, subtitle carries different info (region/account age).
- P2 — Two product names in metadata ("Summoner Stats" vs "League Summoner Search").

## Persona Red Flags
- Alex (power user): no shortcuts, no recent players, 3-step re-search, 60s cache serves stale data with no freshness indicator, fetched-but-hidden data (chest/tokens/miniSeries).
- Jordan (first-timer): no example ("Try: Doublelift"), empty submit silently does nothing, "Unranked this season" has no season context, 2-digit year ambiguous, brand stated 3x on one viewport.
- Sam (accessibility): animate-pulse skeleton not reduced-motion gated, search input has no accessible name, 11px "Last played" contrast borderline (~4.5:1), level pill has no alt.

## Minor Observations
- Ambient blur orbs fight Riot's flat procedural aesthetic.
- Poppins is the generic SaaS geometric; Riot's voice is Beaufort (display)/Spiegel (UI).
- Mastery badge overlap is the most charming detail — protect it from clipping.
- 404 button could offer suggestions instead of repeating the same action.
- No favicon defined.
- Player name H1 truncates; LoL names need full display.

## Provocative Questions
1. What is the job this tool does that the Riot client doesn't? Speed of lookup → re-search loop and silent submit are the product missing its point.
2. chestGranted/tokensEarned/miniSeries/hotStreak fetched and never rendered — dead weight or a progressive-disclosure layer ("1 game from M7")?
3. "Unranked this season" is the most common empty state — whisper or confident "Go place!" moment?
4. Gold means three things at once (brand, interactable, achievement) — which should the Search button wear?
