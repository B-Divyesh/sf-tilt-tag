# Verification 5 — Play a 90-second tilt and touch obstacle run

**Verdict: FAIL**

- Findings: **1**
- Untested public claims: **1**
- Declared claim commands passed: **23/23**
- Candidate implementation: `ad024613c95a6314048d087f6f9906faf8ab795c`
- Documentation revision reviewed: `893a930576b229903bfc088eb1a9b63291946e4c`
- Live URL: <https://tilt-tag.sociobot.in>
- Verified: 2026-09-05 UTC

The deployed game passed every executable check. It cannot receive a PASS because the public iOS permission-sheet statement was not tested on physical iOS hardware.

## First screen

Before scrolling in fresh desktop and 390 × 844 phone contexts:

- Job: tilt a magnet and tag every target in a 90-second run.
- Audience: phone players who want one short browser challenge without an install.
- First action: **Try it with sample data**. The adjacent text says it opens the sample with touch and keys.

The actual running board is on the first screen. On the phone, the board starts at 602.7 px and the movement pad ends at 753.0 px inside the 844 px viewport. The standard timer reads 1:30. The page is not a menu wall and has no horizontal overflow.

Evidence: `/work/.evidence/tilt-tag-verify-5/phone-cold-390x844.png`, `phone-cold-state.json`, and `desktop-cold.png`.

## Finding

### Blocker — the native iOS motion-permission sheet remains untested

The README says: “iOS asks for motion permission after a button press.” The `tilt-control` claim test uses a synthetic `DeviceOrientationEvent` in Chromium. It proves calibration and movement, but it cannot prove that physical iPhone Safari opens Apple’s native permission sheet at the correct time.

No physical iOS device or iOS device bridge was available. `xcrun`, `idevice_id`, and `ios_webkit_debug_proxy` are absent. Phone emulation and Playwright WebKit are not substitutes for this operating-system sheet.

The live browser did prove the related web behavior:

- synthetic calibrated tilt moved the magnet from x=180 to x=194.7;
- accepted offsets 14.5 and -6.25 persisted after reload;
- a simulated permission denial showed the touch/key recovery and that recovery started a run;
- touch and keyboard alternatives remained usable.

Required verification: on a physical iPhone in Safari, open `/play`, press **Use phone tilt**, confirm the native prompt appears only after that press, and check both grant and denial paths. This is one untested public claim and therefore a release blocker under this work order. No failing product behavior was observed.

## Clean checkout and quality gates

A fresh remote clone was detached at the implementation SHA, started clean, and was installed with `npm ci`.

- `npm audit --omit=dev`: passed, 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed, 6/6 Vitest and 27/27 Playwright tests.
- `npm run build`: passed and produced `dist/`.
- Build output: JavaScript 34,093 B, 11.09 kB gzip; CSS 16,147 B, 4.49 kB gzip.
- Initial fonts total 69,852 B. The phone hero is 11,204 B.
- Registry audit: 23 entries and exactly one matching `@claim:<id>` tag for each entry.

Every exact command in `.factory/claims.json` was run separately:

| Claim | Result |
| --- | --- |
| `free-access` | Pass |
| `run-format` | Pass |
| `core-rules` | Pass |
| `complete-run` | Pass |
| `run-restart` | Pass |
| `score-sharing` | Pass |
| `settings-persist` | Pass |
| `daily-layout` | Pass |
| `local-privacy` | Pass |
| `sensor-privacy` | Pass |
| `no-device-access` | Pass |
| `no-ads` | Pass |
| `no-analytics` | Pass |
| `no-public-leaderboards` | Pass |
| `offline-reload` | Pass |
| `frame-rate` | Pass |
| `tilt-control` | Pass |
| `touch-control` | Pass |
| `keyboard-modes` | Pass |
| `escape-pause` | Pass |
| `audio-mute-persistence` | Pass |
| `demo-reset-isolation` | Pass |
| `no-third-party-resources` | Pass |

Command transcripts: `/work/.evidence/tilt-tag-verify-5/claim-commands.log`, `claim-tag-audit.log`, and `quality-gates.log`.

## Candidate and live deployment

The later documentation commit changes no product image. The fresh candidate build and live deployment are byte-identical:

