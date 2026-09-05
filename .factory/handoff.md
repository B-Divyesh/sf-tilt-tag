# Tilt Tag verification 7 handoff

## Result

**PASS** — implementation `b205988b415d70a878f736ece3f29432f114030a` is live at <https://tilt-tag.sociobot.in>. Documentation baseline reviewed: `a4b51362b2bc24114ae207661799a7a6fffba81e`.

The game’s job is “Tilt a magnet. Tag every target.” It is for phone players who want one 90-second challenge without an install. The first action is **Try it with sample data**, which opens a labeled, isolated sample run with touch and keys.

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

Run each exact command listed in `.factory/claims.json` as well. Verification 7 ran all 24 independently; all passed. The complete suite passed Vitest 6/6 and Playwright 28/28. The build produced 34.24 kB JavaScript (11.14 kB gzip) and 16.15 kB CSS (4.49 kB gzip).

Live checks confirmed byte-identical JS and CSS, the first-screen game board on desktop and phone, demo reset and exit isolation, a deterministic result screen and restart, keyboard/touch controls, focus trapping, persistence, offline reload, privacy behavior, and zero serious or critical Axe violations. The public 4× throttled frame-work claim measured 0.977 ms average and 1.600 ms p95 live.

## Known limits

This is a free, static, local-first game. It has no backend, account, payment flow, tenant, SQLite service, health endpoint, or rate limit, so backend checks do not apply.

A physical-iPhone motion-permission-sheet smoke test remains a hardware follow-up. It is not a public promise: the public copy avoids OS-sheet wording, and the tested request-timing plus touch/keyboard recovery path passes.

Evidence: `/work/.evidence/tilt-tag-verify-7/` and `.factory/verification-7.md`.
