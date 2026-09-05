# Tilt Tag review 2 — Tilt a magnet and tag targets

**Verdict: FAIL**

- Findings: **2**
- Untested public claims: **0**
- Implementation reviewed: `b205988b415d70a878f736ece3f29432f114030a`
- Documentation baseline reviewed: `5f102f2ee0ff3762325350eb605030625092b803`
- Live URL: <https://tilt-tag.sociobot.in>
- Reviewed: 2026-09-05 UTC

The live assets match the implementation candidate. The later documentation commit changes only `.factory/handoff.md` and adds `.factory/verification-7.md`.

## First screen

Fresh desktop and 390 × 844 phone browsers stated these points before scrolling:

- Job: **Tilt a magnet. Tag every target.**
- Audience: phone players who want one 90-second challenge without an install.
- First action: **Try it with sample data**. The adjacent text says it opens a sample run with touch and keys.

The playable board begins at 286.5 px on desktop and 602.7 px on the phone. The phone movement pad ends at 753.0 px, inside the first 844 px viewport. There is no horizontal overflow. This is the game itself, not a menu wall.

## Findings

### Medium — the sound button's visible label is missing from its accessible name

The live first-screen game and play HUD show a button with visible text **Sound on** and accessible name **Mute sound**:

```html
<button aria-label="Mute sound">Sound on</button>
```

The visible text is not part of the accessible name. The inverse state similarly shows **Sound off** with accessible name **Turn sound on**. This fails the WCAG 2.5.3 Label in Name check and prevents a voice-control user from reliably activating the control by its visible label.

The default Axe scan does not enable this experimental rule. A direct live `label-content-name-mismatch` Axe run reports one serious violation, and the fresh Lighthouse report records the same failing node. Give the control an accessible name that contains its visible text while still describing the action.

Evidence: `/work/.evidence/tilt-tag-review-2/lighthouse-mobile.json` and `phone-cold.png`.

### Low — two headings use metaphor or mood copy instead of naming the state

The supplied plain-words contract applies to every product page and says headings must not use metaphor or mood lines. Two live headings do:

- The 404 page h1 is **This target is out of range**, a game metaphor instead of **Page not found**.
- The paused dialog h2 is **Take your time**, a mood line instead of **Run paused**.

The nearby eyebrow or paragraph explains each state, but a heading list does not. Replace the headings with direct state names. The deliberate HTTP 404 response itself is correct and is not a defect.

## Demo and complete game run

- One click opened `/demo` with the persistent label **Demo — sample data, nothing is saved to your real game**.
- The standard sample showed 1:30, three shields, daily seed `39VPBR`, and sample best score 1,850.
- Reset demo removed a demo marker and retained a separate real marker.
- Start for real removed every `demo:tilt-tag:` key, including a paused run, and retained the real marker.
- A recorded phone run followed `/?e2e=1` to the active sample and the actual result screen: **You scored 0** and **The 90-second run is complete. You tagged 0 targets.**
- Play again reset the score to 0, shields to three, and board state to `playing`.
- Live keyboard input moved the magnet from x=180 to x=198.6. Escape paused the run. Twelve Tab presses stayed inside the setup dialog.
- When motion support was removed, the game explained that tilt was unavailable and touch or keys started a playable run.

Run evidence: `/work/.evidence/tilt-tag-review-2/a29399a2b22b8a7f5c6a44c7d71e9505.webm`, `phone-run-active.png`, `phone-end-screen.png`, and `live-review.json`.

## Clean checkout and claims

A detached clean worktree at the implementation commit was installed with `npm ci` before testing.

- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/`.
- `npm test`: passed — Vitest 6/6 and Playwright Chromium 28/28.
- Production output: JavaScript 34.24 kB (11.14 kB gzip); CSS 16.15 kB (4.49 kB gzip).
- Registry audit: 24 claims and exactly one matching `@claim:<id>` tag for each.
- Every exact command in `.factory/claims.json` passed separately: **24/24**.

The tested claims cover free/no-account access, run format and rules, completion and restart, sharing, settings and calibration persistence, the daily layout, local and sensor privacy, device access, ads, analytics, leaderboards, offline reload, frame work, tilt permission timing, tilt/touch/keyboard controls, Escape pause, audio behavior, demo isolation, and third-party resources. No public claim remains untested.

## Live routes, accessibility, privacy, and performance

- Live JavaScript and CSS hashes exactly match the candidate build. JS SHA-256: `e8d2836638433e5f19e81efcd01898ce00d5367c5d744d16d768093fbcee7bb5`; CSS SHA-256: `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.
- `verify-url.sh` passed in 691 ms with the correct title and language, one h1, a main landmark, image alt text, labelled buttons, and no console errors.
- Default live Axe scans found zero serious or critical violations on `/`, `/demo`, `/play`, `/privacy`, `/terms`, and `/missing-page`. The explicitly enabled label-in-name rule found the sound-button issue above.
- `/`, `/demo`, `/play`, `/privacy`, and `/terms` returned 200 with route-specific titles. `/missing-page` returned the designed page with HTTP 404 and `Page not found — Tilt Tag`. Its one 404 console entry is expected.
- All internal route links returned 200. External and email links were identified but not contacted.
- The service worker controlled a fresh demo, updated without a waiting worker, and reloaded the board offline with the cached-files notice.
- Reduced-motion media matched; relevant animation and transition durations were effectively zero.
- Requests throughout fresh loading, play, pause, and completion were same-origin GETs only. The demo set no cookie and used only `demo:tilt-tag:` storage.
- Security headers include HSTS, `nosniff`, `no-referrer`, a self-only CSP with `frame-ancestors 'none'`, and camera/microphone/geolocation denial.
- Live 4× CPU throttling measured 1.282 ms average and 2.0 ms p95 game-loop work, below the public 20 ms limit.
- Fresh mobile Lighthouse scores were Performance 92, Accessibility 100, Best Practices 100, and SEO 100. LCP was 1.591 s and CLS was 0.0007. The unweighted experimental label-in-name audit still failed as described above.

This is a static, local-first game. It has no backend, tenant, SQLite service, health endpoint, authentication, or request allowance, so backend isolation, restart persistence, and 429/Retry-After checks do not apply.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Game board missing from the first phone screen | Repaired; the board and movement pad are in the first 390 × 844 viewport. |
| 4× throttled frame-rate claim failed | Repaired; the exact claim command passes and the live average is 1.282 ms. |
| Dialog focus escaped | Repaired; automated dialog checks pass and 12 live Tab presses remained trapped. |
| Tilt calibration did not persist | Repaired; the registered persistence check passes. |
| Input, mode, privacy, sharing, advertising, analytics, and leaderboard promises lacked claims | Repaired; 24 outcome-based claim commands pass. |
| Demo and Terms mobile targets were undersized | Repaired; all five visible phone navigation targets are at least 44 × 44 px. |
| Native iOS permission-sheet wording was untested | Resolved in scope; the OS-sheet promise is absent and request timing plus denial recovery are tested. |
| Start for real retained demo storage | Repaired; live exit left no `demo:tilt-tag:` keys and retained real data. |

The earlier findings remain repaired. The two findings in this review are new. **FAIL.**
