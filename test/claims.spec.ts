import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('@claim:free-access the game is free and asks for no account', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Free to play.')).toBeVisible();
  await expect(page.getByText('No account.')).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('a[href*="checkout"], a[href*="billing"], a[href*="buy"]')).toHaveCount(0);
});

test('@claim:run-format a standard run starts at 90 seconds with three shields', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('[data-time]')).toHaveText('1:30');
  await expect(page.locator('[data-shields]')).toHaveAttribute('aria-label', '3 shields');
});

test('@claim:complete-run a run reaches its score summary', async ({ page }) => {
  await page.goto('/demo?e2e=1');
  await expect(page.getByRole('heading', { name: /You scored/ })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();
  await expect(page.getByText(/You tagged \d+ targets/)).toBeVisible();
});

test('@claim:run-restart play again resets the run', async ({ page }) => {
  await page.goto('/demo?e2e=1');
  await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('[data-score]')).toHaveText('0');
  await expect(page.locator('[data-shields]')).toHaveAttribute('aria-label', '3 shields');
  await expect(page.locator('[data-board]')).toHaveAttribute('data-state', 'playing');
});

test('@claim:settings-persist controls work and settings persist', async ({ page }) => {
  await page.goto('/play');
  await page.getByLabel('Invert left and right').check();
  await page.getByLabel('Seated mode: gentler speed').check();
  await page.getByLabel('Movement keys').selectOption('wasd');
  await page.getByRole('button', { name: 'Use touch or keys' }).click();
  const board = page.locator('[data-board]');
  const before = Number(await board.getAttribute('data-player-x'));
  await page.keyboard.down('d');
  await page.waitForTimeout(350);
  await page.keyboard.up('d');
  const after = Number(await board.getAttribute('data-player-x'));
  expect(after).toBeLessThan(before);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.reload();
  await expect(page.getByText('Saved run found')).toBeVisible();
  await page.getByRole('button', { name: 'Change controls' }).click();
  await expect(page.getByLabel('Invert left and right')).toBeChecked();
  await expect(page.getByLabel('Seated mode: gentler speed')).toBeChecked();
  await expect(page.getByLabel('Movement keys')).toHaveValue('wasd');
  await page.getByRole('button', { name: 'Recenter phone tilt' }).click();
  await expect(page.getByRole('heading', { name: 'Hold your phone comfortably' })).toBeVisible();
  await page.evaluate(() => {
    window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 14.5, gamma: -6.25 }));
  });
  await page.getByRole('button', { name: 'Center tilt and start' }).click();
  await page.getByRole('button', { name: 'Pause' }).click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('tilt-tag:settings') ?? '{}'));
  expect(stored).toMatchObject({ mode: 'tilt', calibrated: true, betaOffset: 14.5, gammaOffset: -6.25 });
  await page.reload();
  await expect(page.getByText('Saved run found')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tilt-tag:settings') ?? '{}'))).toMatchObject({
    mode: 'tilt', calibrated: true, betaOffset: 14.5, gammaOffset: -6.25,
  });
});

test('@claim:daily-layout today uses one deterministic seed', async ({ browser }) => {
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  const first = await firstContext.newPage();
  const second = await secondContext.newPage();
  await first.goto('/demo');
  await second.goto('/demo');
  await expect(first.locator('.game-foot')).toBeVisible();
  await expect(second.locator('.game-foot')).toBeVisible();
  expect(await first.locator('.game-foot').textContent()).toBe(await second.locator('.game-foot').textContent());
  await firstContext.close();
  await secondContext.close();
});

test('@claim:local-privacy demo traffic stays on origin and uses demo storage', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Pause' }).click();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.length).toBeGreaterThan(0);
  expect(keys.every((key) => key.startsWith('demo:tilt-tag:'))).toBe(true);
  expect(outsideRequests).toEqual([]);
});

