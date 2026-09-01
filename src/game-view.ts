import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  RUN_SECONDS,
  createGame,
  dailySeed,
  secondsLeft,
  seedLabel,
  stepGame,
  type GameInput,
  type GameState,
} from './game';
import {
  loadProgress,
  loadRun,
  loadSettings,
  saveProgress,
  saveRun,
  saveSettings,
  type Progress,
  type Settings,
} from './storage';

interface OrientationPermissionEvent extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

interface OrientationConstructor {
  new(type: string, eventInitDict?: DeviceOrientationEventInit): OrientationPermissionEvent;
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const FIXED_STEP = 1 / 60;

export class GameView {
  private root: HTMLElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private demo: boolean;
  private state: GameState;
  private settings: Settings;
  private progress: Progress;
  private input: GameInput = { x: 0, y: 0 };
  private keys = new Set<string>();
  private raf = 0;
  private lastFrame = 0;
  private accumulator = 0;
  private lastSavedSecond = -1;
  private orientation = { beta: 0, gamma: 0 };
  private pointerId: number | null = null;
  private audio: AudioContext | null = null;
  private disposed = false;
  private resultRecorded = false;

  constructor(root: HTMLElement, demo: boolean) {
    this.root = root;
    this.demo = demo;
    this.settings = loadSettings(demo);
    this.progress = loadProgress(demo);
    const duration = new URLSearchParams(location.search).get('e2e') === '1' ? 1.2 : RUN_SECONDS;
    this.state = loadRun(demo) ?? createGame(dailySeed(), duration);
    if (demo && this.state.status === 'paused') this.state.status = 'playing';

    this.root.innerHTML = this.markup();
    const canvas = this.root.querySelector<HTMLCanvasElement>('[data-game-canvas]');
    if (!canvas) throw new Error('Game canvas did not load. Reload the page and try again.');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable. Use a current browser to play.');
    this.canvas = canvas;
    this.context = context;
    this.bind();
    this.resizeCanvas();
    this.render();

    if (demo) {
      this.state.status = 'playing';
      this.hideOverlay();
      this.announce('Sample run started. Move with touch, arrow keys, or W A S D.');
    } else if (this.state.status === 'paused' && this.state.elapsed > 0) {
      this.showOverlay('resume');
    } else if (!this.settings.calibrated) {
      this.state.status = 'paused';
      this.showOverlay('setup');
    } else {
      this.state.status = 'playing';
      this.hideOverlay();
    }
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    window.addEventListener('deviceorientation', this.onOrientation);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  private markup(): string {
    return `
      <section class="game-instrument" aria-label="Tilt Tag game">
        <div class="game-hud" aria-label="Run status">
          <div><span>Time</span><strong data-time>1:30</strong></div>
          <div><span>Score</span><strong data-score>0</strong></div>
          <div><span>Shields</span><strong data-shields aria-label="3 shields">● ● ●</strong></div>
          <button class="icon-button" type="button" data-mute aria-label="Mute sound">Sound on</button>
          <button class="icon-button" type="button" data-pause>Pause</button>
        </div>
        <div class="canvas-wrap" data-board>
          <canvas data-game-canvas width="360" height="600" role="img" aria-label="Game board. Collect round mint targets and avoid red triangle hazards.">
            The game board needs Canvas support. Use a current browser to play.
          </canvas>
          <div class="game-overlay" data-overlay hidden></div>
          <p class="game-toast" data-toast aria-live="polite"></p>
        </div>
        <div class="touch-pad" data-touch-pad aria-label="Touch movement pad">
          <span data-touch-knob></span>
          <strong>Drag to move</strong>
        </div>
        <div class="game-foot">
          <span>Daily seed <strong>${seedLabel(this.state.seed)}</strong></span>
          <span>Best <strong data-best>${this.progress.bestScore.toLocaleString()}</strong></span>
        </div>
        <p class="sr-only" data-announcer aria-live="polite">Run ready.</p>
      </section>`;
  }

  private bind(): void {
    this.root.addEventListener('click', this.onClick);
    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.resizeCanvas);
    const pad = this.root.querySelector<HTMLElement>('[data-touch-pad]');
    pad?.addEventListener('pointerdown', this.onPointerDown);
    pad?.addEventListener('pointermove', this.onPointerMove);
    pad?.addEventListener('pointerup', this.onPointerUp);
    pad?.addEventListener('pointercancel', this.onPointerUp);
  }

