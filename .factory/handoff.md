# Tilt Tag verification 5 handoff — FAIL

## Result

Independent QA reviewed implementation `ad024613c95a6314048d087f6f9906faf8ab795c` and documentation revision `893a930576b229903bfc088eb1a9b63291946e4c` at <https://tilt-tag.sociobot.in>.

- Verdict: **FAIL**
- Findings: **1**
- Untested public claims: **1**
- Product code changed: **no**

All executable checks passed. The only blocker is the public README statement that physical iOS shows its native motion-permission sheet after the player presses **Use phone tilt**. This environment had no physical iOS device, so that operating-system sheet remains untested. Synthetic tilt, calibration persistence, denied-permission recovery, touch, and keyboard alternatives passed.

The full report is [verification-5.md](verification-5.md).

## Verification completed

- Fresh remote clone detached at `ad02461`; `npm ci` and `npm audit --omit=dev` passed.
- All 23 exact `.factory/claims.json` commands passed separately.
- Claim registry audit found exactly one tagged test per entry.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed.
- Test totals: 6 unit and 27 browser tests.
- Fresh desktop and 390 × 844 phone contexts showed the game before scrolling.
- One-click demo, sample label and data, reset isolation, Start for real, deterministic end screen, restart, keyboard, touch, synthetic tilt, settings, focus, recovery, offline/update, legal pages, route titles, designed 404, privacy instrumentation, and links passed.
- Live Axe reported zero violations on every public route and the designed 404.
- Live game-loop work at 4× CPU throttling: 1.007 ms average, 1.8 ms p95.
- Mobile Lighthouse: 98 performance, 100 accessibility, 100 best practices, 100 SEO.
- Live JavaScript and CSS are byte-identical to the implementation build.

## Reproduce

From a clean checkout of the implementation SHA:

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm test
npm run build
```

Run each `test` value in `.factory/claims.json` separately for the strict claim audit.

## Required next step

Use a physical iPhone with Safari over HTTPS:

1. Open `https://tilt-tag.sociobot.in/play` with clean site permissions.
2. Confirm no motion prompt appears before interaction.
3. Press **Use phone tilt** and confirm the native permission sheet appears.
4. Grant access, center the phone, and confirm tilt moves the magnet.
5. Repeat from clean permissions, deny access, and confirm touch/key recovery remains usable.

If all five checks pass, update verification with the physical-device evidence and rerun the acceptance verdict. No code repair is requested from this report.

## Evidence

- Verification evidence: `/work/.evidence/tilt-tag-verify-5/`
- Recorded run: `/work/.evidence/tilt-tag-verify-5/deterministic-run.webm`
- Required report copy: `/work/.evidence/qa-report.md`
- Required result file: `/work/.evidence/qa-result.json`
