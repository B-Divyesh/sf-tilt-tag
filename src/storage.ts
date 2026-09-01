import type { GameState } from './game';

export type ControlMode = 'tilt' | 'touch';
export type KeySet = 'arrows' | 'wasd';

export interface Settings {
  mode: ControlMode;
  invertX: boolean;
  seated: boolean;
  reducedMotion: boolean;
  mute: boolean;
  keySet: KeySet;
  calibrated: boolean;
  betaOffset: number;
  gammaOffset: number;
}

export interface Progress {
  bestScore: number;
  totalRuns: number;
  lastScore: number;
}

const SETTINGS_KEY = 'settings';
const PROGRESS_KEY = 'progress';
const RUN_KEY = 'run';

export function storageKey(demo: boolean, part: string): string {
  return `${demo ? 'demo:' : ''}tilt-tag:${part}`;
}

function read<T>(demo: boolean, part: string, fallback: T): T {
  try {
    const value = localStorage.getItem(storageKey(demo, part));
    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(demo: boolean, part: string, value: T): boolean {
  try {
    localStorage.setItem(storageKey(demo, part), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function defaultSettings(): Settings {
  return {
    mode: 'touch',
    invertX: false,
    seated: false,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    mute: false,
    keySet: 'arrows',
    calibrated: false,
    betaOffset: 0,
    gammaOffset: 0,
  };
}

export function loadSettings(demo: boolean): Settings {
  return read(demo, SETTINGS_KEY, defaultSettings());
}

export function saveSettings(demo: boolean, settings: Settings): boolean {
  return write(demo, SETTINGS_KEY, settings);
}

export function loadProgress(demo: boolean): Progress {
  const fallback = demo ? { bestScore: 1850, totalRuns: 4, lastScore: 1420 } : { bestScore: 0, totalRuns: 0, lastScore: 0 };
  return read(demo, PROGRESS_KEY, fallback);
}

export function saveProgress(demo: boolean, progress: Progress): boolean {
  return write(demo, PROGRESS_KEY, progress);
}

export function loadRun(demo: boolean): GameState | null {
  try {
    const raw = localStorage.getItem(storageKey(demo, RUN_KEY));
    if (!raw) return null;
    const state = JSON.parse(raw) as GameState;
    return state.status === 'ended' ? null : { ...state, status: 'paused' };
  } catch {
    return null;
  }
}

export function saveRun(demo: boolean, state: GameState | null): boolean {
  if (state === null) {
    try {
      localStorage.removeItem(storageKey(demo, RUN_KEY));
      return true;
    } catch {
      return false;
    }
  }
  return write(demo, RUN_KEY, state);
}

export function resetDemo(): void {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('demo:tilt-tag:')) localStorage.removeItem(key);
  }
}
