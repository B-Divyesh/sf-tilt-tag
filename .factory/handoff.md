# Tilt Tag repair 6 handoff — deployed and verified

## Result

The independent verification-6 finding is repaired and deployed.

- Implementation SHA: `b205988b415d70a878f736ece3f29432f114030a`
- Documentation baseline that reported the defect: `17fb992f48133827fd3610a23447fe3be5f79f6f`
- Live URL: <https://tilt-tag.sociobot.in>
- Deployment: existing `sf-tilt-tag` Azure Static Web App, static `dist/` upload

## Repair

**Start for real** now disposes the active demo view without saving it, then clears every `demo:tilt-tag:` key before opening `/play`. This ordering matters: the previous repair attempt exposed that normal view disposal would otherwise save `demo:tilt-tag:run` again after the namespace was cleared.

The `demo-reset-isolation` claim now verifies the observable lifecycle: a one-click demo ignores distinct real values, Reset demo removes only demo data, Start for real removes the whole demo namespace, and real settings and progress remain unchanged. Demo, privacy, README, and claim documentation now describe the same behavior.

## First screen and live game check

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. It opens the sample run with touch and keys.
- Fresh desktop (1440 × 900) showed the board at y=286.5 px. Fresh phone (390 × 844) showed it at y=602.7 px, before scrolling, without horizontal overflow.
- The one-click phone sample showed the persistent Demo label, sample best score 1,850, a daily seed, 1:30, and three shields.
- Live Reset demo removed a demo marker but retained a real marker. Live Start for real removed every demo key, including a test `demo:tilt-tag:run`, while retaining that real marker.
- A fresh `/demo?e2e=1` run reached the actual score summary. **Play again** restored score 0, three shields, and the playing state.

## Verification

The documented installation was run with `npm ci`; `npm audit --omit=dev` reported 0 vulnerabilities.

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed — Vitest 6/6 and Playwright Chromium 28/28.
- Every exact command in `.factory/claims.json` passed separately: 24/24, including the strengthened `demo-reset-isolation` claim.
- `npm run build`: passed and produced `dist/`. JavaScript is 34,239 B (11.14 kB gzip); CSS is 16,147 B (4.49 kB gzip).
- `/opt/fleet/lib/verify-url.sh` passed over HTTPS in 686 ms: title, `lang=en`, one h1, main landmark, image alts, labelled buttons, and no console or page errors.
- Fresh live desktop and phone checks had no console or page errors. Live Axe scans found zero violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`.
- `/missing-page` intentionally returned the designed page with HTTP 404. The five product routes returned 200 with route-specific titles.
- Live JavaScript and CSS exactly match `dist/`: JS SHA-256 `e8d2836638433e5f19e81efcd01898ce00d5367c5d744d16d768093fbcee7bb5`; CSS SHA-256 `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- Live responses retain HTTPS, HSTS, `nosniff`, `no-referrer`, the self-only CSP with `frame-ancestors 'none'`, and camera/microphone/geolocation denial.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| Playable game missing from the first phone screen | Repaired; live board and movement pad are in the initial phone viewport. |
| 4× throttled game-loop claim failed | Repaired; the current tagged frame-work claim passes. |
| Dialog focus escaped | Repaired; full browser regression covers setup, pause, settings, and result dialog trapping and restoration. |
| Tilt calibration did not persist | Repaired; the current settings and tilt-control claims pass. |
| Public game, privacy, input, audio, sharing, advertising, analytics, and leaderboard claims lacked tests | Repaired; 24 registered outcome-based claims pass independently. |
| Demo and Terms phone targets were undersized | Repaired; mobile regression remains green. |
| Native iOS permission-sheet wording was untestable | Removed from public copy; the tested permission-request and fallback behavior remains. |
| Start for real retained demo storage | Repaired and live-verified; no demo keys remain after exit. |

## Scope and remaining follow-up

- This is a free, static, local-first game. It has no paid offer, backend, API, tenant, SQLite service, authentication, or rate-limited endpoint; backend-specific checks do not apply.
- No AI feature was added because the game’s core job does not benefit from one.
- A physical iPhone motion-permission-sheet smoke test remains a hardware follow-up. It is not an advertised OS-sheet promise; touch and keyboard recovery, permission timing, and synthetic calibrated tilt are covered by the current suite.
- Evidence is in `/work/.evidence/tilt-tag-repair-6/`. The verb-first, 52-character catalog description was copied to `/work/.evidence/catalog-description.txt`.