- JavaScript SHA-256: `e1331b0d112589673241f6694f66d44947365d3ee879bd5e838383d798b4c9a5`
- CSS SHA-256: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`

The URL verifier passed in 647 ms with the correct title and language, one h1, a main landmark, complete image alt text, labelled buttons, and no console errors. The first attempt lacked the verifier’s required output directory; creating that directory and rerunning the unchanged command passed. This was evidence-tool setup, not a product failure.

## Live demo and game run

- One click opened `/demo` with the persistent label “Demo — sample data, nothing is saved to your real game.”
- The sample showed best score 1,850 and daily seed `39VPBR`.
- **Reset demo** removed a demo-only marker and retained a distinct real marker.
- **Start for real** did not copy demo progress into real storage.
- A recorded deterministic run went from the title page through active play to the real score summary: “You scored 0” and “The 90-second run is complete. You tagged 0 targets.”
- Keyboard input moved the magnet from x=180 to x=190.9. A phone touch drag moved it from x=180 to x=195.9.
- **Play again** restored score 0, three shields, and the playing state.
- Escape paused the new run. Focus remained inside the pause dialog for 20 Tab presses.
- The score-sharing claim passed both system-share and clipboard-payload tests. In the live unprivileged headless browser, the native share API was absent and clipboard permission was denied; the game showed its clear recovery message instead of failing silently.

Run evidence: `/work/.evidence/tilt-tag-verify-5/deterministic-run.webm`, `phone-demo-active.png`, `phone-end-screen.png`, and `live-browser-results.json`.

## Accessibility, routes, and recovery

- Live Axe checks found 0 violations of any impact on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`.
- The skip link showed a 3 px mint focus outline. Setup, pause, settings, and result dialogs trapped and restored focus.
- Route changes and browser Back moved focus to the restored h1.
- All five visible phone header/footer links measured at least 44 × 44 CSS px. Demo and Terms were exactly 44 × 44 px.
- At 200% root text size, the 390 px page had no horizontal overflow and retained its h1 and primary action.
- Reduced-motion media matched. Relevant transitions and animations were 0.01 ms.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles, one h1, and one main landmark.
- `/missing-page` returned the designed page with the expected HTTP 404 and `Page not found — Tilt Tag` title. The deliberate 404 is not a defect.
- Every same-origin link returned 200. Privacy and Terms pages, `robots.txt`, and `sitemap.xml` are present.
- The service worker was active, `registration.update()` completed with no waiting worker, and a fresh demo reloaded offline with the cached-files notice.

## Privacy, security, and performance

- The live run made only GET requests to the Tilt Tag origin. Instrumented beacon, fetch, and XHR activity was empty. No cookies, ads, analytics, public ranking UI, or cross-origin resource appeared.
- Live responses include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and denial of camera, microphone, and geolocation.
- At 4× CPU throttling, live game-loop work measured 1.007 ms average and 1.8 ms p95 against the 20 ms claim ceiling.
- Mobile Lighthouse: performance 98, accessibility 100, best practices 100, SEO 100. FCP was 1.05 s, LCP 1.39 s, CLS 0.00068, and total blocking time 178 ms.
- The static, local-first product has no backend, tenants, SQLite service, authentication, or request API. Tenant isolation, restart persistence, health, and 429/Retry-After checks do not apply.

## Earlier finding disposition

| Earlier finding | Current evidence | Disposition |
| --- | --- | --- |
| Game missing from first phone screen | Board and pad are inside the 390 × 844 first viewport | Repaired |
| Throttled loop timing failed | 1.007 ms average and 1.8 ms p95 live | Repaired |
| Dialog focus escaped | All dialogs passed the suite; pause held focus through 20 Tabs live | Repaired |
| Calibration did not persist | Mode and offsets persisted before and after reload | Repaired |
| Input, mode, audio, demo, and resource claims were missing | Current 23-entry registry and full suite pass | Repaired |
| Demo and Terms phone targets were undersized | Both measure 44 × 44 px live | Repaired |
| Sharing, ads, analytics, and leaderboard claims were missing | Four tagged outcome tests pass independently | Repaired |
| Physical iOS permission sheet was not tested | No physical iOS hardware was available | Open blocker |

## Evidence

All verification-5 evidence is in `/work/.evidence/tilt-tag-verify-5/`. The required top-level copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.
