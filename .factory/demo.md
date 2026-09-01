# Tilt Tag demo

## Entry point

- Hosted: `https://tilt-tag.sociobot.in/demo`
- Local: `http://127.0.0.1:5173/demo`
- Query alternative: `/?demo=1`

The first-screen **Try it with sample data** action opens the same demo in one click.

## Sample data

The demo starts today's deterministic field immediately. It includes a sample best score of 1,850, four earlier runs, and a last score of 1,420. The live run accepts touch, pointer, and keyboard input.

## Isolation and reset

Demo reads and writes only local storage keys prefixed with `demo:tilt-tag:`. It never reads or changes the real `tilt-tag:` namespace. **Reset demo** deletes the demo prefix and starts a clean sample run. **Start for real** leaves the sandbox; demo values are not copied.

The service worker caches the same demo entry point and bundled sample state. After one online visit, the demo reloads offline.

## Verification shortcuts

`/demo?e2e=1` uses the same deterministic game but shortens the timer to 1.2 seconds. It exists only to test the end screen and restart without waiting 90 seconds. It does not change production gameplay at `/demo`.
