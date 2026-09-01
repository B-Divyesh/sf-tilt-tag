# Tilt Tag handoff

## Built

- A complete deterministic 90-second game loop: title, setup, play, pause, recovery, score summary, sharing, and one-tap replay.
- Daily UTC seeds, escalating moving hazards, three shields, target streak scoring, and local best scores.
- Phone-orientation permission and calibration, horizontal inversion, seated mode, touch pad, arrow keys, W A S D, reduced motion, persistent mute, and gesture-started audio.
- A one-click `/demo` with sample scores, isolated `demo:tilt-tag:` storage, reset, and a route into the real game.
- Local recovery for unfinished runs and a versioned service worker for offline reload after the first visit.
- Home, demo, play, privacy, terms, and designed 404 routes with History API navigation and route titles.
- Original cinematic observatory art, responsive WebP files, self-hosted fonts, metadata, social art, icons, sitemap, robots file, CSP, and cache rules.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
```

Results on 2026-09-01:

- Vitest: 5 passed.
- Playwright Chromium: 13 passed.
- Claim checks: free access, run rules, complete run, restart, persistent controls, daily seed, local data, sensor privacy, offline reload, and frame cadence passed.
- Axe browser scan: no serious or critical findings on `/` or `/demo`.
- Mobile browser check: no horizontal overflow at 390 × 844.
- Production bundle: 10.53 KB JS gzip and 4.20 KB CSS gzip.
- Largest responsive hero file: 29 KB WebP.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100.
- Lighthouse metrics: FCP 1.1 s, LCP 1.5 s, TBT 50 ms, CLS 0.
- Frame test: average frame interval stayed below 20 ms with 4× CPU throttling; the 95th percentile stayed below 36 ms.
- `npm audit`: 0 vulnerabilities.

## Known gaps

- Automated Chromium covers the permission fallback but cannot reproduce the native iOS motion-permission sheet. Verify tilt calibration on one current iPhone before a wide launch.
- Scores remain local by design. There is no account or public leaderboard.

## Next steps

- Deploy `dist/` through the factory static pipeline.
- Run the fleet URL verifier against the deployed URL.
- Smoke-test tilt calibration on iOS Safari and Android Chrome.
