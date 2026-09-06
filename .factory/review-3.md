# Review 3 — Play a 90-second tilt and touch run

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Implementation reviewed: `22591cadfc2a59e510e67a98fff11d09c9fc52ac`
- Documentation revision at review start: `6d88cb08ba6c1f8d99e5da4eac439f85e5879600`
- Live URL: <https://tilt-tag.sociobot.in>
- Reviewed: 2026-09-06 UTC

The three later commits change only factory reports. The deployed JavaScript and CSS are byte-identical to the clean build from the implementation commit.

## First screen

Fresh 1440 × 900 desktop and 390 × 844 phone browsers showed this information before scrolling:

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. The next line says it opens the sample with touch and keys.

The desktop game board began at 286.5 px. The phone board began at 602.7 px, and its movement pad ended at 753.0 px inside the 844 px viewport. Both pages had zero horizontal overflow. The first screen shows the running game rather than a menu.

Evidence: `/work/.evidence/tilt-tag-review-3/desktop-cold.png`, `phone-cold.png`, and `first-read-and-focus.json`.

## Sample and complete game run

- One click opened `/demo` with the persistent label **Demo — sample data, nothing is saved to your real game**.
- The standard sample showed 1:30, three shields, sample best score 1,850, and daily seed `39VPBR`.
- A fake real best score of 99,999 did not appear in demo mode. **Reset demo** removed a demo marker while retaining the real marker and score. **Start for real** removed every `demo:tilt-tag:` key while retaining the real marker and score.
- A recorded deterministic phone run went from the title page through active play to the actual result dialog: **You scored 0** and **The 90-second run is complete. You tagged 0 targets.**
- Keyboard input moved the magnet from x=180 to x=195.9. Touch input moved it from x=199.6 to x=238.1.
- **Play again** restored score 0, three shields, and board state `playing`.
- Escape opened **Run paused**. Twelve Tab presses stayed inside the dialog.

Normal play, the zero-time boundary, permission denial, missing motion support, saved-setting recovery, restart, pause, and offline recovery all passed. Permission was requested zero times before **Use phone tilt** and once afterward; denial and unsupported-device messages both left a playable touch/key path.

Run evidence: `/work/.evidence/tilt-tag-review-3/172a0a43c9d689a2389ec7b42ae2c8f0.webm`, `phone-run-active.png`, `phone-end-screen.png`, and `live-flow.json`.

## Clean checkout and claims

A detached clean checkout at the implementation SHA was installed with `npm ci` before testing.

- `npm audit --omit=dev`: passed with 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: passed — Vitest 6/6 and Playwright Chromium 30/30.
- Build output: JavaScript 34.25 kB (11.13 kB gzip) and CSS 16.15 kB (4.49 kB gzip).
- The registry has 24 unique claims and exactly one matching `@claim:<id>` tag for each.
- Every exact command in `.factory/claims.json` passed separately: **24/24**.

The live UI, route metadata, Privacy, Terms, README, and demo documentation were cross-checked against the registry. No public promise lacks a matching outcome test. Claim transcript: `/work/.evidence/tilt-tag-review-3/claims.log`.

## Live accessibility, routes, privacy, and performance

- Live JavaScript SHA-256: `fcebad81b200894b279872fd960d317dee821a96ad1e1f731dc67642f719778b`.
- Live CSS SHA-256: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- The supplied URL verifier passed in 721 ms with the correct title and language, one h1, one main landmark, complete image alt text, labelled buttons, and no console or page errors.
- Playwright Axe found zero serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. The explicit label-in-name rule passed for **Sound on** and **Sound off**.
- Keyboard focus used a 3 px mint outline. Setup, pause, settings, and result focus checks passed. Forward and Back navigation focused the new route h1 after the route render frame.
- Every visible phone header and footer link measured at least 44 × 44 px. At 200% root text size, the page kept its h1 and primary action with no horizontal overflow.
- Reduced-motion media matched and left no running animations.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles, one h1, one main landmark, and a skip link. All expected internal links returned 200.
- `/missing-page` deliberately returned HTTP 404 with title `Page not found — Tilt Tag`, h1 **Page not found**, and a styled return action. The expected 404 is not a defect.
- The service worker was active, updated with no waiting worker, and reloaded the playable demo offline with the cached-files notice.
- The recorded live run made only same-origin GET requests, set no cookie, and used only `demo:tilt-tag:` storage. No analytics, advertising, account, payment, camera, location, or cross-origin resource request appeared.
- Live headers include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera, microphone, and geolocation denial.
- At 4× CPU throttling, live game-loop work measured 1.1 ms average and 2.3 ms p95, below the public 20 ms ceiling.
- Mobile Lighthouse scored 97 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.449 s, CLS was 0.00068, total blocking time was 187 ms, and total transfer was 132.0 kB.

This is a static, local-first game. It has no backend, tenants, SQLite service, authentication, health endpoint, multiplayer, or request allowance. Tenant isolation, backend restart persistence, and 429/Retry-After checks do not apply.

Evidence: `/work/.evidence/tilt-tag-review-3/live-platform.json`, `focus-and-targets.json`, `lighthouse-mobile.json`, `phone-privacy.png`, `phone-terms.png`, and `phone-404.png`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Game missing from the first phone screen | Repaired; the running board and movement pad are visible before scrolling. |
| 4× throttled frame claim failed | Repaired; the exact claim command passes and live work averages 1.1 ms. |
| Dialog focus escaped | Repaired; dialog regressions pass and the live pause held focus through 12 Tabs. |
| Tilt calibration did not persist | Repaired; the settings/calibration claim passes against the byte-identical candidate, and live control settings survive reload. |
| Input, mode, audio, demo, resource, sharing, ads, analytics, and leaderboard claims were missing | Repaired; 24 registered outcome tests pass separately with one tag each. |
| Demo and Terms phone targets were undersized | Repaired; every visible phone navigation target is at least 44 × 44 px. |
| Native iOS permission-sheet wording was untested | Resolved in scope; the OS-sheet promise is absent. Request timing, denial, and touch/key recovery are tested. |
| Start for real retained demo storage | Repaired; leaving demo removed all demo-prefixed keys and preserved real data. |
| Sound labels were absent from their accessible names | Repaired; both states include their visible labels and pass the explicit Axe rule. |
| Pause and 404 headings used mood or metaphor wording | Repaired; the current headings are **Run paused** and **Page not found**. |

No physical iPhone was available for an optional Safari hardware smoke test. The product makes no native-sheet promise, while request timing, denial, calibration, and fallback behavior have registered browser tests. This is not a finding or an untested public claim.

## Review tooling notes

The first claim-loop attempt was started before dependencies had been installed inside the detached worktree. It failed on missing local modules, was stopped, and was discarded. After the documented `npm ci` prerequisite ran in that checkout, all 24 commands were rerun from the beginning and passed.

One composite live script later stopped on an ambiguous Privacy-link selector after saving the run evidence. The affected route-focus check was rerun with the header navigation scoped explicitly and passed. Neither setup error is product evidence.

There are zero findings of every severity and zero untested public claims. **PASS.**
