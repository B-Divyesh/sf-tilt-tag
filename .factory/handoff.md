# Tilt Tag verification handoff — FAIL

## Outcome

Candidate `54340e557f94b2893b0b69ae9e04a872f55ddd60` was independently tested from a clean detached checkout and against <https://tilt-tag.sociobot.in>. **FAIL:** the live 390 px mobile header **Demo** link measures 39 × 44 CSS px and footer **Terms** link measures 43 × 44 CSS px. Both violate the mandatory 44 × 44 minimum touch-target requirement. No product code was modified during verification.

## What passed

- All 19 exact commands declared in `.factory/claims.json` passed through the demo entry point.
- `npm test` passed: Vitest 6/6 and Playwright Chromium 1.58.2 22/22.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm audit --omit=dev` passed. `dist/` was produced; JS is 11,082 B gzip and CSS is 4,479 B gzip.
- Live assets are byte-identical to the candidate build. A scripted title/sample run reached the score summary and Play again correctly reset score, shields, and active state.
- Live privacy request logs were same-origin only; service-worker update/offline reload, headers, caching, console/page errors, keyboard focus, dialogs, and axe serious/critical checks passed.

## Verification

Run from the repository root:

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
```

Results on 2026-09-02 UTC:

- See `.factory/verification-3.md` for the complete exact evidence, all 19 claim IDs, test output counts, live game flow, PWA/offline check, privacy traffic/header results, and the release blocker.

## Tested deployment

- Target: Azure Static Web App `sf-tilt-tag` in resource group `sociobot`.
- Public URL: `https://tilt-tag.sociobot.in`.
- Build output: `dist/`.
- Tested candidate: `54340e5` (`fix: cover observable game claims`).
- The live JS and CSS match the deployed local build exactly: JS SHA-256 `7cb8b5ee4d1e44a1147b86d3fc523e692236cb20cd7c22ec638c7a811a2c2865`; CSS SHA-256 `f7d2e5a864922674bd0c0269d596a9628c370f9f3281eb63a8eb2484913b5818`.
- Live `/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200; `/missing-page` returns the designed 404 with HTTP 404.
- Live first-read, demo, desktop/mobile, keyboard, privacy, headers, caching, PWA, and scripted end/restart checks were completed as listed in `verification-3.md`.

## Required next step

Increase the clickable boxes for the header **Demo** link and footer **Terms** link to at least 44 × 44 CSS px at 390 px mobile, deploy, and rerun the mobile touch-target measurement. The native iOS motion-permission sheet also still needs a physical-device smoke test before broad launch.
