export const BOARD_WIDTH = 360;
export const BOARD_HEIGHT = 600;
export const RUN_SECONDS = 90;

export type GameStatus = 'playing' | 'paused' | 'ended';

export interface Vector {
  x: number;
  y: number;
}

export interface Player extends Vector {
  vx: number;
  vy: number;
  radius: number;
}

export interface Target extends Vector {
  radius: number;
  phase: number;
}

export interface Hazard extends Vector {
  id: number;
  vx: number;
  vy: number;
  radius: number;
  activeAt: number;
}

export interface GameState {
  seed: number;
  rngState: number;
  elapsed: number;
  duration: number;
  status: GameStatus;
  score: number;
  shields: number;
  streak: number;
  targetsCollected: number;
  hazardHits: number;
  invulnerableFor: number;
  player: Player;
  target: Target;
  hazards: Hazard[];
}

export interface GameInput extends Vector {}

function nextRandom(state: GameState): number {
  let x = state.rngState | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.rngState = x >>> 0;
  return state.rngState / 4_294_967_296;
}

function seedRandom(seed: number): () => number {
  let value = seed >>> 0 || 0x6d2b79f5;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4_294_967_296;
  };
}

function makeTarget(state: GameState): Target {
  let candidate: Target = { x: BOARD_WIDTH / 2, y: 120, radius: 13, phase: nextRandom(state) * Math.PI * 2 };
  for (let attempt = 0; attempt < 16; attempt += 1) {
    candidate = {
      x: 34 + nextRandom(state) * (BOARD_WIDTH - 68),
      y: 70 + nextRandom(state) * (BOARD_HEIGHT - 130),
      radius: 13,
      phase: nextRandom(state) * Math.PI * 2,
    };
    const playerGap = Math.hypot(candidate.x - state.player.x, candidate.y - state.player.y);
    const hazardGap = state.hazards.every((hazard) => Math.hypot(candidate.x - hazard.x, candidate.y - hazard.y) > 65);
    if (playerGap > 90 && hazardGap) break;
  }
  return candidate;
}

export function createGame(seed: number, duration = RUN_SECONDS): GameState {
  const random = seedRandom(seed);
  const hazards: Hazard[] = Array.from({ length: 7 }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const speed = 24 + random() * 25 + index * 1.8;
    return {
      id: index,
      x: 45 + random() * (BOARD_WIDTH - 90),
      y: 90 + random() * (BOARD_HEIGHT - 170),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 15 + random() * 5,
      activeAt: index < 3 ? 0 : index < 5 ? 30 : 60,
    };
  });
  const state: GameState = {
    seed: seed >>> 0,
    rngState: (seed ^ 0xa5a5a5a5) >>> 0 || 1,
    elapsed: 0,
    duration,
    status: 'playing',
    score: 0,
    shields: 3,
    streak: 0,
    targetsCollected: 0,
    hazardHits: 0,
    invulnerableFor: 0,
    player: { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT - 90, vx: 0, vy: 0, radius: 17 },
    target: { x: BOARD_WIDTH / 2, y: 100, radius: 13, phase: 0 },
    hazards,
  };
  state.target = makeTarget(state);
  return state;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function overlaps(a: Vector & { radius: number }, b: Vector & { radius: number }): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) < a.radius + b.radius;
}

export function stepGame(state: GameState, input: GameInput, dt: number, seated = false): GameState {
  if (state.status !== 'playing' || dt <= 0) return state;
  const safeDt = Math.min(dt, 1 / 30);
  const acceleration = seated ? 210 : 310;
  const speedLimit = seated ? 175 : 235;
  const damping = Math.pow(0.16, safeDt);

  state.elapsed = Math.min(state.duration, state.elapsed + safeDt);
  state.invulnerableFor = Math.max(0, state.invulnerableFor - safeDt);
  state.player.vx = (state.player.vx + clamp(input.x, -1, 1) * acceleration * safeDt) * damping;
  state.player.vy = (state.player.vy + clamp(input.y, -1, 1) * acceleration * safeDt) * damping;
  const speed = Math.hypot(state.player.vx, state.player.vy);
  if (speed > speedLimit) {
    state.player.vx = (state.player.vx / speed) * speedLimit;
    state.player.vy = (state.player.vy / speed) * speedLimit;
  }
  state.player.x = clamp(state.player.x + state.player.vx * safeDt, state.player.radius, BOARD_WIDTH - state.player.radius);
  state.player.y = clamp(state.player.y + state.player.vy * safeDt, 58 + state.player.radius, BOARD_HEIGHT - state.player.radius);

  for (const hazard of state.hazards) {
    if (hazard.activeAt > state.elapsed) continue;
    const difficulty = seated ? 0.72 : 1;
    hazard.x += hazard.vx * safeDt * difficulty;
    hazard.y += hazard.vy * safeDt * difficulty;
    if (hazard.x < hazard.radius || hazard.x > BOARD_WIDTH - hazard.radius) {
      hazard.x = clamp(hazard.x, hazard.radius, BOARD_WIDTH - hazard.radius);
      hazard.vx *= -1;
    }
    if (hazard.y < 58 + hazard.radius || hazard.y > BOARD_HEIGHT - hazard.radius) {
      hazard.y = clamp(hazard.y, 58 + hazard.radius, BOARD_HEIGHT - hazard.radius);
      hazard.vy *= -1;
    }
    if (state.invulnerableFor === 0 && overlaps(state.player, hazard)) {
      state.shields -= 1;
      state.hazardHits += 1;
      state.streak = 0;
      state.invulnerableFor = 1.2;
      const dx = state.player.x - hazard.x || 1;
      const dy = state.player.y - hazard.y || 1;
      const distance = Math.hypot(dx, dy);
      state.player.vx = (dx / distance) * 210;
      state.player.vy = (dy / distance) * 210;
    }
  }

  if (overlaps(state.player, state.target)) {
    state.targetsCollected += 1;
    state.streak += 1;
    state.score += 100 + Math.min(100, Math.max(0, state.streak - 1) * 10);
    state.target = makeTarget(state);
  }

  if (state.elapsed >= state.duration || state.shields <= 0) state.status = 'ended';
  return state;
}

export function secondsLeft(state: GameState): number {
  return Math.max(0, Math.ceil(state.duration - state.elapsed));
}

export function dailySeed(date = new Date()): number {
  const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  let hash = 2166136261;
  for (const character of key) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seedLabel(seed: number): string {
  return seed.toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

export function cloneGame(state: GameState): GameState {
  return structuredClone(state);
}
