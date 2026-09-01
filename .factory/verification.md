# Tilt Tag independent verification — FAIL

**Candidate:** `7bea8a6a0936cc00a4758bbf1e2ef609176bd71d`  
**Live URL:** https://tilt-tag.sociobot.in  
**Verified:** 2026-09-01 (UTC)  
**Result:** **FAIL — do not release this candidate.**

## First-read result

Cold-loaded the live homepage at 390 × 844 in a new browser context. It plainly says what the game does (“Tilt a magnet. Tag every target.”), who it is for, and that **Try it with sample data** starts a touch/key sample run. The one-click demo works and all cold-load requests were to `https://tilt-tag.sociobot.in`.

The required first game capture nevertheless fails: the above-the-fold screen is a landing/hero image and copy plate, not the playable game. The game preview is below the fold. This violates the browser-game acceptance requirement that the captured first screen show the game itself rather than a menu wall.

## Release blockers

1. **Blocker — required `frame-rate` claim test fails reproducibly.**
   - Exact required command: `npx playwright test --grep '@claim:frame-rate'`
   - Result: failed on 2026-09-01. With the test’s documented 4× CPU throttling, average `requestAnimationFrame` interval was **36.469411764705875 ms**, while the assertion requires `< 20 ms` (the equivalent of the advertised 60 fps target). The test stopped at that failed average assertion.
   - This is a release blocker under `.factory/claims.json` and the work order, regardless of other passing checks.

2. **Blocker — mobile first screen is not the game.**
   - Evidence: fresh live homepage at 390 × 844 shows only the observatory hero, headline, explanatory copy, and primary button; no playable canvas or live board is visible without scrolling.
   - Required behaviour: the factory’s first capture for a browser videogame must show the game itself.

## Defects

### High

- **Modal dialog does not retain keyboard focus.** On live `/play`, the initial `role="dialog" aria-modal="true"` setup overlay autofocuses **Use phone tilt**. Successive Tab stops were: **Use phone tilt** → **Use touch or keys** → footer **Privacy** → **Terms** → external factory link → document body → skip link/header. A keyboard player can operate page navigation behind the modal. This fails dialog focus management required by the accessibility contract.

- **Tilt calibration does not persist.** A live `/play` run completed **Use phone tilt** → **Center tilt and start**. Stored `tilt-tag:settings` was:
  ```json
  {"mode":"tilt","invertX":false,"seated":false,"reducedMotion":false,"mute":false,"keySet":"arrows","calibrated":false,"betaOffset":0,"gammaOffset":0}
  ```
  After 1.3 seconds and reload, the game offers “Saved run found”, but its stored calibration and center offsets have already been discarded. This does not meet the required persistent settings/progress behaviour and forces an uncalibrated tilt resume.

## Tests and evidence

### Clean local checkout

- `npm ci`: passed; `npm audit --omit=dev`: 0 vulnerabilities.
- Every command listed in `.factory/claims.json` was run from the shipped demo entry point. All claims other than `frame-rate` passed: `free-access`, `run-format`, `core-rules`, `complete-run`, `run-restart`, `settings-persist` (the tested touch/key subset), `daily-layout`, `local-privacy`, `sensor-privacy`, `no-device-access`, and `offline-reload`.
- `@claim:frame-rate`: failed reproducibly as detailed above.
- `npm test`: failed because of the same required frame-rate claim; unit portion passed **5/5** and browser suite otherwise passed its checks.
- `npm run build`: passed (`tsc --noEmit` and Vite). Production output is `32.30 kB` JS / **10,526 B gzip** and `14.56 kB` CSS / **4,189 B gzip**; self-hosted fonts total 69,852 B and mobile hero is 11,204 B.
- No separate lint script is defined in `package.json`.

### Live deployment

- Deployment matches the requested candidate: local and live `assets/main-BgjR-sjp.js` SHA-256 are both `34deced97b00d354925eb07e261ed28192791623050a1006304814af7cdd5c19`; local/live CSS SHA-256 are both `5801802cb859731485dd999c99c28bc59b50ee54142a36d51d9511604f584581`.
- Desktop and 390 px mobile were exercised. `/demo` has no horizontal overflow at 390 px. The live board, touch pad, pause/resume, restart, and sample banner render.
- Deterministic scripted live run: homepage → **Try it with sample data** → active standard `1:30` / three-shield run → pause → resume → real end dialog. The run reached **Run complete / You scored 0 / Your last shield broke** with no console/page errors. The shortened `/demo?e2e=1` score-summary and restart checks also passed in the supplied suite.
- Axe on live `/demo`: no serious or critical violations. This does not catch the modal focus escape above.
- Reduced-motion context reported `true`; mobile overflow was `0` px. Live cold-load and demo request logs contained only the product origin; no third-party scripts, analytics, camera, location, or sensor uploads were observed.
- Service worker registered and controlled the live demo. The supplied offline-reload claim passed. This static game has no server-side API endpoint, authentication, payment, or documented request allowance; rate-limit/auth checks are not applicable.
- Response headers on `/` include CSP (`default-src 'self'` with self-only scripts/styles/connect), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, HSTS, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Hashed assets are `Cache-Control: public, max-age=31536000, immutable`.

## Required repair and re-verification

1. Make the documented 4×-CPU frame-rate claim test pass, or remove/replace the public 60 fps claim and its incompatible test only if the product contract is revised.
2. Put the actual playable board in the initial mobile capture, not below the landing hero.
3. Add real modal focus trapping and focus restoration for setup, pause, settings, and end dialogs.
4. Persist the accepted tilt calibration/offsets and verify a refreshed interrupted tilt run resumes using them.
5. Re-run every listed claim test, `npm test`, `npm run build`, live keyboard/mobile QA, and this independent verification.
