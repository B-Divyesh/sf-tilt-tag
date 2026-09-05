# Tilt Tag repair 4 handoff — deployed and verified

## Outcome

The strict-review blocker is repaired. Score sharing, no advertising, no analytics, and no public leaderboards now each have one registry entry and one outcome-based browser test. All 23 declared claims pass independently from a clean checkout.

- Implementation SHA: `ad024613c95a6314048d087f6f9906faf8ab795c`
- Documentation revision: the later report-only commit containing this handoff; it does not change the deployed product image.
- Live URL: <https://tilt-tag.sociobot.in>
- Deployment target: existing Azure Static Web App `sf-tilt-tag`
- Build output: `dist/`

## Cold first screen

- Job: Tilt a magnet and tag every target in a 90-second run.
- Audience: Phone players who want one short browser challenge without an install.
- First action: **Try it with sample data**. The adjacent text says it opens the sample with touch and keys.
- Fresh 1440 × 900 desktop and 390 × 844 phone contexts showed the live board before scrolling. The phone movement pad ended at y=753 px inside the 844 px viewport.

## Repair

- Added `score-sharing`, `no-ads`, `no-analytics`, and `no-public-leaderboards` to `.factory/claims.json`.
- Added one tagged browser test per claim. The share test exercises both the system share payload and the clipboard fallback, using the displayed score and daily seed.
- The advertising test completes the one-click sample and observes rendered ad surfaces, frames, pop-ups, outbound promotion, and network resources.
- The analytics test instruments beacons, fetch, XHR, cookies, storage, request methods, and request paths through movement, pause, resume, and completion.
- The leaderboard test completes a run, rejects network writes and ranking UI, and proves that a second isolated browser cannot observe the first browser's saved result.
- Made the sharing result a polite live status so assistive technology announces success or failure.

## Clean-checkout verification

A detached clone of the implementation SHA started with no changed files and installed from the lockfile with `npm ci`.

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
```

Results on 2026-09-05 UTC:

- Every exact command in `.factory/claims.json` passed separately: 23/23.
- Registry audit found exactly one `@claim:<id>` tag for each of the 23 entries.
- `npm audit --omit=dev`: 0 vulnerabilities.
- ESLint and strict TypeScript: passed.
- Vitest: 6/6 passed.
- Playwright Chromium 1.58.2: 27/27 passed.
- Production build: JavaScript 34,093 B (11.09 kB gzip); CSS 16,147 B (4.49 kB gzip); fonts 69,852 B; mobile hero 11,204 B.

## Live verification

- Production deployment completed through the existing `sf-tilt-tag` configuration. No infrastructure, replica, storage, DNS, or billing settings changed.
- Live and local assets are byte-identical. JavaScript SHA-256: `e1331b0d112589673241f6694f66d44947365d3ee879bd5e838383d798b4c9a5`; CSS SHA-256: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- `verify-url.sh` passed over HTTPS in 812 ms with the correct title and language, one h1, a main landmark, complete image alt text, labelled buttons, and no console errors.
- The one-click sample showed the persistent demo label, sample best 1,850, and daily seed `39VPBR`. Reset removed a demo marker and preserved a distinct real-mode marker. **Start for real** left the demo without copying sample data.
- The deterministic run reached `You scored 0` and `The 90-second run is complete. You tagged 0 targets.` The real clipboard fallback copied the score, seed, and demo URL. **Play again** reset score to 0, shields to 3, and state to playing.
- A live recording and end-screen image are in `/work/.evidence/tilt-tag-repair-4/`.
- ArrowRight moved the magnet from x=180 to x=198.7. Phone touch moved it from x=180 to x=194.6. Escape paused the desktop run, and focus stayed in the pause dialog for 20 Tab presses.
- Inversion, seated mode, reduced motion, W A S D, calibration, beta offset 14.5, and gamma offset -6.25 persisted across reload.
- During live game flows, all 61 observed requests were GET requests to the Tilt Tag origin. Instrumented beacon, fetch, and XHR activity remained empty. No ad surface, public ranking control, or cross-origin request appeared.
- At 4× CPU throttling, game-loop work measured 1.429 ms average and 2.5 ms p95 against the 20 ms claim ceiling.
- Service-worker update completed with no waiting worker. A fresh phone context reloaded `/demo` offline and kept the game visible with the cached-files notice.
- Live Axe checks reported zero violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the designed 404. Keyboard focus showed a 3 px mint outline. Reduced-motion transitions were effectively instant at 0.01 ms.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles. `/missing-page` returned the designed page with the expected HTTP 404 and title.
- Mobile Lighthouse: performance 95, accessibility 100, best practices 100, SEO 100; FCP 0.98 s, LCP 1.51 s, CLS 0.0007.
- Live responses include HSTS, `nosniff`, `no-referrer`, self-only CSP with `frame-ancestors 'none'`, and camera, microphone, and geolocation denial. Hashed assets retain one-year immutable caching.

Evidence is in `/work/.evidence/tilt-tag-repair-4/`. The required catalog description was copied to `/work/.evidence/catalog-description.txt`.

## Earlier findings

All earlier findings remain repaired:

- The playable board and movement pad appear in the first phone screen.
- The measured game-loop-work claim passes locally and live.
- Setup, pause, settings, and end dialogs trap and restore focus.
- Accepted tilt calibration and center offsets persist after reload.
- Opening hazards keep a deterministic clear lane for every 2026 daily seed covered by the unit regression.
- Every advertised input, mode, audio, privacy, demo, sharing, and access promise has one registered claim test.
- Every visible phone header and footer navigation target is at least 44 × 44 CSS px.

## Scope and remaining follow-up

- Tilt Tag is a static, local-first game. Backend tenant isolation, SQLite restart persistence, server health, and HTTP 429 allowances do not apply.
- AI does not help the core job, so no AI service or key was added.
- The original generated observatory art and recorded provenance are unchanged.
- A physical iOS device is still needed to smoke-test the native motion-permission sheet. Automated Chromium covers unsupported motion, permission fallback, synthetic calibrated tilt, touch, and keyboard alternatives. No code or automated-test defect remains open.
