# Tilt Tag verification 6 handoff — FAIL

## Result

Independent QA of implementation `32c0b3388829806461b39c49d0bbbd11e9d3925e` found one medium-severity defect. Documentation at verification start was `c072f675afa426a778620d54d17860de72f8b13a`.

- Verdict: **FAIL**
- Findings: **1**
- Untested public claims: **0**
- Live URL: <https://tilt-tag.sociobot.in>

## Finding

**Start for real does not discard demo storage.** After a live one-click demo, Reset demo, and Start for real, the app correctly changed to `/play` without touching a real-game marker, but `demo:tilt-tag:run` remained in localStorage. This violates the required demo-sandbox exit behavior. The existing demo claim verifies Reset demo only.

Repair by clearing the `demo:tilt-tag:` namespace on Start for real and adding a tagged claim test proving the exit removes demo keys while real keys remain intact.

## Verification completed

- Fresh desktop and 390 × 844 phone contexts showed the playable board on the first screen before scrolling.
- One-click sample loaded realistic populated data, a persistent sample label, seed `39VPBR`, best score 1,850, 1:30 timer, and three shields.
- Deterministic sample run reached the score summary; Play again reset active state, score, and shields.
- From a clean detached checkout: `npm ci`, audit, lint, typecheck, full tests (6/6 unit and 28/28 browser), build, and all 24 exact claim commands passed.
- Candidate and live JS/CSS were byte-identical.
- Live Axe Playwright scans found zero violations on all six required routes. Routes, designed 404, headers, privacy boundaries, and static-product scope checks passed.

## Reports

- Verification report: `.factory/verification-6.md`
- Evidence copy: `/work/.evidence/qa-report.md`
- Result JSON: `/work/.evidence/qa-result.json`
