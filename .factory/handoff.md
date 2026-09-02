# Tilt Tag repair handoff — ready to deploy

## Outcome

The release blocker in independent verification report `verification-2.md` is repaired. The claims registry now has one precise, observable, tagged regression test for every advertised input and privacy promise. The game remains a static Vite + TypeScript browser game with its existing daily run, local-first storage, demo, keyboard, touch, tilt, audio, and offline behavior.

## Repairs

- Added seven one-to-one claim entries and browser tests: calibrated tilt, movement-pad pointer/touch control, Arrow and W A S D modes, Escape pause, user-gesture audio with persisted mute, demo reset/isolation, and no third-party resources.
- Each entry in `.factory/claims.json` now appears exactly once as an `@claim:<id>` test. The registry has 19 entries and the exact-count check reports 19/19.
- Fixed a date-dependent opening-spawn defect found while re-running the complete suite: the active opening hazards now keep a 140 px clear lane around the starting magnet. This prevents a daily seed from taking a shield before the player can act. A deterministic unit regression checks every day in 2026.
- Reproduced the verifier’s original failure before editing: `npx playwright test --grep '@claim:tilt-control'` reported `No tests found` on the candidate.

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

- `npm ci` and `npm audit --omit=dev` passed; audit found 0 vulnerabilities.
- ESLint and strict TypeScript passed.
- Vitest passed 6/6, including the 366-day deterministic opening-lane regression.
- Playwright Chromium 1.58.2 passed 22/22. This includes every registered claim, desktop/mobile layout, keyboard, dialog focus, accessibility, offline reload, and privacy paths.
- The full registry count check reports exactly one `@claim:` test for each of all 19 claims.
- Production build emitted `dist/`: JavaScript 34,060 B / 11,082 B gzip; CSS 16,071 B / 4,479 B gzip.
- Playwright’s axe integration found no serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the 404 route.
- `verify-url.sh` passed locally for `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`: correct title/lang, one h1, main landmark, alt text, labelled buttons, and zero console errors. The preview’s deliberate SPA fallback returns 200 for `/missing-page`; the deployed Static Web Apps response override supplies its HTTP 404 status.
- The standalone `@axe-core/cli` could not start because this worker image has no system Chrome binary. The shipped Playwright axe integration uses the provisioned Chromium and completed successfully.

## Deployment

- Target: Azure Static Web App `sf-tilt-tag` in resource group `sociobot`.
- Public URL: `https://tilt-tag.sociobot.in`.
- Build output: `dist/`.

## Known gap

Automated Chromium covers unavailable motion sensors and calibration restoration. The native iOS motion-permission sheet still needs a physical-device smoke test before broad launch.
