# Verification 9 — Play a 90-second tilt and touch run

**Verdict: PASS**

- Findings: **0**
- Untested public claims: **0**
- Declared claim commands: **24/24 passed separately**
- Implementation reviewed: `22591cadfc2a59e510e67a98fff11d09c9fc52ac`
- Documentation baseline reviewed: `07df1b44797cdc515e1d6dd5a805e893b0a79676`
- Live URL: <https://tilt-tag.sociobot.in>
- Verified: 2026-09-06 UTC

The later commits change factory reports only. The deployed JavaScript and CSS are byte-identical to the clean production build from the implementation commit.

## Browser coverage

Playwright 1.58.2 and its documented Linux dependencies were installed before browser testing. Fresh profiles used these exact engines:

| Engine | Version | Desktop | Phone-sized 390 × 844 | Complete live run |
| --- | --- | --- | --- | --- |
| Chromium | 145.0.7632.6 | Pass | Pass | Timer ended at 0:00 with one shield |
| Firefox | 146.0.1 | Pass | Pass | Loss screen at 0:23 with zero shields |
| WebKit | 26.0 | Pass | Pass | Loss screen at 0:41 with zero shields |

All three runs started from the live home page, used the one-click sample, entered active play, accepted keyboard and touch-pointer input, paused with Escape, resumed, reached an actual result screen, and used **Play again**. Each result said **You scored 0** and identified either the completed timer or the broken final shield. Restart restored score 0, three shields, and `playing` state.

Recorded runs and end screens:

- `/work/.evidence/tilt-tag-verify-9/chromium-phone-run.webm` and `chromium-phone-end.png`
- `/work/.evidence/tilt-tag-verify-9/firefox-phone-run.webm` and `firefox-phone-end.png`
- `/work/.evidence/tilt-tag-verify-9/webkit-phone-run.webm` and `webkit-phone-end.png`

This product publicly describes itself as a one-player game. It does not promise multiplayer or rooms, so independent multiplayer clients do not apply. The repository does not promise a native iOS permission sheet. No physical phone or motion sensor was available; WebKit engine coverage and synthetic orientation events do not claim iPhone hardware coverage.

## First screen and sample

Before scrolling, fresh desktop and phone-sized profiles in every engine showed:

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. The adjacent text says it opens the sample with touch and keys.

The running game appears on the first screen. Desktop board positions were 282.5–286.5 px from the top. Phone board positions were 596.0–602.7 px, and movement pads ended at 747.0–753.0 px within the 844 px viewport. No engine had horizontal overflow.

One click opened `/demo`. Its persistent label said **Demo — sample data, nothing is saved to your real game.** The sample showed three shields, best score 1,850, and daily seed `3JVB0Q` in all engines. The timer was 1:30 when read immediately and 1:29 after navigation work in two runs.

In each engine, a fake real best score of 99,999 did not replace the sample best. **Reset demo** removed a demo marker and preserved the real marker and score. **Start for real** removed every `demo:tilt-tag:` key and retained the real data. All test data stayed inside fresh QA browser profiles.

## Input, settings, audio, and recovery

- Arrow input moved the magnet in each engine. Touch-pointer input with `pointerType: touch` moved it again.
- Inversion, seated mode, and W A S D moved in the expected direction. A paused real run and those settings survived a full document reload in every engine.
- Motion permission was requested zero times before **Use phone tilt** and once afterward. A simulated denial showed the recovery message and left touch and keys playable.
- Synthetic calibrated orientation moved the magnet in Chromium, Firefox, and WebKit. This verifies the web input path, not a physical sensor or operating-system permission sheet.
- Instrumented audio contexts started zero times before player input and once after input. Mute remained on after reload in all three engines.
- Escape opened **Run paused**. Twelve Tab presses remained inside its dialog in each engine.
- Reduced-motion media matched in every engine; relevant durations were 0.00001 s. At 200% root text size, the heading and primary action remained available with no horizontal overflow.
- A current active service worker with no waiting update cached the game shell in each engine. After switching the context offline, a user-triggered reload restored the board and showed **You are offline. Cached game files still work.**

The daily seed provided deterministic content. The normal timer boundary was observed in Chromium, while the zero-shield boundary was observed in Firefox and WebKit. Permission denial, unsupported input fallback in the declared suite, interrupted-run reload, restart, reset, and offline recovery all passed.

