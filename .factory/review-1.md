# Review 1 — Play a 90-second tilt and touch obstacle run

**Verdict: FAIL**

- Findings: **1**
- Untested public claims: **4**
- Candidate implementation: `00ec22f2928d28a086e047582170c10a3e006844`
- Documentation revision at review start: `7a2b9a775aeda687d3e9a6b62e8b252638c0b3a7`
- Live URL: <https://tilt-tag.sociobot.in>
- Reviewed: 2026-09-05 UTC

The 19 claims declared in `.factory/claims.json` all have a command and all 19 commands passed. The four claims below are public promises but have no registry entry or tagged sandbox test, so they are untested public claims.

## First screen

Before scrolling, fresh desktop and 390 × 844 phone browsers showed:

- Job: play a 90-second tilt and touch obstacle run.
- Audience: phone players who want one short challenge without an install.
- First action: **Try it with sample data**. It opens the sample run with touch and keys.

The first desktop viewport contained the live board at y=286 px. The first phone viewport contained it at y=603 px, within its 844 px height. The product is not a menu wall. Evidence: `/work/.evidence/tilt-tag-review-1/desktop-cold.png` and `phone-cold.png`.

## Finding

### Blocker — four public promises are not registered or claim-tested

The claims contract requires every public statement a visitor can rely on to have one matching `.factory/claims.json` entry and one tagged observable sandbox test. These promises appear in the shipped UI or product documentation but have neither:

1. **“Share score”** on the result screen and “You may play and share your score” in `/terms`.
2. **“The game does not use … ads”** on the landing page.
3. **“Tilt Tag has no … analytics”** on `/privacy` and in the README.
4. **“There are no … public leaderboards”** on the landing page.

The current `no-third-party-resources` test only rejects cross-origin requests. It does not test the absence of same-origin analytics or advertising, does not inspect leaderboards, and does not exercise the score-sharing outcome. The `free-access` test covers the separate no-account statement only.

This is one release-blocking coverage finding with four untested public claims. Add one precise registry entry and one tagged sandbox test for each retained promise, or remove/narrow the promise, then rerun all claim commands. The visible share control is especially important: in this fresh Chromium phone context `navigator.share` was unavailable, so clicking it takes the documented fallback rather than proving a share result.

## Clean checkout

A new detached checkout at the candidate implementation was installed with `npm ci`.

- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed: Vitest 6/6 and Playwright Chromium 23/23.
- `npm run build`: passed and produced `dist/`.
- Build output: JavaScript 34,060 B (11.08 kB gzip); CSS 16,147 B (4.49 kB gzip).
- Every exact command in `.factory/claims.json` was run separately. All 19 passed. Transcript: `/tmp/tilt-tag-review-1-claims.log` in this review environment.

Declared claim commands passed: `free-access`, `run-format`, `core-rules`, `complete-run`, `run-restart`, `settings-persist`, `daily-layout`, `local-privacy`, `sensor-privacy`, `no-device-access`, `offline-reload`, `frame-rate`, `tilt-control`, `touch-control`, `keyboard-modes`, `escape-pause`, `audio-mute-persistence`, `demo-reset-isolation`, and `no-third-party-resources`.

## Live game and sample checks

- The deployed JavaScript and CSS are byte-identical to the candidate build. JavaScript SHA-256: `c2f081d336644b61e354c5806142a3ee31814de9063df9c4c9eadf0a1aaddd92`. CSS SHA-256: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- The one-click sample showed the persistent label “Demo — sample data, nothing is saved to your real game,” sample best score 1,850, and a daily seed. Reset removed a `demo:tilt-tag:` marker while preserving a separate `tilt-tag:` marker. Requests stayed on the Tilt Tag origin.
- A fresh deterministic `/demo?e2e=1` run reached the score summary: “The 90-second run is complete. You tagged 0 targets.” **Play again** restored score 0, three shields, and board state `playing`. Evidence: `phone-demo.png` and `phone-end-screen.png`.
- Live keyboard input moved the magnet from x=180 to x=193.3. Live touch input moved it from x=193.3 to x=231.6. Escape opened the paused dialog, and 20 Tab presses stayed within its three controls.
- At 4× CPU throttling, live game-loop work was 1.003 ms average and 2.200 ms p95, below the published 20 ms ceiling.
- After service-worker control, a live offline reload showed the demo and “You are offline. Cached game files still work.” Reduced-motion media was active and the hero transition duration was effectively zero. Evidence: `/work/.evidence/tilt-tag-review-1/live-game-checks.json`.

## Accessibility, routes, and privacy checks

- Fresh desktop and phone loads had no console or page errors. Requests were same-origin only.
- The supplied `verify-url.sh` passed: HTTPS 200, 642 ms load, title, `lang=en`, one h1, a main landmark, complete image alt text, labelled buttons, and no errors. Evidence: `/work/.evidence/tilt-tag-review-1/verify-url/verify.json`.
- Live Axe scans found 0 serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. Each had one h1 and one main landmark.
- Phone target measurements: wordmark 111 × 44 px, Demo 44 × 44 px, Privacy 49 × 44 px, Terms 44 × 44 px, and the Factory link 155 × 44 px. The responsive hidden Play link has zero layout size and is not a visible target.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned HTTP 200. `/missing-page` returned the designed page with the expected HTTP 404. Route titles are specific.
- `robots.txt`, `sitemap.xml`, HSTS, `nosniff`, `no-referrer`, self-only CSP with `frame-ancestors 'none'`, and a camera/microphone/geolocation-denying Permissions-Policy are live.

## Earlier findings

Earlier code findings remain repaired in the live candidate:

- The live board and touch pad appear in the first phone screen.
- The measured frame-work claim passes locally and live.
- Dialog focus handling, calibration persistence, settings persistence, touch and keyboard controls, demo isolation, offline reload, reduced motion, and mobile navigation target sizes pass their current checks.
- The prior claims-registry repair covered the 19 listed claims, but this review found four additional public promises that were not included. Their current disposition is the blocker above.

## Hardware follow-up

No physical iOS device was available for the native iOS motion-permission sheet. This remains a hardware follow-up, not a separate product finding: touch and keys work when motion is unavailable, and the registered synthetic tilt-control claim passed.