  private onClick = (event: Event): void => {
    const button = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-pause], [data-mute]');
    if (!button) return;
    this.ensureAudio();
    if (button.hasAttribute('data-pause')) {
      if (this.state.status === 'playing') {
        this.state.status = 'paused';
        this.showOverlay('pause');
        saveRun(this.demo, this.state);
      }
      return;
    }
    if (button.hasAttribute('data-mute')) {
      this.settings.mute = !this.settings.mute;
      saveSettings(this.demo, this.settings);
      this.updateHud();
      return;
    }
    const action = button.dataset.action;
    if (action === 'start-touch') {
      this.settings.mode = 'touch';
      this.settings.calibrated = true;
      this.saveOptions();
      this.restart();
      this.announce('Run started. Drag the pad or use your movement keys.');
    } else if (action === 'request-tilt') {
      void this.requestTilt();
    } else if (action === 'center-tilt') {
      this.settings.mode = 'tilt';
      this.settings.calibrated = true;
      this.settings.betaOffset = this.orientation.beta;
      this.settings.gammaOffset = this.orientation.gamma;
      this.saveOptions();
      this.restart();
      this.announce('Tilt centered. Run started.');
    } else if (action === 'resume') {
      this.saveOptions();
      this.state.status = 'playing';
      this.hideOverlay();
      this.lastFrame = performance.now();
      this.announce('Run resumed.');
    } else if (action === 'restart') {
      this.saveOptions();
      this.restart();
    } else if (action === 'settings') {
      this.showOverlay('settings');
    } else if (action === 'back-pause') {
      this.showOverlay('pause');
    } else if (action === 'share') {
      void this.shareScore();
    }
  };

  private saveOptions(): void {
    const invert = this.root.querySelector<HTMLInputElement>('[data-option="invert"]');
    const seated = this.root.querySelector<HTMLInputElement>('[data-option="seated"]');
    const motion = this.root.querySelector<HTMLInputElement>('[data-option="motion"]');
    const keySet = this.root.querySelector<HTMLSelectElement>('[data-option="keys"]');
    if (invert) this.settings.invertX = invert.checked;
    if (seated) this.settings.seated = seated.checked;
    if (motion) this.settings.reducedMotion = motion.checked;
    if (keySet) this.settings.keySet = keySet.value === 'wasd' ? 'wasd' : 'arrows';
    saveSettings(this.demo, this.settings);
  }

  private optionsMarkup(): string {
    return `<div class="settings-grid">
      <label class="check-row"><input type="checkbox" data-option="invert" ${this.settings.invertX ? 'checked' : ''}> Invert left and right</label>
      <label class="check-row"><input type="checkbox" data-option="seated" ${this.settings.seated ? 'checked' : ''}> Seated mode: gentler speed</label>
      <label class="check-row"><input type="checkbox" data-option="motion" ${this.settings.reducedMotion ? 'checked' : ''}> Reduce motion and shake</label>
      <label class="select-row">Movement keys
        <select data-option="keys"><option value="arrows" ${this.settings.keySet === 'arrows' ? 'selected' : ''}>Arrow keys</option><option value="wasd" ${this.settings.keySet === 'wasd' ? 'selected' : ''}>W A S D</option></select>
      </label>
    </div>`;
  }

