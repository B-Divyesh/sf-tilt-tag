# Tilt Tag verification 4 — Play a 90-second tilt and touch obstacle run

**Verdict: PASS**

- Findings: **0**
- Untested declared claims: **0**
- Candidate implementation: `00ec22f2928d28a086e047582170c10a3e006844`
- Documentation revision reviewed: `0297c4d2f80d1f6b07b8b1c01aba8e5c068ae163`
- Live URL: <https://tilt-tag.sociobot.in>
- Verified: 2026-09-05 UTC

## First screen

Before scrolling, a fresh 390 × 844 phone browser showed:

- Job: play a 90-second tilt and touch obstacle run.
- Audience: phone players who want one short challenge without an install.
- First action: **Try it with sample data**; it opens the sample run with touch and keys.

The first viewport contains the running playable board and the on-screen movement pad. It is not a menu wall. The fresh desktop view also showed the live board. Evidence: `/work/.evidence/tilt-tag-verify-4/phone-cold-390x844.png` and `desktop-cold.png`.

## Clean checkout

A new detached checkout at the implementation SHA was installed with `npm ci`.

- `npm audit --omit=dev`: 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed: Vitest 6/6 and Playwright Chromium 23/23.
- `npm run build`: passed and produced `dist/`.
- Production output: 34,060 B JavaScript (11.08 kB gzip) and 16,147 B CSS (4.49 kB gzip).

Every exact command in `.factory/claims.json` was run separately from that checkout. All 19 passed; the command transcript is `/tmp/tilt-tag-verify-4-claims.log` in the verification environment.

| Claim | Result |
| --- | --- |
| `free-access` | Pass |
| `run-format` | Pass |
| `core-rules` | Pass |
| `complete-run` | Pass |
| `run-restart` | Pass |
| `settings-persist` | Pass |
| `daily-layout` | Pass |
| `local-privacy` | Pass |
| `sensor-privacy` | Pass |
| `no-device-access` | Pass |
| `offline-reload` | Pass |
| `frame-rate` | Pass |
| `tilt-control` | Pass |
| `touch-control` | Pass |
| `keyboard-modes` | Pass |
| `escape-pause` | Pass |
| `audio-mute-persistence` | Pass |
| `demo-reset-isolation` | Pass |
| `no-third-party-resources` | Pass |

The current live assets match the clean candidate exactly: JavaScript SHA-256 `c2f081d336644b61e354c5806142a3ee31814de9063df9c4c9eadf0a1aaddd92`; CSS SHA-256 `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.

## Live browser checks

- Fresh desktop and phone pages had no console or page errors. The deliberately missing route produced the expected browser network message for HTTP 404 only.
- The phone demo showed the persistent label, “Demo — sample data, nothing is saved to your real game,” a sample best of 1,850, a daily seed, **Reset demo**, and **Start for real**.
- Reset removed a demo-only marker and retained a distinct real-mode marker. The demo flow loaded only `https://tilt-tag.sociobot.in` resources.
- A real phone-emulated touch drag moved the magnet from x=180 to x=197.3. Keyboard movement moved it from x=145.6 to x=160.1. Escape opened the paused dialog.
- The deterministic `/demo?e2e=1` run reached the score summary, “The 90-second run is complete. You tagged 0 targets.” **Play again** returned score 0, three shields, and board state `playing`. Evidence: `phone-end-screen.png`.
- Setup, pause, settings, and end dialogs retained focus through the supplied automated checks; an independent live pause dialog retained focus through 20 Tab presses.
- Live real-mode settings, including inversion, seated mode, WASD, accepted tilt calibration, beta offset 14.5, and gamma offset -6.25, remained after reload and presented the saved-run recovery dialog.
- A motion-permission failure in the headless live browser gave a clear touch/key fallback. The supplied tilt-control claim also passed using synthetic supported-device orientation input.
- With 4× CPU throttling, live game-loop work measured 0.899 ms average and 1.6 ms p95, below the public 20 ms ceiling.
- With reduced motion enabled, the page reported the preference and passed its accessibility scan.
- After service-worker control, an offline reload of `/demo` showed “You are offline. Cached game files still work.”
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` each returned 200 with one h1, one main landmark, route-specific titles, and zero serious or critical axe violations. `/missing-page` returned the designed page with the expected HTTP 404 and `Page not found — Tilt Tag` title.
- The live phone navigation measurements were Demo 44 × 44 px, header Privacy 47 × 44 px, footer Privacy 49 × 44 px, Terms 44 × 44 px, and the external Factory link 155 × 44 px. There was no horizontal overflow.
- `verify-url.sh` passed: HTTPS 200, 652 ms load, title, `lang=en`, one h1, a main landmark, complete image alt text, labelled buttons, and no normal-route console errors.
- Live headers include HSTS, `nosniff`, `no-referrer`, self-only CSP with `frame-ancestors 'none'`, and a camera/microphone/geolocation-denying Permissions-Policy. `robots.txt` and `sitemap.xml` are present.

Browser evidence is in `/work/.evidence/tilt-tag-verify-4/`, including phone and desktop cold captures, active demo capture, end-screen capture, browser results, detail results, and URL-verifier output.

## Earlier findings

All earlier findings are repaired and verified in the candidate now live:

- The playable board and touch pad are visible in the first mobile screen.
- The measured frame-work claim passes locally and live.
- Setup, pause, settings, and end dialogs trap focus; focus restoration is covered by the 23-test suite.
- Accepted calibration and centre offsets persist through reload and saved-run recovery.
- Each retained public functional, privacy, input, mode, and audio promise has one registered claim test; all 19 exact commands pass.
- The header Demo and footer Terms targets are each exactly 44 × 44 px on the fresh phone context.

## Scope note

No physical iOS device was available for the native iOS motion-permission-sheet smoke test. This is a hardware-environment follow-up, not an untested registered claim: touch and keys remain available before and after permission failure, and the synthetic supported-device tilt claim passed. It is recorded for broad-launch follow-up; it is not a product finding in this verification.
