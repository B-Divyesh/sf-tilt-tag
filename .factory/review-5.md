# Review 5 — Play a 90-second tilt and touch obstacle run

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Declared claim commands: **24/24 passed separately**
- Implementation reviewed: `22591cadfc2a59e510e67a98fff11d09c9fc52ac`
- Documentation baseline reviewed: `4b8bcab63bfa7998439281737102eb0d646f4bd2`
- Live URL: <https://tilt-tag.sociobot.in>
- Reviewed: 2026-09-06 UTC

The commits after the implementation candidate change factory reports and the copy audit only. The deployed JavaScript and CSS are byte-identical to the clean build from the implementation commit.

## First screen

Before scrolling, fresh 1440 × 900 desktop and 390 × 844 phone profiles stated:

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. The adjacent line says it opens the sample with touch and keys.

The running game appears on the first screen. The desktop board begins at 286.5 px. The phone board begins at 602.7 px, and its movement pad ends at 753.0 px inside the 844 px viewport. Both layouts have zero horizontal overflow. The page is the game, not a menu wall.

Evidence: `/work/.evidence/tilt-tag-review-5/desktop-cold.png`, `phone-cold.png`, and `live-standard.json`.

## Sample and complete run

- One click opened `/demo` with the persistent label **Demo — sample data, nothing is saved to your real game.**
- The normal sample showed 1:30, three shields, best score 1,850, and daily seed `3JVB0Q`. A fake real best score of 99,999 did not replace the sample best.
- Keyboard input moved the magnet from x=180 to x=190.9. Touch input then moved it to x=226.5.
- Escape opened **Run paused**. Twelve consecutive Tab presses remained inside its dialog.
- **Reset demo** removed a demo marker and preserved the separate real marker and score. **Start for real** removed every `demo:tilt-tag:` key and preserved the real marker and score. All test values lived only in fresh review profiles.
- A recorded clean phone run went from the title screen through active play to the real timer result: **You scored 0**, **The 90-second run is complete. You tagged 0 targets.**, and 0:00.
- **Play again** restored score 0, three shields, and `playing` state.

The standard sample and the shortened deterministic end-run used separate fresh profiles, so the test shortcut did not reuse saved standard-run state. Evidence: `/work/.evidence/tilt-tag-review-5/phone-demo-active.png`, `phone-deterministic-run.webm`, `phone-end-screen.png`, `live-standard.json`, and `deterministic-run.json`.

## Controls, boundaries, and recovery

- Motion permission was requested zero times before **Use phone tilt** and once afterward. Simulated denial showed the documented recovery message and left touch and keys available.
- Synthetic calibration at beta 14.5 and gamma -6.25 was stored. A later orientation event moved the magnet from x=180 to x=200.1. This proves the web input path, not a physical sensor or operating-system permission sheet.
- Inversion, seated mode, W A S D, and an interrupted run survived a full reload.
- The isolated audio claim proved that sound waits for player input and mute survives reload. Arrow keys, W A S D, touch, Escape pause, and score sharing also passed their isolated claims.
- The zero-time boundary produced the timer result screen. Unit coverage separately proved target scoring, shield loss, the zero-time state transition, deterministic fields, and stalled-frame clamping.
- Reduced-motion media matched; relevant animation and transition durations were 0.00001 s. At 200% root text size, the h1 and sample action remained available with no horizontal overflow.
- The active service worker had no waiting update. After the first visit, an offline reload restored the demo board and showed **You are offline. Cached game files still work.**

Evidence: `/work/.evidence/tilt-tag-review-5/live-platform.json` and the clean test logs.

## Clean checkout and public claims

A detached clean checkout at documentation SHA `4b8bcab` was installed with `npm ci` before testing.

- `npm audit --omit=dev`: passed with 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: passed — Vitest 6/6 and Playwright Chromium 30/30.
- Build output: JavaScript 34,253 B (11.13 kB gzip); CSS 16,147 B (4.49 kB gzip).
- Registry audit: 24 unique claims; every entry has one command, one sandbox description, and exactly one matching `@claim:<id>` tag.
- Every exact command in `.factory/claims.json` ran separately: **24/24 passed**.

