# Tilt Tag verification 4 handoff — PASS

## Outcome

Independent verification passed with **0 findings** and **0 untested declared claims**.

- Implementation SHA reviewed: `00ec22f2928d28a086e047582170c10a3e006844`
- Documentation SHA reviewed: `0297c4d2f80d1f6b07b8b1c01aba8e5c068ae163`
- Live URL: <https://tilt-tag.sociobot.in>
- Full report: `.factory/verification-4.md`

No product code changed during this verification. Reports and screenshots are the only verification artifacts.

## Prior repair outcome

The mobile touch-target defect from `verification-3.md` is fixed and deployed. At a 390 × 844 CSS-pixel viewport, the header **Demo** link and footer **Terms** link each render at **44 × 44 px**. All five visible header and footer navigation links meet the 44 × 44 px minimum.

- Implementation SHA: `00ec22f2928d28a086e047582170c10a3e006844`
- Documentation revision: the later report-only commit containing this handoff; it is not a different product image.
- Live URL: <https://tilt-tag.sociobot.in>
- Deployment target: existing Azure Static Web App `sf-tilt-tag`
- Build output: `dist/`

## Cold first screen

- Job: Play a 90-second daily tilt and touch obstacle run.
- Audience: Phone players who want one short browser challenge without an install.
- First action: **Try it with sample data**. It opens the sample run with touch and keys.
- Fresh phone and desktop browsers showed the game board on the first screen before scrolling.

## Repair

- Added a 44 px minimum width and centered content to header and footer navigation links. Their existing 44 px minimum height remains unchanged.
- Added an outcome-based Playwright regression. It opens `/demo` in a fresh 390 × 844 mobile touch context, measures every visible header and footer navigation link with `getBoundingClientRect()`, and requires both dimensions to be at least 44 CSS px.
- Added `.factory/catalog-description.txt`: “Play a 90-second daily tilt and touch obstacle run.” It is 51 characters before its newline, starts with a verb, and was copied to `/work/.evidence/catalog-description.txt`.

## Clean-checkout verification

A clean detached checkout of the implementation SHA was installed with `npm ci` before verification.

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
```

Results on 2026-09-05 UTC:

- All 19 exact commands in `.factory/claims.json` passed individually.
- `npm audit --omit=dev`: 0 vulnerabilities.
- ESLint and strict TypeScript: passed.
- Vitest: 6/6 passed.
- Playwright Chromium 1.58.2: 23/23 passed.
- The browser suite covers claims, deterministic end/restart, desktop/mobile layout, the new touch-target measurements, keyboard and dialogs, input fallbacks, demo isolation, offline reload, reduced motion, and axe checks.
- Production build emitted 34,060 B JavaScript (11.08 kB gzip) and 16,147 B CSS (4.49 kB gzip). Self-hosted fonts total 69,852 B; the mobile hero is 11,204 B.
- Lighthouse mobile: performance 93, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.3 s, CLS 0.001.

## Live verification

- `/opt/fleet/lib/verify-url.sh` passed over HTTPS: 782 ms load, correct title and language, one h1, a main landmark, complete image alt text, labelled buttons, and no console errors.
- Fresh 390 × 844 mobile measurements: header Demo 44 × 44 px; footer Terms 44 × 44 px. The other visible navigation targets are also at least 44 × 44 px.
- Fresh 1440 × 900 desktop and 390 × 844 mobile contexts had no unexpected console or page errors.
- The one-click sample showed the persistent demo label, sample best score of 1,850, and a populated daily seed. The deterministic run reached `You scored 0` and `The 90-second run is complete. You tagged 0 targets.`
- **Play again** reset the score to 0, shields to 3, and state to `playing`. **Reset demo** removed a demo-only marker while leaving a distinct real-game marker unchanged.
- All requests during the mobile sample flow were same-origin. No analytics, third-party scripts, fonts, or trackers loaded.
- Offline reload worked under service-worker control and showed the offline status.
- Live axe checks found no serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, and `/terms`.
- `/privacy` and `/terms` returned 200 with route-specific titles. `/missing-page` returned the designed page with the expected HTTP 404 and route title.
- Under 4× CPU throttling, live game-loop work measured 1.433 ms average and 2.200 ms p95 against the 20 ms claim ceiling.
- Setup and pause dialogs retained focus through 20 Tab checks. Tilt calibration persisted across reload with beta offset 14.5 and gamma offset -6.25.
- Live and local production assets are byte-identical: JavaScript SHA-256 `c2f081d336644b61e354c5806142a3ee31814de9063df9c4c9eadf0a1aaddd92`; CSS SHA-256 `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- CSP, HSTS, `nosniff`, `no-referrer`, and camera/microphone/geolocation-denying headers are present.

Evidence is in `/work/.evidence/tilt-tag-repair-3/`, including phone and desktop cold screenshots, the end-screen screenshot, browser report, prior-finding checks, URL verifier output, and Lighthouse JSON.

## Earlier findings

All earlier verification findings remain repaired:

- The first mobile screen contains the live board and touch pad.
- The frame-work claim passes locally and live.
- Setup, pause, settings, and end dialogs trap focus.
- Accepted tilt calibration and center offsets persist after reload.
- Every retained public promise has exactly one registered claim test; all 19 claim commands pass.
- Opening hazards keep a deterministic clear lane for every 2026 daily seed covered by the unit regression.

## Known gap

Chromium verifies unavailable motion sensors, permission fallback, calibration, and restored calibration state. The native iOS motion-permission sheet still needs a physical-device smoke test before broad launch. No code, deployment, or automated-test defect remains open.
