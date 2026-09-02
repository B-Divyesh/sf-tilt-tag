# Tilt Tag independent verification 3 — FAIL

**Candidate tested:** `54340e557f94b2893b0b69ae9e04a872f55ddd60` (`fix: cover observable game claims`)

**Live URL:** <https://tilt-tag.sociobot.in>

**Verified:** 2026-09-02 UTC

**Verdict:** **FAIL — do not release until the undersized mobile touch targets are corrected.**

## First read

A cold 390 × 844 live load plainly says what it is: “Tilt a magnet. Tag every target.” It says who it is for: phone players with one spare 90-second challenge and no install. The visible primary action is **Try it with sample data**, with the adjacent result “Opens this sample run with touch and keys.” Clicking it opens `/demo` in one step. The first captured viewport visibly includes the active game HUD and board, rather than a menu wall. Screenshot: `/tmp/tilt-tag-live-cold-390.png` in the verifier container.

## Release blocker

### Medium — two live mobile link targets are smaller than 44 × 44 CSS px

The supplied accessibility contract makes 44 × 44 CSS px touch targets a non-negotiable baseline. On the live `/demo` page in a fresh 390 × 844 mobile/touch Playwright context, measured `getBoundingClientRect()` values were:

| Target | Measured size |
| --- | --- |
| Header **Demo** link | **39 × 44 px** |
| Footer **Terms** link | **43 × 44 px** |

These are below the required minimum width. This was independently measured after keyboard focus and pause testing; it is not an axe rule, so the otherwise clean axe result does not detect it. Make each interactive link box at least 44 px wide (not merely its visible text), then rerun mobile QA.

## Clean-checkout verification

I cloned the repository into `/tmp/tilt-tag-verify-3dIfph`, detached it at the tested candidate, and ran `npm ci` before tests. The clone was clean and `npm audit --omit=dev` reported 0 vulnerabilities.

Every exact command in `.factory/claims.json` was run from that checkout against the shipped demo entry point. All **19/19** passed:

- `free-access`, `run-format`, `core-rules`, `complete-run`, `run-restart`
- `settings-persist`, `daily-layout`, `local-privacy`, `sensor-privacy`, `no-device-access`
- `offline-reload`, `frame-rate`, `tilt-control`, `touch-control`, `keyboard-modes`
- `escape-pause`, `audio-mute-persistence`, `demo-reset-isolation`, `no-third-party-resources`

Additional local quality gates passed:

- `npm test`: Vitest **6/6** and Playwright Chromium 1.58.2 **22/22**.
- `npm run lint` and `npm run typecheck`: passed.
- Exact production build `npm run build`: passed and produced `dist/`.
- Built JavaScript: 34,060 B / 11,082 B gzip; CSS: 16,071 B / 4,479 B gzip. Both are inside the static-product budgets.
- The suite's axe integration found 0 serious/critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the 404 route.

## Live deployment and game evidence

- The live JS and CSS are byte-identical to the candidate build: JS SHA-256 `7cb8b5ee4d1e44a1147b86d3fc523e692236cb20cd7c22ec638c7a811a2c2865`; CSS SHA-256 `f7d2e5a864922674bd0c0269d596a9628c370f9f3281eb63a8eb2484913b5818`.
- A deterministic live run `/?e2e=1` → **Try it with sample data** reached `/demo?e2e=1`'s real score summary, “The 90-second run is complete.” **Play again** reset score to 0, shields to 3, and board state to `playing`. Screenshot: `/tmp/tilt-tag-live-end-390.png`.
- Live keyboard smoke test: Tab focused the skip link with a designed `rgb(118, 230, 196) solid 3px` outline; Escape opened the paused dialog and set board state to `paused`. The shipped suite also verifies focus traps, Arrow/WASD, touch, tilt calibration/fallback, settings persistence, demo isolation, and reduced-motion context.
- Independent live axe runs found 0 serious/critical violations and one h1/main landmark on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. The only console entry was the expected browser network error for the deliberately HTTP-404 `/missing-page`; normal live routes had no console/page errors.
- A live cold-load request log contained only the Tilt Tag origin (document, self-hosted fonts, JS, CSS, and original hero image). No trackers, third-party scripts/fonts, camera, location, account, payment, API, or authentication requests were observed. There are no server endpoints, so a 429 allowance and Entra check do not apply.
- Live `/demo` registered and controlled `https://tilt-tag.sociobot.in/sw.js`, using cache `tilt-tag-v2`. `registration.update()` completed with the same active worker; after first load, an offline reload retained the demo heading and showed “You are offline. Cached game files still work.”
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200; `/missing-page` returned the designed page with HTTP 404. The live response uses HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and a camera/microphone/geolocation-denying Permissions-Policy. Hashed JS uses `Cache-Control: public, max-age=31536000, immutable`.

## Defects by severity

### Medium

- Header **Demo** and footer **Terms** link hit boxes are below the mandatory 44 × 44 CSS px mobile touch-target minimum.

### High / low

- None found.