test('@claim:sensor-privacy motion readings stay in memory', async ({ page }) => {
  const outsideRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outsideRequests.push(request.url());
  });
  await page.goto('/demo');
  await page.evaluate(() => {
    window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 33.3, gamma: 12.2 }));
  });
  await page.getByRole('button', { name: 'Pause' }).click();
  const storedValues = await page.evaluate(() => Object.values(localStorage).join(' '));
  expect(storedValues).not.toContain('33.3');
  expect(storedValues).not.toContain('12.2');
  expect(outsideRequests).toEqual([]);
});

test('@claim:no-device-access camera and location are never requested', async ({ page }) => {
  await page.addInitScript(() => {
    const calls = { camera: 0, location: 0 };
    Object.defineProperty(window, '__deviceCalls', { value: calls });
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { calls.camera += 1; throw new Error('blocked in test'); };
    navigator.geolocation.getCurrentPosition = () => { calls.location += 1; };
  });
  await page.goto('/demo');
  await page.waitForTimeout(250);
  const calls = await page.evaluate(() => (window as unknown as { __deviceCalls: { camera: number; location: number } }).__deviceCalls);
  expect(calls).toEqual({ camera: 0, location: 0 });
});

test('@claim:offline-reload works offline after the first visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, { timeout: 10_000 });
  await page.waitForFunction(async () => {
    const cache = await caches.open('tilt-tag-v2');
    const keys = await cache.keys();
    return keys.some((request) => /\/assets\/main-.*\.js$/.test(new URL(request.url).pathname));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Play with sample scores' })).toBeVisible();
  await expect(page.getByText(/You are offline/)).toBeVisible();
  await context.close();
});

test('@claim:frame-rate keeps average game-loop work under 20 ms', async ({ page, context }) => {
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/demo');
  const root = page.locator('[data-game-root]');
  await expect(root).toHaveAttribute('data-frame-work-average', /\d/, { timeout: 10_000 });
  const average = Number(await root.getAttribute('data-frame-work-average'));
  const p95 = Number(await root.getAttribute('data-frame-work-p95'));
  expect(average).toBeGreaterThanOrEqual(0);
  expect(average).toBeLessThan(20);
  expect(p95).toBeLessThan(20);
});

test('@claim:tilt-control calibrated phone tilt moves the magnet', async ({ page }) => {
  await page.addInitScript(() => {
    if (!('DeviceOrientationEvent' in window)) {
      class DeviceOrientationEventShim extends Event {
        beta: number | null;
        gamma: number | null;

        constructor(type: string, values: { beta?: number; gamma?: number }) {
          super(type);
          this.beta = values.beta ?? null;
          this.gamma = values.gamma ?? null;
        }
      }
      Object.defineProperty(window, 'DeviceOrientationEvent', { configurable: true, value: DeviceOrientationEventShim });
    }
  });
  await page.goto('/play');
  await page.getByRole('button', { name: 'Use phone tilt' }).click();
  await expect(page.getByRole('heading', { name: 'Hold your phone comfortably' })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 0, gamma: 0 })));
  await page.getByRole('button', { name: 'Center tilt and start' }).click();
  const board = page.locator('[data-board]');
  await expect(board).toHaveAttribute('data-state', 'playing');
  const before = Number(await board.getAttribute('data-player-x'));
  await page.evaluate(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 0, gamma: 12 })));
  await expect.poll(async () => Number(await board.getAttribute('data-player-x'))).toBeGreaterThan(before + 2);
});

