# Review 4 — Play a 90-second tilt and touch obstacle run

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Implementation reviewed: `22591cadfc2a59e510e67a98fff11d09c9fc52ac`
- Documentation revision reviewed: `b8a22b80d36f3fa820ab4500c3c8a09df629d424`
- Earlier documentation baseline: `6d88cb08ba6c1f8d99e5da4eac439f85e5879600`
- Live URL: <https://tilt-tag.sociobot.in>
- Reviewed: 2026-09-06 UTC

The commits after the implementation candidate change factory reports and copy-audit documentation only. The deployed JavaScript and CSS are byte-identical to the clean production build from the implementation candidate.

## First screen

Fresh 1440 × 900 desktop and 390 × 844 phone browsers showed this before scrolling:

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. It says that it opens the sample run with touch and keys.

The playable board starts at y=286.5 px on desktop and y=602.7 px on phone. The phone movement pad starts at y=677.0 px, inside the 844 px first viewport. Both had zero horizontal overflow. The first screen is the running game, not a menu.

Evidence: `/work/.evidence/tilt-tag-review-4/desktop-cold.png`, `phone-cold.png`, and `live-flow.json`.

## Sample, game run, and recovery

- One click opened the isolated demo with the persistent label **Demo — sample data, nothing is saved to your real game.**
- The normal demo showed 1:30, three shields, sample best score 1,850, and daily seed `3JVB0Q`. Reset demo reported that a fresh sample run was ready.
- A deterministic phone run started from the entry action, reached active play, and reached the actual score summary: **You scored 0** and **The 90-second run is complete. You tagged 0 targets.**
- **Play again** restored score 0, three shields, and board state `playing`.
- Keyboard movement changed the magnet x position from 180 to 188.7. Pointer/touch-pad movement then changed it to 204.3. Escape opened **Run paused**; twelve Tab presses cycled only through its three controls.
- Demo exit removed demo-prefixed state while retaining a separate real-state marker. The resulting URL was `/play`.
- In real mode, inversion, seated mode, and W A S D remained selected after an interrupted run reload. The accepted calibration values remained saved (`betaOffset` 14.5, `gammaOffset` -6.25).
- With reduced motion active, the relevant transition and animation duration was effectively zero. At 200% root text size, the h1 and sample action remained present and there was no horizontal overflow.
- A service-worker-controlled demo reloaded offline with its board, demo banner, and the message **You are offline. Cached game files still work.** The registration had an active worker and no waiting worker.

Run evidence: `/work/.evidence/tilt-tag-review-4/phone-demo-active.png`, `phone-end-screen.png`, `live-flow.json`, and `live-recovery.json`.

## Clean checkout and public claims

From the clean candidate checkout, `npm ci` and `npm audit --omit=dev` passed with 0 vulnerabilities. `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` passed. The full suite passed Vitest 6/6 and Playwright 30/30. The production build produced 34.25 kB JavaScript (11.13 kB gzip) and 16.15 kB CSS (4.49 kB gzip).

The registry contains 24 unique claims with one matching tagged test each. Every exact command declared in `.factory/claims.json` was run separately after the documented install step and passed:

| Claims | Result | Evidence |
| --- | --- | --- |
| `free-access`, `run-format`, `core-rules`, `complete-run`, `run-restart`, `score-sharing` | Pass | `claims.log` |
| `settings-persist`, `daily-layout`, `local-privacy`, `sensor-privacy`, `no-device-access`, `no-ads` | Pass | `claims.log` |
| `no-analytics`, `no-public-leaderboards`, `offline-reload`, `frame-rate`, `tilt-control`, `motion-permission-request` | Pass | `claims.log` |
| `touch-control`, `keyboard-modes`, `escape-pause`, `audio-mute-persistence`, `demo-reset-isolation`, `no-third-party-resources` | Pass | `claims.log` |

The live UI, README, Privacy, Terms, and demo documentation were checked against the registry. No public promise lacked an outcome test. The claim transcript is `/work/.evidence/tilt-tag-review-4/claims.log`.

## Live accessibility, privacy, routes, and performance

- `verify-url.sh` passed over HTTPS in 722 ms: correct title and language, one h1, main landmark, complete image alt text, labelled buttons, and no errors. Evidence: `/work/.evidence/tilt-tag-review-4/verify-url/verify.json`.
- Axe found zero serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. The explicit `label-content-name-mismatch` rule also found no sound-control issue. Evidence: `axe-links.json`.
- Fresh desktop and phone loads had no console or page errors. Their request logs contained only same-origin GET resources: document, scripts, styles, self-hosted fonts, and product images.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles, one h1, and one main landmark. Internal links returned 200. `/missing-page` returned the designed **Page not found** page with the expected HTTP 404; that deliberate response is not a defect.
- Forward navigation to Privacy and Back navigation focused the destination h1. The page has the skip link, canonical URL, description, social image, favicon, and `lang=en` metadata.
- Live headers include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera/microphone/geolocation denial. The static game makes no account, API, payment, tenant, health, or rate-limited backend request, so tenant isolation, restart persistence, health, and 429/Retry-After checks do not apply.
- The registered 4× CPU-throttled frame-work command passed. The static build is within the stated JavaScript and CSS budgets.
- Local build/live asset equality: JavaScript SHA-256 `fcebad81b200894b279872fd960d317dee821a96ad1e1f731dc67642f719778b`; CSS SHA-256 `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`. Evidence: `asset-hashes.txt`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Game was absent from the first phone screen | Repaired; the running board and movement pad are in the fresh 390 × 844 viewport. |
| 4× throttled frame-rate claim failed | Repaired; the exact claim command passes. |
| Modal dialog focus escaped | Repaired; the live pause dialog held focus for twelve Tabs and dialog regressions pass. |
| Tilt calibration did not persist | Repaired; real-mode controls and accepted offsets survived the recovery check. |
| Input, mode, privacy, sharing, advertising, analytics, and leaderboard promises lacked claim tests | Repaired; 24 registered, separately passing outcome tests cover them. |
| Demo and Terms phone targets were undersized | Repaired in the implementation; current mobile accessibility and regression checks pass. |
| Native iOS permission-sheet wording was untested | Resolved in scope; no native-sheet promise is published. The registered request-timing, denial, and touch/key recovery test passes. |
| Start for real retained demo data | Repaired; live exit removed demo data and preserved the real marker. |
| Sound label was absent from its accessible name | Repaired; explicit Axe label-in-name scan passes. |
| Pause and 404 headings used mood or metaphor copy | Repaired; current headings are **Run paused** and **Page not found**. |

Earlier verifier setup issues (missing installed dependencies, missing evidence directory, and an ambiguous selector) were rerun with their prerequisites and are not product findings.

There are zero findings of every severity and zero untested public claims. **PASS.**
