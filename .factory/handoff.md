# Tilt Tag review 2 handoff

## Result

**FAIL** — implementation `b205988b415d70a878f736ece3f29432f114030a` is live at <https://tilt-tag.sociobot.in>. Documentation baseline reviewed: `5f102f2ee0ff3762325350eb605030625092b803`.

There are two findings and zero untested public claims. The sound toggle fails the Label in Name check because visible **Sound on/off** text is absent from its accessible **Mute sound/Turn sound on** name. The 404 and paused-dialog headings use metaphor or mood copy instead of naming the state.

No product code was changed during this review.

## How to verify

From a clean checkout of the implementation:

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm run build
npm test
```

Run all 24 exact commands in `.factory/claims.json`. This review passed all 24 separately, plus Vitest 6/6 and Playwright 28/28. The build emitted 34.24 kB JavaScript and 16.15 kB CSS.

Live verification covered fresh desktop and phone first screens, demo isolation and exit, a recorded deterministic result and restart, keyboard/focus and motion-unavailable recovery, every route, offline/update, reduced motion, privacy traffic, security headers, live asset hashes, Axe, and Lighthouse. The 4× throttled live game-loop work was 1.282 ms average and 2.0 ms p95.

## Required repairs

1. Make the sound control's accessible name contain its visible **Sound on/off** text while retaining a clear action.
2. Rename **This target is out of range** to a direct 404 heading and **Take your time** to a direct paused-state heading.
3. Add regressions for the label-in-name rule and the plain-words heading audit, then rerun the review.

Evidence: `/work/.evidence/tilt-tag-review-2/` and `.factory/review-2.md`.