test('@claim:touch-control dragging the movement pad moves the magnet', async ({ page }) => {
  await page.goto('/demo');
  const board = page.locator('[data-board]');
  const pad = page.locator('[data-touch-pad]');
  const knob = page.locator('[data-touch-knob]');
  await pad.scrollIntoViewIfNeeded();
  const padBox = await pad.boundingBox();
  expect(padBox).not.toBeNull();
  const before = Number(await board.getAttribute('data-player-x'));
  await page.mouse.move(padBox!.x + padBox!.width / 2, padBox!.y + padBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(padBox!.x + padBox!.width - 5, padBox!.y + padBox!.height / 2);
  await expect(knob).toHaveAttribute('style', /translate\(30px, 0px\)/);
  await page.waitForTimeout(300);
  await page.mouse.up();
  expect(Math.abs(Number(await board.getAttribute('data-player-x')) - before)).toBeGreaterThan(2);
});

test('@claim:keyboard-modes Arrow keys and W A S D both move the magnet', async ({ page }) => {
  await page.goto('/play');
  await page.getByRole('button', { name: 'Use touch or keys' }).click();
  const board = page.locator('[data-board]');
  const initial = Number(await board.getAttribute('data-player-x'));
  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => Number(await board.getAttribute('data-player-x'))).toBeGreaterThan(initial + 2);
  await page.keyboard.up('ArrowRight');
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByRole('button', { name: 'Change controls' }).click();
  await page.getByLabel('Movement keys').selectOption('wasd');
  await page.getByRole('button', { name: 'Save and resume' }).click();
  const afterArrows = Number(await board.getAttribute('data-player-x'));
  await page.keyboard.down('d');
  await expect.poll(async () => Number(await board.getAttribute('data-player-x'))).toBeGreaterThan(afterArrows + 2);
  await page.keyboard.up('d');
});

test('@claim:escape-pause Escape pauses an active run', async ({ page }) => {
  await page.goto('/demo');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Take your time' })).toBeVisible();
  await expect(page.locator('[data-board]')).toHaveAttribute('data-state', 'paused');
});

test('@claim:audio-mute-persistence sound waits for input and mute survives reload', async ({ page }) => {
  await page.addInitScript(() => {
    class TestAudioContext {
      static starts = 0;
      currentTime = 0;
      destination = {};

      constructor() {
        TestAudioContext.starts += 1;
        (window as unknown as { __audioStarts: number }).__audioStarts = TestAudioContext.starts;
      }

      createOscillator() {
        return {
          frequency: { value: 0 }, type: 'sine', connect: () => ({ connect: () => undefined }), start: () => undefined, stop: () => undefined,
        };
      }

      createGain() {
        return {
          gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined }, connect: () => this.destination,
        };
      }
    }
    Object.defineProperty(window, '__audioStarts', { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: TestAudioContext, writable: true });
  });
  await page.goto('/demo');
  expect(await page.evaluate(() => (window as unknown as { __audioStarts: number }).__audioStarts)).toBe(0);
  await page.keyboard.down('ArrowRight');
  await page.keyboard.up('ArrowRight');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __audioStarts: number }).__audioStarts)).toBe(1);
  await page.getByRole('button', { name: 'Mute sound' }).click();
  await expect(page.getByRole('button', { name: 'Turn sound on' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn sound on' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('demo:tilt-tag:settings') ?? '{}').mute)).toBe(true);
});

test('@claim:demo-reset-isolation demo ignores real storage and reset leaves it intact', async ({ page }) => {
  const realSettings = {
    mode: 'tilt', invertX: true, seated: true, reducedMotion: true, mute: true, keySet: 'wasd', calibrated: true, betaOffset: 19, gammaOffset: -8,
  };
  await page.goto('/play');
  await page.evaluate((settings) => {
    localStorage.setItem('tilt-tag:settings', JSON.stringify(settings));
    localStorage.setItem('tilt-tag:progress', JSON.stringify({ bestScore: 99999, totalRuns: 7, lastScore: 777 }));
  }, realSettings);
  await page.goto('/demo');
  await expect(page.locator('[data-best]')).toHaveText('1,850');
  await expect(page.getByRole('button', { name: 'Mute sound' })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('demo:tilt-tag:reset-marker', 'remove me'));
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo reset')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('demo:tilt-tag:reset-marker'))).toBeNull();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tilt-tag:settings') ?? '{}'))).toEqual(realSettings);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('tilt-tag:progress') ?? '{}'))).toEqual({ bestScore: 99999, totalRuns: 7, lastScore: 777 });
});

