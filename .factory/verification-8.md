# Verification 8 — Play a 90-second tilt and touch run

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Implementation reviewed: `22591cadfc2a59e510e67a98fff11d09c9fc52ac`
- Documentation baseline reviewed: `98f2e6b3b70599c0b838f107f35d915eb35671c8`
- Live URL: <https://tilt-tag.sociobot.in>
- Verified: 2026-09-05 UTC

The later documentation commits do not change the product image. The deployed JavaScript and CSS are byte-identical to the clean implementation build.

## First screen

Fresh 1440 × 900 desktop and 390 × 844 phone browsers showed the required information before scrolling:

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. The adjacent text says it opens the sample with touch and keys.

The desktop game board began at 286.5 px. On the phone, the board began at 602.7 px and the movement pad ended at 753.0 px, inside the 844 px viewport. Both pages had zero horizontal overflow. The first screen shows the running game, not a menu wall.

Evidence: `/work/.evidence/tilt-tag-verify-8/desktop-cold.png` and `phone-cold.png`.

## Demo and complete run

- One click opened `/demo` with the persistent label **Demo — sample data, nothing is saved to your real game**.
- The realistic sample showed the standard countdown, three shields, sample best score 1,850, and daily seed `39VPBR`.
- **Reset demo** removed a demo-only marker and retained a distinct real-game marker and real score. **Start for real** then removed every `demo:tilt-tag:` key and retained the real markers. Demo mode did not read the real best score.
- A recorded deterministic phone run went from the title screen through active play to the real result dialog: **You scored 0** and **The 90-second run is complete. You tagged 0 targets.**
- Real keyboard input moved the magnet from x=180 to x=190.9. Real touch events then moved it from x=193.1 to x=208.7.
- **Play again** restored score 0, three shields, and board state `playing`.
- Escape opened **Run paused**. Twelve Tab presses remained inside the dialog. A saved run, inversion, seated mode, and W A S D settings survived reload.
- The unsupported-tilt path explained the problem and started a playable touch/key run.

Run evidence: `/work/.evidence/tilt-tag-verify-8/fbfeb629766e4f85023ff6be62113373.webm`, `phone-run-active.png`, `phone-end-screen.png`, and `live-verification.json`.

## Clean checkout and claims

A detached clean worktree at the implementation SHA was installed with `npm ci` before measurement.

- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: passed — Vitest 6/6 and Playwright Chromium 30/30.
- Build output: JavaScript 34.25 kB (11.13 kB gzip) and CSS 16.15 kB (4.49 kB gzip).
- The registry contains 24 claims and exactly one matching `@claim:<id>` tag for each.
- Every exact command in `.factory/claims.json` was run separately: **24/24 passed**. Transcript: `/work/.evidence/tilt-tag-verify-8/claims.log`.

The passed claims cover free/no-account access, run format and rules, completion and restart, score sharing, settings and calibration persistence, the daily seed, local and sensor privacy, device access, ads, analytics, public leaderboards, offline reload, throttled frame work, tilt permission timing, tilt/touch/keyboard controls, Escape pause, audio behavior, demo isolation, and third-party resources. A cross-check of the live UI, Privacy, Terms, demo documentation, and README found no unmatched public claim.

## Live accessibility, routes, privacy, and performance

- Live JavaScript SHA-256: `fcebad81b200894b279872fd960d317dee821a96ad1e1f731dc67642f719778b`.
- Live CSS SHA-256: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- The supplied `verify-url.sh` passed in 657 ms: correct title and language, one h1, a main landmark, complete image alt text, labelled buttons, and zero console/page errors.
- Playwright Axe found zero serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. The sound control passed the explicit `label-content-name-mismatch` rule in both states.
- Phone navigation targets measured at least 44 × 44 px. At 200% text size, the phone page kept its heading and primary action with no horizontal overflow. Reduced-motion media matched and motion durations were effectively instant at 0.01 ms.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles, one h1, a main landmark, and a skip link. Browser navigation restored and focused each route heading.
- `/missing-page` deliberately returned HTTP 404 with title `Page not found — Tilt Tag` and h1 **Page not found**. This expected 404 is not a defect. Every internal site link returned 200.
- The service worker controlled the demo, updated with no waiting worker, and reloaded the playable board offline with the cached-files notice.
- The recorded run made only same-origin GET requests. It set no cookie and made no analytics, advertising, account, payment, camera, location, or cross-origin resource request.
- Live response headers include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera/microphone/geolocation denial.
- At 4× CPU throttling, live game-loop work measured 1.357 ms average and 2.1 ms p95, below the claimed 20 ms ceiling.
- Mobile Lighthouse scored 94 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.410 s, CLS was 0.00068, total blocking time was 294 ms, and total transfer was 100.2 kB.

This is a static, local-first game. It has no backend, tenant, SQLite service, authentication, health endpoint, or request allowance. Backend isolation, restart persistence, and 429/Retry-After checks do not apply.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Game missing from the first phone screen | Repaired; the running board and movement pad are visible before scrolling. |
| 4× throttled frame claim failed | Repaired; the exact claim command passes and live work is 1.357 ms average. |
| Dialog focus escaped | Repaired; setup, pause, settings, and result regressions pass; live pause held focus through 12 Tabs. |
| Tilt calibration did not persist | Repaired; settings and accepted offsets survive reload. |
| Public input, mode, privacy, sharing, ads, analytics, and leaderboard claims lacked tests | Repaired; 24 registered outcome tests pass separately. |
| Demo and Terms phone targets were undersized | Repaired; every visible phone navigation target is at least 44 × 44 px. |
| Native iOS permission-sheet wording was untested | Resolved in scope; the OS-sheet promise is absent. Request timing, denial, and touch/key recovery are tested. |
| Start for real retained demo storage | Repaired; leaving demo removed all demo-prefixed keys and preserved real data. |
| Sound label was absent from its accessible name | Repaired; both sound states include their visible label and pass the explicit Axe rule. |
| Pause and 404 headings used mood or metaphor copy | Repaired; the headings are **Run paused** and **Page not found**. |

No physical iPhone was available for an optional Safari hardware smoke test. The product makes no native-sheet promise, and the observable permission timing and fallback behavior are claim-tested. This is not a finding or an untested public claim.

The first `verify-url.sh` attempt lacked its required output directory, and the first Lighthouse attempt lacked `CHROME_PATH`. Both tools were rerun unchanged after their documented prerequisites were supplied, and both completed successfully. These were verifier setup errors, not product failures.

There are zero findings of every severity and zero untested claims. **PASS.**
