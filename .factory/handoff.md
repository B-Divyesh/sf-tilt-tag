# Tilt Tag verification 8 handoff

## Result

**PASS** — fresh independent verification found zero findings and zero untested public claims at <https://tilt-tag.sociobot.in>.

- Implementation SHA: `22591cadfc2a59e510e67a98fff11d09c9fc52ac`
- Documentation baseline SHA: `98f2e6b3b70599c0b838f107f35d915eb35671c8`
- Verification report: `.factory/verification-8.md`
- Public claims: 24 registered, 24 exact commands passed, 0 untested
- Billing and backend checks: not applicable; this is a free static local-first game

## Verification completed

A detached clean implementation checkout passed `npm ci`, audit, lint, typecheck, build, Vitest 6/6, and Playwright 30/30. Every command in `.factory/claims.json` passed separately. The build produced 34.25 kB JavaScript and 16.15 kB CSS.

Fresh desktop and phone browsers showed the job, audience, sample action, running board, and movement pad before scrolling. The one-click demo showed its persistent sample label, standard timer, three shields, sample score, and daily seed. Reset and Start for real removed only demo data. A recorded deterministic phone run reached the actual result screen, and Play again reset the run.

Live accessibility, keyboard focus, touch targets, 200% text, reduced motion, route titles, legal pages, expected 404, internal links, privacy traffic, service-worker update, offline reload, and recovery paths passed. At 4× CPU throttling, game-loop work measured 1.357 ms average and 2.1 ms p95. Mobile Lighthouse scored 94 performance and 100 in accessibility, best practices, and SEO.

The deployed JavaScript and CSS match the implementation build byte for byte. Full evidence is in `/work/.evidence/tilt-tag-verify-8/`.

## Run again

```sh
npm ci
npm audit --omit=dev
npm run lint
npm run typecheck
npm run build
npm test
```

Run each `test` command in `.factory/claims.json` separately for the claims gate. For the deployed site, run:

```sh
mkdir -p /work/.evidence/tilt-tag-verify-8/verify-url
/opt/fleet/lib/verify-url.sh https://tilt-tag.sociobot.in /work/.evidence/tilt-tag-verify-8/verify-url
```

## Remaining work

No product defect or untested public claim remains. A physical-iPhone Safari smoke test is optional because the product makes no native permission-sheet promise; permission timing, denial, and fallback controls are covered by browser tests.
