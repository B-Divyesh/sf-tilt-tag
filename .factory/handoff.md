# Tilt Tag repair 5 handoff — PASS

## Result

Repair 5 resolves the only finding in `verification-5.md`. The public documentation no longer promises that physical iPhone Safari will display its native motion-permission sheet. It now states the behavior Tilt Tag controls: motion access starts after the player chooses **Use phone tilt**, and touch or keys remain available after denial.

- Verdict: **PASS**
- Findings remaining: **0**
- Untested public claims: **0**
- Implementation SHA: `32c0b3388829806461b39c49d0bbbd11e9d3925e`
- Documentation revision: the later report-only commit containing this handoff
- Live URL: <https://tilt-tag.sociobot.in>
- Deployment target: existing Azure Static Web App `sf-tilt-tag`

## First screen

Fresh 1440 × 900 desktop and 390 × 844 phone browsers showed the same clear entry before scrolling.

- Job: tilt a magnet and tag every target in a 90-second run.
- Audience: phone players who want one short browser challenge without an install.
- First action: **Try it with sample data**. The adjacent text says it opens the sample with touch and keys.
- The live board appears on both first screens. On the phone, the board starts at 602.7 px and the movement pad ends at 753.0 px inside the 844 px viewport.

## Repair

- Replaced the untestable README statement, “iOS asks for motion permission after a button press.”
- Changed the setup explanation to describe the browser request and available fallback in plain words.
- Added registered claim `motion-permission-request`.
- Added an outcome-based browser test. It instruments the browser motion-permission API, proves zero calls before player input, one call after **Use phone tilt**, then denies access and moves the magnet with the fallback controls.
- The claim registry now has 24 entries and exactly one tagged test for each entry.

## Clean-checkout verification

A fresh remote clone was detached at the implementation SHA and installed with the documented setup:

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
```

Results on 2026-09-05 UTC:

- All 24 exact commands in `.factory/claims.json` passed independently.
- `npm audit --omit=dev`: 0 vulnerabilities.
- ESLint and strict TypeScript: passed.
- Vitest: 6/6 passed.
- Playwright Chromium 1.58.2: 28/28 passed.
- Production build: JavaScript 34,103 B (11.09 kB gzip); CSS 16,147 B (4.49 kB gzip).
- `dist/index.html` and the complete static deployment output were produced.

## Deployment and live checks

The exact clean build was deployed to the existing product resource. The custom domain remained ready and returned HTTPS 200.

- Local and live JavaScript are byte-identical: SHA-256 `1b6d9c0a6df74607966ef3c8ca22d70a48ec0651bff341e0fe701b9e213b74c6`.
- Local and live CSS are byte-identical: SHA-256 `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- The URL verifier passed in 661 ms with the correct title and language, one h1, one main landmark, complete image alt text, labelled buttons, and no console errors.
- The one-click sample showed the persistent demo label, sample best score 1,850, daily seed `39VPBR`, a 1:30 timer, and three shields.
- Reset removed a demo-only marker and preserved a real-game marker. **Start for real** copied no demo progress.
- A recorded deterministic run reached “You scored 0” and “The 90-second run is complete. You tagged 0 targets.” **Play again** reset score 0, three shields, and state `playing`.
- Live keyboard input moved the magnet from x=180 to x=193.3. Live touch input moved it from x=180 to x=195.9.
- Escape opened the pause dialog. Focus stayed inside it for 20 Tab presses.
- The live motion-permission check recorded zero requests before **Use phone tilt**, one after the press, and active play through the denied-access fallback.
- Demo traffic stayed on the Tilt Tag origin. Browser checks recorded no unexpected console or page errors.
- Service-worker update and offline demo reload passed. The offline notice appeared with the playable sample.
- Reduced motion matched, relevant transition duration was effectively zero, and 200% text caused no horizontal overflow.
- At 4× CPU throttling, live game-loop work measured 0.633 ms average and 1.3 ms p95 against the 20 ms claim limit.
- Lighthouse mobile: performance 90, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.3 s, CLS 0.001, TBT 420 ms.

## Accessibility, routes, privacy, and links

- Live Axe checks found zero violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and the designed 404.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles, one h1, and one main landmark.
- `/missing-page` returned the designed page with the expected HTTP 404 and `Page not found — Tilt Tag` title.
- All same-origin navigation destinations returned their expected status. The external Factory and email links were not requested because they are outside this product scope.
- Live responses include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera, microphone, and geolocation denial.
- This free, static, local-first game has no backend, tenants, payment offer, accounts, or request API. SQLite, restart persistence, health, tenant isolation, billing registration, and 429 checks do not apply.

## Earlier finding disposition

| Earlier finding | Current evidence | Disposition |
| --- | --- | --- |
| Game missing from the first phone screen | Board and pad are inside the 390 × 844 first viewport | Repaired |
| Throttled loop timing failed | 0.633 ms average and 1.3 ms p95 live | Repaired |
| Dialog focus escaped | Dialog suite passed; live pause held focus through 20 Tabs | Repaired |
| Calibration did not persist | Settings and accepted offsets pass reload coverage | Repaired |
| Input, mode, audio, demo, and resource claims were missing | Current registry and all 24 commands pass | Repaired |
| Demo and Terms phone targets were undersized | Current mobile measurement regression passes | Repaired |
| Sharing, ads, analytics, and leaderboard claims were missing | Their four tagged outcome tests pass independently | Repaired |
| Native iOS sheet was an untested public claim | The OS-sheet promise was removed; app-controlled request timing and denial recovery now have one registered outcome test | Repaired |

## Remaining hardware note

No physical iPhone was available, so Apple’s native permission sheet was not observed. Tilt Tag does not claim that operating-system outcome. The browser request boundary, granted synthetic tilt path, denied path, touch path, and keyboard path are tested. A physical-device smoke test remains useful for broad browser coverage, but it is not an untested product claim or a release blocker.

## Evidence

- Repair evidence: `/work/.evidence/tilt-tag-repair-5/`
- Clean claim transcript: `/work/.evidence/tilt-tag-repair-5/clean-claim-commands.log`
- Clean quality gates: `/work/.evidence/tilt-tag-repair-5/clean-quality-gates.log`
- Recorded run: `/work/.evidence/tilt-tag-repair-5/deterministic-run.webm`
- Live browser results: `/work/.evidence/tilt-tag-repair-5/live-browser-results.json`
- URL verifier: `/work/.evidence/tilt-tag-repair-5/verify-url/verify.json`
- Lighthouse: `/work/.evidence/tilt-tag-repair-5/lighthouse.json`
- Required catalog copy: `/work/.evidence/catalog-description.txt`