test('@claim:no-third-party-resources demo loads no third-party scripts, fonts, or trackers', async ({ page }) => {
  const requestOrigins: string[] = [];
  page.on('request', (request) => requestOrigins.push(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Pause' }).click();
  const ownOrigin = new URL(page.url()).origin;
  expect(requestOrigins.length).toBeGreaterThan(0);
  expect(requestOrigins.every((origin) => origin === ownOrigin)).toBe(true);
  const resourceOrigins = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => new URL(entry.name).origin));
  expect(resourceOrigins.every((origin) => origin === ownOrigin)).toBe(true);
});

test('landing and game have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/demo', '/play', '/privacy', '/terms', '/missing-page']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
    expect(serious).toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
  }
});

test('mobile layout stays inside the viewport and navigation works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tilt a magnet. Tag every target.');
  const board = page.locator('[data-home-game-root] [data-game-canvas]');
  const pad = page.locator('[data-home-game-root] [data-touch-pad]');
  await expect(board).toBeVisible();
  await expect(pad).toBeVisible();
  const boardBox = await board.boundingBox();
  const padBox = await pad.boundingBox();
  expect(boardBox).not.toBeNull();
  expect(padBox).not.toBeNull();
  expect(boardBox!.y).toBeLessThan(844);
  expect(padBox!.y + padBox!.height).toBeLessThanOrEqual(844);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('[data-game-canvas]')).toBeVisible();
});

test('setup, pause, settings, and end dialogs trap and restore focus', async ({ page }) => {
  const assertFocusStaysInDialog = async (tabs: number) => {
    for (let index = 0; index < tabs; index += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return Boolean(dialog && dialog.contains(document.activeElement));
      })).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement))).toBe(true);
  };

  await page.goto('/play');
  await assertFocusStaysInDialog(12);
  const keySelect = page.getByLabel('Movement keys');
  await keySelect.focus();
  await page.keyboard.press('ArrowDown');
  await expect(keySelect).toHaveValue('wasd');
  await page.getByRole('button', { name: 'Use touch or keys' }).click();
  const pause = page.getByRole('button', { name: 'Pause' });
  await pause.click();
  await assertFocusStaysInDialog(8);
  await page.getByRole('button', { name: 'Change controls' }).click();
  await assertFocusStaysInDialog(12);
  await page.getByRole('button', { name: 'Save and resume' }).click();
  await expect(pause).toBeFocused();

  await page.goto('/demo?e2e=1');
  await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible({ timeout: 5_000 });
  await assertFocusStaysInDialog(8);
});

test('title-to-end, keyboard, touch, and tilt fallback flows are playable', async ({ page }) => {
  await page.goto('/?e2e=1');
  await expect(page.locator('[data-home-game-root] [data-board]')).toHaveAttribute('data-state', 'playing');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\?e2e=1$/);
  await expect(page.getByRole('heading', { name: /You scored/ })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.locator('[data-board]')).toHaveAttribute('data-state', 'playing');

  let startX = Number(await page.locator('[data-board]').getAttribute('data-player-x'));
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowRight');
  expect(Number(await page.locator('[data-board]').getAttribute('data-player-x'))).toBeGreaterThan(startX);

  const padBox = await page.locator('[data-touch-pad]').boundingBox();
  expect(padBox).not.toBeNull();
  startX = Number(await page.locator('[data-board]').getAttribute('data-player-x'));
  await page.mouse.move(padBox!.x + padBox!.width / 2, padBox!.y + padBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(padBox!.x + padBox!.width - 5, padBox!.y + padBox!.height / 2);
  await page.waitForTimeout(300);
  await page.mouse.up();
  expect(Number(await page.locator('[data-board]').getAttribute('data-player-x'))).toBeGreaterThan(startX);

  await page.addInitScript(() => { delete (window as unknown as { DeviceOrientationEvent?: unknown }).DeviceOrientationEvent; });
  await page.goto('/play');
  await page.getByRole('button', { name: 'Use phone tilt' }).click();
  await expect(page.getByText('Tilt is not available in this browser. Use touch or keys instead.')).toBeVisible();
  await page.getByRole('button', { name: 'Use touch or keys' }).click();
  await expect(page.locator('[data-board]')).toHaveAttribute('data-state', 'playing');
});
