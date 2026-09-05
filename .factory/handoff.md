# Tilt Tag repair 7 handoff

## Result

**PASS** — the two strict-review findings are repaired and the implementation is live at <https://tilt-tag.sociobot.in>.

- Implementation SHA: `22591cadfc2a59e510e67a98fff11d09c9fc52ac`
- Report baseline SHA: `ddfa8a2319d3d32b7c1b8fd5ea6e84052654d719` (the following metadata-only commit records this SHA)
- Public claims: 24 registered, 24 commands passed, 0 untested
- Billing: not applicable; the researched offer is free

## Repairs

The sound button now keeps its visible state at the start of its accessible name while also stating the action: **Sound on, mute sound** and **Sound off, turn sound on**. The browser regression checks both states through the computed accessible name and runs Axe's `label-content-name-mismatch` rule.

The pause dialog now uses **Run paused**. The deliberate 404 page now uses **Page not found** while retaining its HTTP 404 response. A browser regression checks the rendered heading roles and the route title.

## Clean verification

A detached clean checkout at the implementation SHA ran the documented setup and gates:

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm run build
npm test
```

All passed. Vitest passed 6/6 and Playwright passed 30/30. Every exact command in `.factory/claims.json` passed separately, 24/24. The production build emitted 34.25 kB JavaScript (11.13 kB gzip) and 16.15 kB CSS (4.49 kB gzip).

## Live verification

The deployed JavaScript and CSS match the clean build. JavaScript SHA-256 is `fcebad81b200894b279872fd960d317dee821a96ad1e1f731dc67642f719778b`; CSS SHA-256 is `8c47fdcf5261a867928b875d96b1555e0089cd02ec019343db4b88764c6171cc`.

- Fresh desktop and 390 × 844 phone browsers showed the job, audience, sample action, board, and movement pad before scrolling. The board began at 286.5 px desktop and 602.7 px phone; the phone pad ended at 753.0 px.
- The one-click demo showed its persistent sample label, 1:30 timer, three shields, best score 1,850, and seed `39VPBR`. Reset and Start for real removed demo data while preserving a real-data marker.
- A recorded deterministic run reached **You scored 0** and the 90-second result summary. Play again reset score, shields, and playing state. Keyboard and real touch events moved the magnet.
- The pause dialog retained focus for 12 Tab presses. The sound control passed the explicit live label-in-name rule. Default live Axe scans found no serious or critical violations on all five 200 routes.
- `/missing-page` returned HTTP 404 with title `Page not found — Tilt Tag` and h1 **Page not found**. All internal links and route-specific titles passed.
- Offline reload, service-worker update, reduced motion, 200% text resize, 44 px phone targets, same-origin privacy traffic, and 4×-throttled frame work passed. Live frame work was 1.07 ms average and 2.0 ms p95.
- Mobile Lighthouse scored 100 for performance, accessibility, best practices, and SEO. LCP was 1.447 s, CLS 0.00068, and total blocking time 61 ms. An initial Lighthouse browser process crashed; an unchanged retry completed successfully.
- `verify-url.sh` passed in 751 ms with zero console errors.

This is a static local-first game. Backend tenant, SQLite, health, authentication, and 429 checks do not apply.

## Earlier findings

| Finding | Current disposition |
| --- | --- |
| Game missing from the first phone screen | Repaired; board and movement pad are in the first viewport. |
| 4× throttled frame claim failed | Repaired; the claim and live measurement pass. |
| Dialog focus escaped | Repaired; setup, pause, settings, and result dialog checks pass. |
| Tilt calibration did not persist | Repaired; settings and offsets survive reload. |
| Public input, privacy, sharing, advertising, analytics, and leaderboard claims lacked tests | Repaired; 24 claim commands pass individually. |
| Demo and Terms phone targets were undersized | Repaired; every visible navigation target is at least 44 × 44 px. |
| Native iOS permission-sheet wording was untested | Resolved in scope; the OS-sheet promise is absent. Request timing and denial recovery are tested. |
| Start for real retained demo storage | Repaired; the live exit leaves no demo-prefixed keys. |
| Sound label was absent from its accessible name | Repaired; both states pass computed-name and Axe checks. |
| Pause and 404 headings used mood or metaphor copy | Repaired; both headings name their state directly. |

## Remaining follow-up

No product defect or untested public claim remains. A physical iPhone was unavailable for an optional Safari hardware smoke test; the product makes no native-sheet promise, and touch/key recovery is tested.

Evidence is in `/work/.evidence/tilt-tag-repair-7/`. The required top-level copies are `/work/.evidence/qa-report.md`, `/work/.evidence/qa-result.json`, and `/work/.evidence/catalog-description.txt`.
