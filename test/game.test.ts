import { describe, expect, it } from 'vitest';
import { createGame, dailySeed, secondsLeft, stepGame } from '../src/game';

describe('deterministic game core', () => {
  it('creates the same field from the same seed', () => {
    const first = createGame(42);
    const second = createGame(42);
    expect(first.target).toEqual(second.target);
    expect(first.hazards).toEqual(second.hazards);
  });

  it('@claim:core-rules targets add points and hazards remove shields', () => {
    const state = createGame(77);
    state.hazards.forEach((hazard) => { hazard.activeAt = 999; });
    state.target.x = state.player.x;
    state.target.y = state.player.y;
    stepGame(state, { x: 0, y: 0 }, 1 / 60);
    expect(state.score).toBe(100);
    state.target.x = 20;
    state.target.y = 80;
    const hazard = state.hazards[0];
    hazard.activeAt = 0;
    hazard.x = state.player.x;
    hazard.y = state.player.y;
    hazard.vx = 0;
    hazard.vy = 0;
    stepGame(state, { x: 0, y: 0 }, 1 / 60);
    expect(state.shields).toBe(2);
  });

  it('creates one UTC seed per day', () => {
    expect(dailySeed(new Date('2026-09-01T00:01:00Z'))).toBe(dailySeed(new Date('2026-09-01T23:59:00Z')));
    expect(dailySeed(new Date('2026-09-01T23:59:00Z'))).not.toBe(dailySeed(new Date('2026-09-02T00:01:00Z')));
  });

  it('moves the player and clamps a stalled frame', () => {
    const state = createGame(51);
    const startX = state.player.x;
    stepGame(state, { x: 1, y: 0 }, 2);
    expect(state.player.x).toBeGreaterThan(startX);
    expect(state.elapsed).toBeLessThanOrEqual(1 / 30);
  });

  it('ends when the timer reaches zero', () => {
    const state = createGame(99, 0.05);
    stepGame(state, { x: 0, y: 0 }, 1 / 30);
    stepGame(state, { x: 0, y: 0 }, 1 / 30);
    expect(state.status).toBe('ended');
    expect(secondsLeft(state)).toBe(0);
  });
});
