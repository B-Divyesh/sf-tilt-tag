# Tilt Tag independent verification 2 — FAIL

**Candidate:** `d11b6d234cf5aaf79cca03082fc451abd2023b2d`
**Live URL:** <https://tilt-tag.sociobot.in>
**Verified:** 2026-09-01 UTC
**Verdict:** **FAIL — do not release until the claims registry covers every public product promise.**

## First read

A cold live load at 390 × 844 plainly explains the product: “Tilt a magnet. Tag every target.” It says it is for phone players with one 90-second challenge, and the visible **Try it with sample data** action says it opens a sample run with touch and keys. The first viewport visibly contains the running game HUD, board, and touch pad (board begins at y=602.7 px); it is not a menu wall. Clicking the action opens `/demo` in one step.

## Release blocker

### Blocker — public claims are not all registered and individually claim-tested

The mandatory claims contract requires every statement a visitor can rely on to be in `.factory/claims.json`, with exactly one tagged observable test; it also explicitly requires a claim for every advertised game mode. The registry has no claims for several public promises, despite some being covered incidentally by an untagged regression test:

- README **Controls** promises phone tilt calibration, pointer/touch-pad control, Arrow/WASD control, Escape-to-pause, inversion, seated mode, reduced motion, user-gesture audio, and persistent mute.
- Landing and `/play` promise touch, keys, and calibrated tilt as usable controls.
- The privacy page promises the demo never reads real-game storage, reset removes only demo data, and no third-party scripts/fonts/trackers load.

There is no `@claim:` entry for these published input/mode, pause, audio, demo-isolation, or third-party-resource promises. `settings-persist`, `sensor-privacy`, and `local-privacy` cover narrower different wording and do not satisfy the one-claim-per-public-promise rule. This is release-blocking under the supplied claims and game-loop contracts, even though the manual/browser checks below found the tested behaviours working.

**Required repair:** add a precise registry entry and one tagged sandbox test for each retained promise (or remove/narrow the promise). In particular, add claims for every advertised input/mode, Escape pause, mute/audio behaviour, demo reset/isolation, and third-party-resource absence; then run every exact command again.

## Verification evidence

### Clean candidate checkout

- `npm ci` passed; `npm audit --omit=dev` found 0 vulnerabilities.
- Every exact command in `.factory/claims.json` was run against the shipped demo entry point. All 12 passed: `free-access`, `run-format`, `core-rules`, `complete-run`, `run-restart`, `settings-persist`, `daily-layout`, `local-privacy`, `sensor-privacy`, `no-device-access`, `offline-reload`, and `frame-rate`.
- `npm test` passed: Vitest **5/5** and Playwright Chromium **15/15** (56.3 s), including the deterministic end/restart, mobile, focus-trap, input fallback, and axe regression tests.
- `npm run lint`, `npm run typecheck`, and the exact production `npm run build` all passed. `dist/` was produced.
- Build sizes: JS **33,948 B** (**11.02 kB gzip**); CSS **16,071 B** (**4.48 kB gzip**); self-hosted fonts **69,852 B** total; mobile hero **11,204 B**. These meet the stated static-product budgets.

### Live deployment identity and browser QA

- The live main JS and CSS exactly match the candidate build: JS SHA-256 `a7de5789f35be15701e1bff7fe534f76db9b70ba963c7634ade27a53679bc5e9`; CSS SHA-256 `f7d2e5a864922674bd0c0269d596a9628c370f9f3281eb63a8eb2484913b5818`.
- Cold desktop (1440 × 900) and mobile (390 × 844) pages had no console/page errors, no cross-origin requests, and no horizontal overflow. The live 390 px first capture is `/tmp/tilt-live-mobile-first.png` in this verifier container.
- Scripted live run: title/home sample → `/demo?e2e=1` active board → Arrow movement (`x` 180 → 195.9) → Pause → keyboard focus stayed inside the modal for ten Tab presses → Resume restored focus to Pause → real score-summary dialog → **Play again** reset score to 0, shields to 3, and board state to playing. The result summary read “The 90-second run is complete.”
- Live pointer pad control also passed when it was scrolled into the viewport: player `x` 180 → 208.8. (An off-viewport synthetic mouse coordinate does not dispatch pointer events; this was not treated as a product failure.)
- Live real-mode settings persisted across reload: inversion, seated mode, WASD, calibrated tilt state, beta offset `14.5`, and gamma offset `-6.25`.
- `prefers-reduced-motion: reduce` was active in a fresh context. Axe Playwright found **0 serious/critical** violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the real 404 route. The supplied `verify-url.sh` also passed: title, `lang=en`, one h1, main landmark, 0 missing image alt attributes, 0 unlabeled buttons, and 0 console/page errors (715 ms cold load).
- The deployed 4×-CPU frame-work measurement was **1.538 ms average** and **3.700 ms p95**, below the published 20 ms threshold.
- Service worker `/sw.js` controlled `/demo`, used cache `tilt-tag-v2`, accepted `registration.update()` with no waiting worker, and the demo reloaded offline with its board and offline notice present.
- Live request logs during cold load, normal/demo play, persistence, and offline checks were same-origin only. No camera, location, account, payment, API, or authentication path exists; server-side allowance/rate-limit and Entra checks are not applicable to this static game.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200; an unknown route returned the designed page with HTTP 404. `/` sends HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, a self-only CSP including `frame-ancestors 'none'`, and a camera/microphone/geolocation-denying Permissions-Policy. Hashed assets use `Cache-Control: public, max-age=31536000, immutable`.

### Tooling note

An independent Lighthouse CLI attempt could not complete in this container because its Chromium tab crashed. This is not used as the release blocker: the live `verify-url` run, browser error/a11y checks, cache/header checks, bundle measurements, and throttled game-loop measurement above completed successfully.

## Defects by severity

### Blocker

- Incomplete `.factory/claims.json` registry for public functional, privacy, and game-mode promises, as detailed above. The existing untagged tests do not meet the required per-claim test contract.

### High / medium / low

- None found in the tested implementation.