The passing claims cover free/no-account access; run format, rules, completion, restart, and sharing; settings, calibration, and daily layout; local and sensor privacy; camera/location access; ads, analytics, and public leaderboards; offline reload; 4×-throttled game work; tilt permission, tilt, touch, keyboard, and Escape controls; audio; demo isolation; and third-party resources.

The live UI, README, Privacy, Terms, and demo documentation were cross-checked against the registry. No public statement lacks an observable claim test. Evidence: `/work/.evidence/tilt-tag-review-5/quality-gates-clean.log`, `claims-clean.log`, and `claim-registry-audit.txt`.

## Accessibility, routes, privacy, and performance

- The supplied `verify-url.sh` passed in 659 ms: correct title and `lang=en`, one h1, one main landmark, complete image alt text, labelled buttons, and no page errors.
- Fresh Playwright Axe scans on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page` found zero serious or critical violations. The explicit label-in-name rule also passed for **Sound on**.
- Every checked route has a route-specific title, one h1, one main landmark, and a skip link. Forward and Back navigation focused the destination h1.
- All five visible phone header/footer links measured at least 44 × 44 px.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200. `/missing-page` deliberately returned HTTP 404 with title `Page not found — Tilt Tag` and h1 **Page not found**. That expected response is not a defect.
- Normal live flows produced no console or page errors. Requests were same-origin GETs only, and the review profiles set no cookies. The isolated claims additionally reject analytics, advertising, public score publication, saved live sensor readings, and third-party resources.
- Live headers include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera, microphone, and geolocation denial.
- Live 4× CPU-throttled game-loop work measured 1.499 ms average and 2.8 ms p95, below the public 20 ms ceiling.
- A completed mobile Lighthouse run scored 96 performance, 100 accessibility, 100 best practices, and 100 SEO. FCP was 1.053 s, LCP 1.417 s, CLS 0.00068, total blocking time 228.5 ms, and transfer size 131,946 B.
- Live/local hashes match: JavaScript `fcebad81b200894b279872fd960d317dee821a96ad1e1f731dc67642f719778b`; CSS `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.

This is a static, local-first, one-player game. It has no backend, tenants, SQLite service, authentication, health endpoint, payment, multiplayer room, or request allowance. Backend isolation, restart persistence, health, 429/Retry-After, and independent multiplayer-client checks do not apply. The brief does not benefit from an AI-assisted step, so the missed-leverage check found none.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Game missing from the first phone screen | Repaired; the running board and movement pad are visible before scrolling. |
| 4× throttled frame-work claim failed | Repaired; the exact claim command passes, and live work averages 1.499 ms. |
| Modal focus escaped | Repaired; the full regression passes, and 12 live Tabs remained in the pause dialog. |
| Tilt calibration did not persist | Repaired; saved offsets and settings survive reload. |
| Public input, mode, privacy, sharing, advertising, analytics, and leaderboard promises lacked tests | Repaired; 24 registered outcome commands pass separately. |
| Demo and Terms phone targets were undersized | Repaired; every visible phone navigation target is at least 44 × 44 px. |
| Native iOS permission-sheet wording was untested | Resolved in scope; no native-sheet promise is published. Request timing, denial, and fallback are tested. |
| Start for real retained demo data | Repaired; leaving demo clears all demo-prefixed keys and preserves real data. |
| Sound label omitted its visible text | Repaired; the accessible name contains **Sound on**, and the explicit Axe rule passes. |
| Pause and 404 headings used indirect wording | Repaired; the headings are **Run paused** and **Page not found**. |

## Review tooling notes

The cited `factory-evidence/tilt-tag-verify-9/qa-report.md` path was not mounted in this disposable container. The complete repository report `.factory/verification-9.md` was read before testing, and every product claim and earlier finding was independently rechecked.

One preliminary Lighthouse run crashed while collecting its optional full-page screenshot and produced a partial report. It was discarded. The unchanged audit reran with that artifact disabled and completed without a runtime error or console error; only the completed report is cited above.

There are zero findings of every severity and zero untested public claims. **PASS.**
