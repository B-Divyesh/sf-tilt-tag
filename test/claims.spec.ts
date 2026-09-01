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
    const cache = await caches.open('tilt-tag-v1');
    const keys = await cache.keys();
    return keys.some((request) => /\/assets\/main-.*\.js$/.test(new URL(request.url).pathname));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Play with sample scores' })).toBeVisible();
  await expect(page.getByText(/You are offline/)).toBeVisible();
  await context.close();
});

test('@claim:frame-rate keeps a 60 fps render cadence', async ({ page, context }) => {
  const session = await context.newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/demo');
  const timing = await page.evaluate(() => new Promise<{ average: number; p95: number }>((resolve) => {
    const samples: number[] = [];
    let previous = performance.now();
    const sample = (now: number) => {
      samples.push(now - previous);
      previous = now;
      if (samples.length < 90) requestAnimationFrame(sample);
      else {
        const usable = samples.slice(5).sort((a, b) => a - b);
        resolve({
          average: usable.reduce((sum, value) => sum + value, 0) / usable.length,
          p95: usable[Math.floor(usable.length * 0.95)],
        });
      }
    };
    requestAnimationFrame(sample);
  }));
  expect(timing.average).toBeLessThan(20);
  expect(timing.p95).toBeLessThan(36);
});

test('landing and game have no serious accessibility violations', async ({ page }) => {
  for (const path of ['/', '/demo']) {
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
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('[data-game-canvas]')).toBeVisible();
});
