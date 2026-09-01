# Tilt Tag

Tilt a magnet through a 90-second daily obstacle run. It is a one-player browser game for phones, keyboards, and touch screens.

Each run starts with three shields. Collect round mint targets for points and avoid red triangle hazards. The daily UTC seed gives every player the same starting layout. A score summary ends the run, and **Play again** resets it in one tap.

## Try the demo

Open `/demo` or `/?demo=1`. The hosted URL is <https://tilt-tag.sociobot.in/demo>.

The demo starts one sample run with a sample best score. Its local storage keys start with `demo:tilt-tag:`. **Reset demo** removes those keys, and demo mode never reads or changes real game keys.

## Controls and accessibility

- Calibrate phone tilt on supported devices. iOS asks for motion permission after a button press.
- Drag the on-screen movement pad on any pointer or touch device.
- Choose arrow keys or W A S D. Press Escape to pause.
- Switch on inversion, seated mode, or reduced motion before or during a run.
- Sound starts only after player input. The mute setting persists.

Control settings, chosen tilt calibration offsets, best scores, run counts, and unfinished runs stay in local browser storage. Other live motion readings are not stored or sent. The service worker makes the game work offline after the first visit. Average game-loop work stays under 20 ms in the 4× CPU-throttled browser test.

## Develop

Requirements: Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173>. The project has no runtime API, database, account, analytics, or third-party asset request.

## Test

```sh
npm test
npm run lint
npm run typecheck
```

These commands run deterministic core tests, Playwright 1.58.2 browser tests, ESLint, and strict TypeScript checks. The suite checks the full run, restart, controls, persistence, demo isolation, offline reload, game-loop work, accessibility, and the 390 px layout. Claim definitions and their exact commands are in [`.factory/claims.json`](.factory/claims.json).

## Build and deploy

```sh
npm run build
```

The exact build command emits the static site to `dist/`, with `dist/index.html` at its root. Deploy that directory to Azure Static Web Apps. `staticwebapp.config.json` supplies the SPA fallback, 404 response, cache rules, CSP, and security headers.

## Project notes

- Intended session: one or two 90-second runs.
- Game state: localStorage only; no sensor values leave the page.
- Art: original factory-generated scene plus original Canvas geometry. Provenance is in [`.factory/design.md`](.factory/design.md).
- Product brief: [`.factory/brief.json`](.factory/brief.json).
- Demo contract: [`.factory/demo.md`](.factory/demo.md).
- License: [MIT](LICENSE).