  private showOverlay(view: 'setup' | 'tilt' | 'pause' | 'resume' | 'settings' | 'end', message = ''): void {
    const overlay = this.root.querySelector<HTMLElement>('[data-overlay]');
    if (!overlay) return;
    overlay.hidden = false;
    if (view === 'setup') {
      overlay.innerHTML = `<div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="setup-title">
        <p class="eyebrow">Choose controls</p><h2 id="setup-title">Set up this run</h2>
        <p>Tilt needs permission on some phones. Touch and keys always work.</p>
        ${this.optionsMarkup()}
        <div class="button-stack"><button class="primary-button" data-action="request-tilt">Use phone tilt</button><button class="secondary-button" data-action="start-touch">Use touch or keys</button></div>
        <p class="form-note" data-permission-note>${message}</p>
      </div>`;
    } else if (view === 'tilt') {
      overlay.innerHTML = `<div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="tilt-title">
        <p class="eyebrow">Tilt is ready</p><h2 id="tilt-title">Hold your phone comfortably</h2>
        <p>Keep it still, then set this angle as the center.</p>
        <button class="primary-button" data-action="center-tilt">Center tilt and start</button>
        <button class="text-button" data-action="start-touch">Use touch or keys instead</button>
      </div>`;
    } else if (view === 'pause' || view === 'resume') {
      overlay.innerHTML = `<div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <p class="eyebrow">${view === 'resume' ? 'Saved run found' : 'Run paused'}</p><h2 id="pause-title">${view === 'resume' ? 'Resume where you stopped' : 'Take your time'}</h2>
        <p>${secondsLeft(this.state)} seconds and ${this.state.shields} shields remain.</p>
        <div class="button-stack"><button class="primary-button" data-action="resume">Resume run</button><button class="secondary-button" data-action="settings">Change controls</button><button class="text-button" data-action="restart">Restart run</button></div>
      </div>`;
    } else if (view === 'settings') {
      overlay.innerHTML = `<div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <p class="eyebrow">Controls</p><h2 id="settings-title">Change this device</h2>${this.optionsMarkup()}
        <div class="button-stack"><button class="primary-button" data-action="resume">Save and resume</button><button class="secondary-button" data-action="request-tilt">Recenter phone tilt</button><button class="text-button" data-action="back-pause">Back</button></div>
      </div>`;
    } else {
      const cause = this.state.shields <= 0 ? 'Your last shield broke.' : 'The 90-second run is complete.';
      overlay.innerHTML = `<div class="overlay-card result-card" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <p class="eyebrow">Run complete</p><h2 id="result-title">You scored ${this.state.score.toLocaleString()}</h2>
        <p>${cause} You tagged ${this.state.targetsCollected} targets.</p>
        <dl><div><dt>Best</dt><dd>${this.progress.bestScore.toLocaleString()}</dd></div><div><dt>Daily seed</dt><dd>${seedLabel(this.state.seed)}</dd></div></dl>
        <div class="button-stack"><button class="primary-button" data-action="restart">Play again</button><button class="secondary-button" data-action="share">Share score</button></div>
        <p class="form-note" data-share-note>${message}</p>
      </div>`;
    }
    requestAnimationFrame(() => overlay.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }));
  }

  private hideOverlay(): void {
    const overlay = this.root.querySelector<HTMLElement>('[data-overlay]');
    if (overlay) {
      overlay.hidden = true;
      overlay.innerHTML = '';
    }
  }

  private async requestTilt(): Promise<void> {
    this.saveOptions();
    if (!('DeviceOrientationEvent' in window)) {
      this.showOverlay('setup', 'Tilt is not available in this browser. Use touch or keys instead.');
      return;
    }
    const Orientation = DeviceOrientationEvent as unknown as OrientationConstructor;
    try {
      if (typeof Orientation.requestPermission === 'function') {
        const permission = await Orientation.requestPermission();
        if (permission !== 'granted') {
          this.showOverlay('setup', 'Tilt permission was not granted. Use touch or keys, or allow motion in browser settings.');
          return;
        }
      }
      this.showOverlay('tilt');
    } catch {
      this.showOverlay('setup', 'Tilt permission could not open. Use touch or keys, then check browser motion settings.');
    }
  }

  private onOrientation = (event: DeviceOrientationEvent): void => {
    if (typeof event.beta === 'number') this.orientation.beta = event.beta;
    if (typeof event.gamma === 'number') this.orientation.gamma = event.gamma;
  };

  private activeKeys(): { left: string; right: string; up: string; down: string } {
    return this.settings.keySet === 'wasd'
      ? { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS' }
      : { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown' };
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const controls = this.activeKeys();
    if (Object.values(controls).includes(event.code)) {
      event.preventDefault();
      this.keys.add(event.code);
      this.ensureAudio();
    }
    if (event.code === 'Escape' && this.state.status === 'playing') {
      event.preventDefault();
      this.state.status = 'paused';
      this.showOverlay('pause');
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private onPointerDown = (event: PointerEvent): void => {
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.updatePointer(event);
    this.ensureAudio();
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId === this.pointerId) this.updatePointer(event);
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.input = { x: 0, y: 0 };
    const knob = this.root.querySelector<HTMLElement>('[data-touch-knob]');
    if (knob) knob.style.transform = 'translate(0, 0)';
  };

  private updatePointer(event: PointerEvent): void {
    const pad = event.currentTarget as HTMLElement;
    const bounds = pad.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width * 0.34)));
    const y = Math.max(-1, Math.min(1, (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height * 0.34)));
    this.input = { x, y };
    const knob = this.root.querySelector<HTMLElement>('[data-touch-knob]');
    if (knob) knob.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
  }

  private currentInput(): GameInput {
    const controls = this.activeKeys();
    let x = Number(this.keys.has(controls.right)) - Number(this.keys.has(controls.left));
    let y = Number(this.keys.has(controls.down)) - Number(this.keys.has(controls.up));
    if (this.pointerId !== null) {
      x = this.input.x;
      y = this.input.y;
    } else if (this.settings.mode === 'tilt') {
      x = (this.orientation.gamma - this.settings.gammaOffset) / (this.settings.seated ? 20 : 13);
      y = (this.orientation.beta - this.settings.betaOffset) / (this.settings.seated ? 24 : 16);
    }
    if (this.settings.invertX) x *= -1;
    return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  }

  private frame = (now: number): void => {
    if (this.disposed) return;
    const delta = Math.min(0.1, Math.max(0, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    if (this.state.status === 'playing') {
      this.accumulator += delta;
      while (this.accumulator >= FIXED_STEP) {
        const scoreBefore = this.state.score;
        const shieldsBefore = this.state.shields;
        stepGame(this.state, this.currentInput(), FIXED_STEP, this.settings.seated);
        if (this.state.score > scoreBefore) this.beep(520, 0.055);
        if (this.state.shields < shieldsBefore) this.beep(120, 0.09);
        this.accumulator -= FIXED_STEP;
      }
      const wholeSecond = Math.floor(this.state.elapsed);
      if (wholeSecond !== this.lastSavedSecond) {
        this.lastSavedSecond = wholeSecond;
        saveRun(this.demo, this.state);
      }
      if (this.state.elapsed >= this.state.duration || this.state.shields <= 0) this.finishRun();
    }
    this.render();
    this.updateHud();
    this.raf = requestAnimationFrame(this.frame);
  };

  private finishRun(): void {
    if (!this.resultRecorded) {
      this.progress.lastScore = this.state.score;
      this.progress.totalRuns += 1;
      this.progress.bestScore = Math.max(this.progress.bestScore, this.state.score);
      saveProgress(this.demo, this.progress);
      saveRun(this.demo, null);
      this.resultRecorded = true;
      this.beep(260, 0.14);
    }
    this.showOverlay('end');
    this.announce(`Run complete. Score ${this.state.score}. ${this.state.targetsCollected} targets tagged.`);
  }

  private restart(): void {
    const duration = new URLSearchParams(location.search).get('e2e') === '1' ? 1.2 : RUN_SECONDS;
    this.state = createGame(dailySeed(), duration);
    this.resultRecorded = false;
    this.lastSavedSecond = -1;
    this.hideOverlay();
    saveRun(this.demo, this.state);
    this.lastFrame = performance.now();
    this.updateHud();
    this.announce('New run started. Score zero. Three shields.');
  }

  private updateHud(): void {
    const time = this.root.querySelector<HTMLElement>('[data-time]');
    const score = this.root.querySelector<HTMLElement>('[data-score]');
    const shields = this.root.querySelector<HTMLElement>('[data-shields]');
    const best = this.root.querySelector<HTMLElement>('[data-best]');
    const mute = this.root.querySelector<HTMLElement>('[data-mute]');
    const board = this.root.querySelector<HTMLElement>('[data-board]');
    const remaining = secondsLeft(this.state);
    if (time) time.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
    if (score) score.textContent = this.state.score.toLocaleString();
    if (shields) {
      shields.textContent = `${'● '.repeat(this.state.shields)}${'○ '.repeat(Math.max(0, 3 - this.state.shields))}`.trim();
      shields.setAttribute('aria-label', `${this.state.shields} shields`);
    }
    if (best) best.textContent = this.progress.bestScore.toLocaleString();
    if (mute) {
      mute.textContent = this.settings.mute ? 'Sound off' : 'Sound on';
      mute.setAttribute('aria-label', this.settings.mute ? 'Turn sound on' : 'Mute sound');
    }
    if (board) {
      board.dataset.playerX = this.state.player.x.toFixed(1);
      board.dataset.playerY = this.state.player.y.toFixed(1);
      board.dataset.state = this.state.status;
    }
  }

  private resizeCanvas = (): void => {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = BOARD_WIDTH * ratio;
    this.canvas.height = BOARD_HEIGHT * ratio;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.render();
  };

  private render(): void {
    const context = this.context;
    context.save();
    context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    context.fillStyle = '#0a1d20';
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    const glow = context.createRadialGradient(180, 310, 10, 180, 310, 330);
    glow.addColorStop(0, 'rgba(42, 99, 94, .34)');
    glow.addColorStop(1, 'rgba(7, 20, 23, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    context.strokeStyle = 'rgba(183, 203, 198, .10)';
    context.lineWidth = 1;
    for (let y = 82; y < BOARD_HEIGHT; y += 46) {
      context.beginPath();
      context.ellipse(BOARD_WIDTH / 2, y, 150 - (y % 92) * 0.18, 24, 0, 0, Math.PI * 2);
      context.stroke();
    }

    for (const hazard of this.state.hazards) {
      if (hazard.activeAt > this.state.elapsed) continue;
      context.save();
      context.translate(hazard.x, hazard.y);
      context.rotate(this.state.elapsed * 0.8 + hazard.id);
      context.fillStyle = '#ff6b5e';
      context.strokeStyle = '#071417';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(0, -hazard.radius);
      context.lineTo(hazard.radius * 0.9, hazard.radius * 0.8);
      context.lineTo(-hazard.radius * 0.9, hazard.radius * 0.8);
      context.closePath();
      context.fill();
      context.stroke();
      context.restore();
    }

    const pulse = this.settings.reducedMotion ? 0 : Math.sin(this.state.elapsed * 4 + this.state.target.phase) * 3;
    context.strokeStyle = '#76e6c4';
    context.lineWidth = 3;
    context.globalAlpha = 0.45;
    context.beginPath();
    context.arc(this.state.target.x, this.state.target.y, this.state.target.radius + 10 + pulse, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1;
    context.fillStyle = '#76e6c4';
    context.beginPath();
    context.arc(this.state.target.x, this.state.target.y, this.state.target.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#102529';
    context.beginPath();
    context.arc(this.state.target.x, this.state.target.y, 5, 0, Math.PI * 2);
    context.fill();

    const player = this.state.player;
    if (!(this.state.invulnerableFor > 0 && Math.floor(this.state.invulnerableFor * 8) % 2 === 0)) {
      context.save();
      context.translate(player.x, player.y);
      const angle = Math.atan2(player.vy, player.vx) + Math.PI / 2;
      context.rotate(angle);
      context.strokeStyle = '#f4a261';
      context.lineWidth = 10;
      context.lineCap = 'square';
      context.beginPath();
      context.arc(0, 0, 13, 0, Math.PI, false);
      context.moveTo(-13, 0);
      context.lineTo(-13, -15);
      context.moveTo(13, 0);
      context.lineTo(13, -15);
      context.stroke();
      context.strokeStyle = '#76e6c4';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(-13, -17);
      context.lineTo(-13, -10);
      context.moveTo(13, -17);
      context.lineTo(13, -10);
      context.stroke();
      context.restore();
    }
    context.restore();
  }

  private ensureAudio(): void {
    if (this.settings.mute || this.audio) return;
    try {
      this.audio = new AudioContext();
    } catch {
      this.audio = null;
    }
  }

  private beep(frequency: number, length: number): void {
    if (this.settings.mute || !this.audio) return;
    const oscillator = this.audio.createOscillator();
    const gain = this.audio.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.035, this.audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audio.currentTime + length);
    oscillator.connect(gain).connect(this.audio.destination);
    oscillator.start();
    oscillator.stop(this.audio.currentTime + length);
  }

  private async shareScore(): Promise<void> {
    const text = `I scored ${this.state.score} in today's Tilt Tag run. Seed ${seedLabel(this.state.seed)}.`;
    const canShare = typeof navigator.share === 'function';
    try {
      if (canShare) await navigator.share({ title: 'Tilt Tag score', text, url: 'https://tilt-tag.sociobot.in/demo' });
      else await navigator.clipboard.writeText(`${text} https://tilt-tag.sociobot.in/demo`);
      this.showOverlay('end', canShare ? 'Share sheet opened.' : 'Score copied.');
    } catch {
      this.showOverlay('end', 'Sharing did not open. Copy the score from this screen.');
    }
  }

  private announce(message: string): void {
    const status = this.root.querySelector<HTMLElement>('[data-announcer]');
    if (status) status.textContent = message;
  }

  private onVisibility = (): void => {
    if (document.hidden && this.state.status === 'playing') {
      this.state.status = 'paused';
      saveRun(this.demo, this.state);
      this.showOverlay('pause');
    }
  };

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.state.status === 'ended' ? saveRun(this.demo, null) : saveRun(this.demo, this.state);
    this.root.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('deviceorientation', this.onOrientation);
    document.removeEventListener('visibilitychange', this.onVisibility);
    void this.audio?.close();
  }
}
