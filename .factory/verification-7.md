# Verification 7 — Tilt a magnet and tag every target

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Implementation reviewed: `b205988b415d70a878f736ece3f29432f114030a`
- Documentation baseline reviewed: `a4b51362b2bc24114ae207661799a7a6fffba81e`
- Live URL: <https://tilt-tag.sociobot.in>
- Verified: 2026-09-05 UTC

## First screen

Fresh desktop and phone browsers showed the required information before scrolling:

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. It opens the sample run with touch and keys.

The playable board was visible in the initial desktop viewport at y=286.5 px and in the 390 × 844 phone viewport at y=602.7 px. The phone movement pad was also visible, and there was no horizontal overflow. This is a game screen, not a menu wall. Normal live routes produced no console or page errors.

## Demo and game run

- One click opened `/demo` with the persistent label “Demo — sample data, nothing is saved to your real game.” The standard sample showed 1:30, three shields, daily seed `39VPBR`, and sample best score 1,850.
- In a fresh phone context, Reset demo removed a demo marker and retained an independent real marker. Start for real removed every `demo:tilt-tag:` key, including a paused-run key, and retained the real marker.
- The deterministic path `/?e2e=1` → Try it with sample data → `/demo?e2e=1` reached the actual score-summary dialog: “The 90-second run is complete. You tagged 0 targets.” Play again returned the game to score 0, three shields, and `playing` state.
- Live keyboard movement changed magnet x from 180 to 206.3; live phone pointer-pad movement changed it from 180 to 198.7. Escape paused the run, and 12 consecutive Tab presses remained inside the pause dialog.
- A real-mode setting change (inversion, seated mode, and W A S D) survived reload. The registered tilt permission, calibration, fallback, audio, sharing, and restart paths all passed their isolated browser checks.

Evidence screenshots are in `/work/.evidence/tilt-tag-verify-7/`.

## Clean checkout and claim commands

A detached clean worktree at `b205988` was installed with `npm ci` before checks.

- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: passed — Vitest 6/6 and Playwright Chromium 28/28.
- Production bundle: JavaScript 34.24 kB (11.14 kB gzip); CSS 16.15 kB (4.49 kB gzip).
- Every exact command in `.factory/claims.json` passed separately: **24/24**. This includes the core rules, run format/end/restart, sharing, settings, daily seed, privacy, device access, ads, analytics, leaderboards, offline reload, 4× throttled frame work, every advertised input mode, pause, audio, demo isolation, and third-party-resource claims. Transcript: `/tmp/tilt-tag-verify-7-claims.log`.

The live 4× throttled measurement reported 0.977 ms average and 1.600 ms p95 game-loop work, within the public 20 ms ceiling.

## Live site, accessibility, and privacy

- Live JavaScript and CSS exactly match the candidate build. JS SHA-256: `e8d2836638433e5f19e81efcd01898ce00d5367c5d744d16d768093fbcee7bb5`; CSS SHA-256: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- `verify-url.sh` passed over HTTPS: 790 ms load, title, `lang=en`, one h1, main landmark, image alts, labelled buttons, and no errors.
- Axe found zero serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. Each route had one h1 and one main landmark. Reduced motion was active in the reduced-motion context.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles. `/missing-page` returned the designed 404 page with HTTP 404; its browser network-console entry is expected and is not a defect. Header and footer links returned 200 or were explicit mailto/external links. Phone navigation targets measured at least 44 × 44 px.
- The service worker controlled a fresh demo; after the first visit, an offline reload showed the board and “You are offline. Cached game files still work.”
- Live requests during fresh loads and play were same-origin only. The checked flows made no camera, location, analytics, advertising, account, payment, or external-resource request. Responses provide HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera/microphone/geolocation denial.
- This is a static, local-first game with no backend, tenant, SQLite service, authentication, health endpoint, or request allowance. Backend isolation, restart, and 429/Retry-After checks do not apply.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Game board missing from the first phone screen | Repaired; board and movement pad are in the first 390 × 844 viewport. |
| 4× throttled frame-rate claim failed | Repaired; exact claim command and live 0.977 ms average measurement pass. |
| Dialog focus escaped | Repaired; setup, pause, settings, and end-dialog regression checks pass; live pause held focus for 12 Tabs. |
| Tilt calibration did not persist | Repaired; the registered settings/calibration persistence check passes. |
| Input, mode, privacy, sharing, advertising, analytics, and leaderboard promises lacked claims | Repaired; 24 explicit, outcome-based claim checks pass. |
| Demo and Terms mobile targets were undersized | Repaired; current phone targets are at least 44 × 44 px. |
| Native iOS permission-sheet wording was untested | Resolved in scope: the untestable OS-sheet promise was removed. The tested request-timing and denied-control recovery claim passes. A physical-iPhone smoke test remains a non-blocking hardware follow-up. |
| Start for real retained demo storage | Repaired; live exit left no `demo:tilt-tag:` keys while retaining real data. |

There are no findings and no untested public claims. **PASS.**
