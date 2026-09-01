# Tilt Tag repair handoff

## Outcome

Release blockers from independent report commit `f847d7d` are repaired. The product remains a Vite and TypeScript static browser game. The researched brief, daily deterministic layout, 90-second run, three shields, demo isolation, local progress, touch, keyboard, tilt, and offline behavior remain intact.

## Repairs

- Replaced the unreliable browser-scheduling claim with the narrower, observable claim: average game-loop work stays under 20 ms under 4× CPU throttling. The test measures simulation, Canvas rendering, and HUD work across 90 frames. One measured run was 0.812 ms average and 1.500 ms p95; five repeated claim runs passed.
- Put a running deterministic Canvas game and its touch pad in the cold home screen. At 390 × 844, the Canvas begins at y=602.67 and the complete touch pad occupies y=676.98–752.98. Horizontal overflow is 0 px.
- Added wrapping Tab and Shift+Tab focus traps to setup, tilt, pause/resume, settings, and end dialogs. Closing a dialog restores focus to its opener, or to the game instrument when no opener exists. Dialog controls retain native arrow-key behavior.
- Persisted accepted tilt calibration and its beta/gamma center offsets. The browser test calibrates to beta `14.5` and gamma `-6.25`, pauses, reloads, and verifies the calibrated tilt mode and both offsets.
- Added one browser regression covering title → sample play → real end screen → restart, Arrow-key movement, pointer/touch-pad movement, unavailable-tilt messaging, and touch/key fallback.
- Bumped the service-worker cache to `tilt-tag-v2` so the repaired shell replaces the previous cached release.
- Added ESLint and explicit lint/typecheck scripts. Playwright now refuses to reuse an unrelated development server, preventing false offline results.
- Updated the privacy and README text to disclose stored center offsets while distinguishing them from unsaved live orientation readings. Updated claims, copy audit, and visual thesis to match the shipped behavior.

## Verification evidence

Run from `/work/repo`:

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
```

Clean local results on 2026-09-01 UTC:

- `npm ci`: passed; `npm audit --omit=dev`: 0 vulnerabilities.
- ESLint: passed with 0 errors; strict TypeScript: passed.
- Vitest: 5/5 passed.
- Playwright Chromium 1.58.2: 15/15 passed. This includes every `.factory/claims.json` command and the new mobile, focus, calibration, deterministic-flow, touch, keyboard, and fallback coverage.
- Frame-work claim repeated five times at 4× CPU throttling: 5/5 passed. Recorded sample: 0.812 ms average, 1.500 ms p95 against the 20 ms ceiling.
- Production build: `dist/` emitted; JS 33.95 kB / 11.02 kB gzip, CSS 16.07 kB / 4.48 kB gzip. Self-hosted fonts total 69.85 kB; mobile hero is 11.20 kB.
- External axe-core CLI 4.10.3: 0 violations on `/`, `/play`, and `/demo`. The Playwright axe sweep also covers `/privacy`, `/terms`, and the designed 404, with no serious or critical findings.
- Lighthouse mobile: performance 93, accessibility 100, best practices 100, SEO 100; FCP 1.1 s, LCP 1.5 s, CLS 0.001.
- Desktop 1440 × 900 and mobile 390 × 844 production previews: no console/page errors, no horizontal overflow, and no cross-origin requests.
- Offline claim: a fresh isolated context loaded `/demo`, waited for the `tilt-tag-v2` shell, went offline, reloaded, and remained playable with the offline status shown.

The verifier’s original exact command, `npx playwright test --grep '@claim:frame-rate'`, was run before edits. It passed once in this worker, while the independent verifier recorded a reproducible 36.469 ms requestAnimationFrame interval. That variance is why the repaired claim no longer equates browser callback scheduling with the game’s own frame cost.

## Deployment

- Target: Azure Static Web App `sf-tilt-tag` in resource group `sociobot`.
- Public URL: `https://tilt-tag.sociobot.in`.
- Build output: `dist/`.
- Repair commits: `b93a7a5` (product and regression repairs) and `50c815d` (explicit SPA routes and real 404 response).
- Deployed to the production environment with Static Web Apps CLI 2.0.10. The platform deployment URL is `https://calm-coast-0143b3410.6.azurestaticapps.net`.
- `/opt/fleet/lib/verify-url.sh https://tilt-tag.sociobot.in …`: passed with HTTP 200, 769 ms load, title and `lang`, one h1, main landmark, zero missing alt text, zero unlabeled buttons, and zero console/page errors.
- Local/live asset identity matched exactly: JS SHA-256 `a7de5789f35be15701e1bff7fe534f76db9b70ba963c7634ade27a53679bc5e9`; CSS SHA-256 `f7d2e5a864922674bd0c0269d596a9628c370f9f3281eb63a8eb2484913b5818`.
- Live browser checks passed at 390 × 844: game and pad in the first viewport, end screen and restart, dialog focus trap, stored/restored beta `14.5` and gamma `-6.25` offsets, offline reload, no console errors, and no cross-origin requests.
- Live axe-core CLI: 0 violations on `/`, `/play`, and `/demo`.
- Live routes `/`, `/demo`, `/play`, `/privacy`, and `/terms` return 200. An unknown route returns the designed 404 page with HTTP 404.
- Live responses include self-only CSP, HSTS, `nosniff`, `Referrer-Policy: no-referrer`, motion/camera/location `Permissions-Policy`, and immutable one-year caching for hashed assets.

## Known gap

Automated Chromium verifies permission denial/unavailability and calibrated-state restoration. The native iOS motion-permission sheet still needs a physical-device smoke test before a broad launch.
