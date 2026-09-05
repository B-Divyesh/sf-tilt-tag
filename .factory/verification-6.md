# Verification 6 — Verify a 90-second tilt-and-touch run

**Verdict: FAIL**

- Findings: **1**
- Untested public claims: **0**
- Declared claim commands passed: **24/24**
- Candidate implementation: `32c0b3388829806461b39c49d0bbbd11e9d3925e`
- Documentation revision reviewed: `c072f675afa426a778620d54d17860de72f8b13a`
- Live URL: <https://tilt-tag.sociobot.in>
- Verified: 2026-09-05 UTC

The deployed assets match the candidate, all declared claims pass, and the normal game path works. This candidate cannot pass because leaving demo mode does not discard demo storage as required by the demo-sandbox contract.

## First screen

Fresh browser contexts were opened before scrolling.

- Job: tilt a magnet and tag every target in a 90-second run.
- Audience: phone players who want one short browser challenge without an install.
- First action: **Try it with sample data**. Its adjacent text says it opens a sample run with touch and keys.
- Desktop at 1440 × 900 showed the playable board at y=286 px. Phone at 390 × 844 showed it at y=603 px. The phone page had no horizontal overflow.

The page title is `Tilt Tag — Play a 90-second tilt game`. The landing page had one h1, one main landmark, no console or page errors, and only same-origin resource requests.

## Finding

### Medium — Start for real leaves demo data behind

The demo-sandbox contract requires leaving demo mode to discard demo data unless the player explicitly keeps it. The live flow does not do this.

1. In a fresh desktop context, opened `/`, chose **Try it with sample data**, and confirmed the persistent banner: “Demo — sample data, nothing is saved to your real game.” The active sample showed a 1:30 run, three shields, daily seed `39VPBR`, and sample best score 1,850.
2. Added distinct real and demo test markers, then chose **Reset demo**. The demo marker was removed and the real marker remained, proving reset isolation.
3. Chose **Start for real**. The page correctly moved to `/play`, and the real marker remained unchanged. However, `localStorage` still contained `demo:tilt-tag:run`.

This violates the required demo lifecycle. The current `demo-reset-isolation` claim only tests Reset demo; it does not cover leaving the sandbox. Repair by deleting the `demo:tilt-tag:` namespace when **Start for real** is chosen, then add a tagged sandbox test for that lifecycle.

## Clean checkout and claims

A new detached clone at the implementation SHA was installed with the documented command, `npm ci`.

- `npm audit --omit=dev`: passed, 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed: Vitest 6/6 and Playwright Chromium 28/28.
- `npm run build`: passed and produced `dist/`.
- The registry has 24 claims, with exactly one `@claim:<id>` tag for every entry.
- Every exact command in `.factory/claims.json` was run separately; all 24 passed.

The passing claims were `free-access`, `run-format`, `core-rules`, `complete-run`, `run-restart`, `score-sharing`, `settings-persist`, `daily-layout`, `local-privacy`, `sensor-privacy`, `no-device-access`, `no-ads`, `no-analytics`, `no-public-leaderboards`, `offline-reload`, `frame-rate`, `tilt-control`, `motion-permission-request`, `touch-control`, `keyboard-modes`, `escape-pause`, `audio-mute-persistence`, `demo-reset-isolation`, and `no-third-party-resources`.

The candidate build and live static assets are byte-identical:

- JavaScript `main-nMWUKlJp.js`: `1b6d9c0a6df74607966ef3c8ca22d70a48ec0651bff341e0fe701b9e213b74c6`
- CSS `main-BLHXVVHQ.css`: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`

## Game run and recovery

The one-click sample entered active play immediately. A fresh `/demo?e2e=1` run went from active board state to the actual score summary, `You scored 0` and `The 90-second run is complete. You tagged 0 targets.` **Play again** restored board state `playing`, score 0, and three shields.

The complete suite separately exercised target scoring, hazard shield loss, keyboard and touch input, calibrated supported-device tilt, permission denial recovery, pause, settings persistence, audio/mute persistence, offline reload, and the 4× CPU-throttled frame-work claim. The static game has no backend, tenant, health, SQLite, authentication, payment, or request API; persistence, tenant isolation, and 429/Retry-After checks do not apply.

## Accessibility, privacy, routes, and offline behavior

- Live Axe Playwright scans reported zero violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`.
- The independent `@axe-core/cli` executable could not locate a system Chrome binary in this container. This was a tool-environment limitation, not used as product evidence; the same Axe engine ran successfully through the installed Playwright browser.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles, one h1, and one main landmark.
- `/missing-page` returned the designed page with expected HTTP 404 and `Page not found — Tilt Tag`; this deliberate 404 is not a defect.
- Live headers include HSTS, `nosniff`, `no-referrer`, self-only CSP with `frame-ancestors 'none'`, and camera, microphone, and geolocation denial.
- Live cold-load requests were only to the Tilt Tag origin for the document, self-hosted fonts, JavaScript, CSS, and original image assets.
- The claim suite verifies service-worker offline reload, update behavior, reduced motion, text resizing, dialog focus management, and mobile touch targets.

No project `verify-url.sh` was present in this clean checkout or workspace. Its required structural checks were repeated directly with fresh Playwright contexts and Axe.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Game missing from first phone screen | Repaired: the board is visible in the 390 × 844 first viewport. |
| 4× throttled frame-rate claim failed | Repaired: the registered frame-work claim passes. |
| Dialog focus escaped | Repaired: dialog focus-trap and restoration regression checks pass. |
| Tilt calibration did not persist | Repaired: settings and accepted offsets persistence claim passes. |
| Input, mode, audio, demo, resource, sharing, ads, analytics, and leaderboard claims were missing | Repaired: 24 registered claims, one tag each, all commands pass. |
| Demo and Terms touch targets were undersized | Repaired: the current mobile target regression passes. |
| Native iOS permission-sheet promise was untested | Repaired in scope: the OS-sheet promise was removed; the tested claim covers request timing and denied-control recovery. Physical iPhone smoke testing remains optional. |
| Demo data is discarded on leaving demo mode | **Open:** live **Start for real** leaves `demo:tilt-tag:run` behind. |

## Required repair

Delete demo namespace data when **Start for real** exits demo mode, add an outcome-based claim test for the exit path, then rerun all 24 claim commands and live demo QA.