## Clean checkout and claims

The checkout was clean at the documentation baseline before testing. `npm ci` completed first, followed by installation of Chromium, Firefox, WebKit, and their Playwright system dependencies.

- `npm audit --omit=dev`: passed with 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: passed — Vitest 6/6 and Playwright Chromium 30/30.
- Build output: JavaScript 34,253 B (11.13 kB gzip); CSS 16,147 B (4.49 kB gzip).
- Registry audit: 24 unique entries, each with one command, one sandbox description, and exactly one `@claim:<id>` tag.
- Every exact command in `.factory/claims.json` was run separately: **24/24 passed**.

The live UI, README, Privacy, Terms, and demo documentation were checked against the registry. No public claim was missing a claim entry or observable test. Evidence: `/work/.evidence/tilt-tag-verify-9/claims.log`, `claim-registry-audit.txt`, and `quality-gates.log`.

## Accessibility, routes, privacy, and performance

- The supplied `verify-url.sh` passed in 779 ms: correct title and `lang=en`, one h1, one main landmark, complete image alt text, labelled buttons, and no page errors.
- Playwright Axe ran in Chromium, Firefox, and WebKit on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. All 18 scans found zero serious or critical violations.
- Every checked route had its expected title, one h1, one main landmark, `lang=en`, and a skip link. Privacy and Terms returned 200.
- `/missing-page` deliberately returned HTTP 404 with title `Page not found — Tilt Tag` and h1 **Page not found**. This expected response is not a defect.
- Every same-origin navigational link returned 200. Fragment links stayed on their page. External and email links were identified but not contacted.
- The complete runs made only same-origin GET requests, set no cookies, and produced no product console or page errors. The claim tests separately cover analytics, advertising, camera, location, public leaderboards, sensor storage, and third-party resources.
- Live headers include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera, microphone, and geolocation denial.
- Live 4× CPU-throttled game-loop work was 1.049 ms average and 1.6 ms p95, below the 20 ms claim ceiling. Unthrottled run measurements were also below 20 ms in all engines.
- Mobile Lighthouse scores were 96 performance, 100 accessibility, 100 best practices, and 100 SEO. FCP was 1.080 s, LCP 1.453 s, CLS 0.00068, total blocking time 229 ms, and transfer size 131,964 B.
- Live/local asset hashes match: JavaScript `fcebad81b200894b279872fd960d317dee821a96ad1e1f731dc67642f719778b`; CSS `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.

This is a static local-first game with no API, account, tenant, payment, health endpoint, server database, or rate-limited request allowance. Backend isolation, restart persistence, SQLite, and 429/Retry-After checks do not apply.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Game missing from the first phone screen | Repaired; all three engines show the board and movement pad before scrolling. |
| 4× throttled frame claim failed | Repaired; the declared command passes and live work is 1.049 ms average. |
| Modal focus escaped | Repaired; the suite passes and 12 live Tabs stayed inside the pause dialog in every engine. |
| Tilt calibration did not persist | Repaired; declared persistence passes, and saved controls recover in every engine. |
| Public input, mode, privacy, sharing, ads, analytics, and leaderboard claims lacked tests | Repaired; 24 separately run claim commands pass. |
| Demo and Terms phone targets were undersized | Repaired; the mobile regression and cross-engine phone layouts pass. |
| Native iOS permission-sheet wording was untested | Resolved in scope; that operating-system promise is not published. Permission timing and denial recovery pass in all engines. |
| Start for real retained demo data | Repaired; every engine removed all demo-prefixed keys and preserved real markers. |
| Sound label did not contain its visible label | Repaired; the regression and Axe scans pass. |
| Pause and 404 headings used indirect wording | Repaired; current headings are **Run paused** and **Page not found**. |

## Worker tooling notes

Playwright protocol-level `page.reload()` behaved inconsistently with service-worker-controlled Firefox and returned an internal error for offline WebKit. User-triggered reloads worked in both engines, restored the game, and passed the product assertions. This was unavailable worker automation infrastructure, not a product defect.

Playwright's WebKit screenshot helper injects a temporary inline style that the product CSP correctly blocks, producing a screenshot-only console message. A separate run without the screenshot helper produced no error during landing, navigation, keyboard, or touch play. Product console errors remain zero.

There are zero findings of every severity and zero untested public claims. **PASS.**
