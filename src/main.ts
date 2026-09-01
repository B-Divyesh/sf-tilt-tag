import './styles.css';
import { GameView } from './game-view';
import { resetDemo } from './storage';

const appNode = document.querySelector<HTMLElement>('#app');
if (!appNode) throw new Error('Tilt Tag could not start. Reload the page and try again.');
const app: HTMLElement = appNode;

let gameView: GameView | null = null;

type Route = 'home' | 'demo' | 'play' | 'privacy' | 'terms' | 'not-found';

function routeFromPath(): Route {
  if (location.search.includes('demo=1')) return 'demo';
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return 'home';
  if (path === '/demo') return 'demo';
  if (path === '/play') return 'play';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  return 'not-found';
}

const routeMeta: Record<Route, { title: string; description: string; canonical: string }> = {
  home: {
    title: 'Tilt Tag — Play a 90-second tilt game',
    description: 'Tilt or touch to collect targets and dodge hazards in a 90-second daily browser game.',
    canonical: '/',
  },
  demo: {
    title: 'Demo — Tilt Tag',
    description: 'Play a Tilt Tag sample run. Sample scores use separate demo storage.',
    canonical: '/demo',
  },
  play: {
    title: 'Play — Tilt Tag',
    description: 'Calibrate phone tilt or use touch and keys for today’s 90-second Tilt Tag run.',
    canonical: '/play',
  },
  privacy: {
    title: 'Privacy — Tilt Tag',
    description: 'How Tilt Tag stores game settings and scores on your device.',
    canonical: '/privacy',
  },
  terms: {
    title: 'Terms — Tilt Tag',
    description: 'The plain terms for playing the free Tilt Tag browser game.',
    canonical: '/terms',
  },
  'not-found': {
    title: 'Page not found — Tilt Tag',
    description: 'This Tilt Tag page does not exist. Return to the game.',
    canonical: '/404',
  },
};

function header(): string {
  return `<a class="skip-link" href="#main">Skip to game or content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-link aria-label="Tilt Tag home"><span aria-hidden="true">∪</span> Tilt Tag</a>
      <nav aria-label="Main navigation">
        <a href="/demo" data-link>Demo</a>
        <a href="/play" data-link>Play</a>
        <a href="/privacy" data-link>Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `<footer class="site-footer">
      <p><strong>Tilt Tag</strong><br>Play a 90-second tilt and touch obstacle run.</p>
      <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
      <p class="fine-print">Version 1.0.0 · Environmental art was generated for this game.</p>
    </footer>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode">
    <p><strong>Demo</strong> — sample data, nothing is saved to your real game.</p>
    <div><button type="button" class="text-button light" data-reset-demo>Reset demo</button><a href="/play" data-link>Start for real</a></div>
  </aside>`;
}

function homePage(): string {
  const testQuery = new URLSearchParams(location.search).get('e2e') === '1' ? '?e2e=1' : '';
  return `${header()}
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <picture class="hero-scene">
          <source media="(max-width: 700px)" srcset="/assets/observatory-768.webp">
          <img src="/assets/observatory-1280.webp" width="1280" height="854" alt="A copper magnet floats above a dark stone observatory, setting the game world." fetchpriority="high">
        </picture>
        <div class="hero-copy">
          <p class="eyebrow">90-second browser game</p>
          <h1 id="hero-title">Tilt a magnet. Tag every target.</h1>
          <p class="lede">For phone players who want one 90-second challenge without an install.</p>
          <div class="hero-action"><a class="primary-button" href="/demo${testQuery}" data-link>Try it with sample data</a><span>Opens this sample run with touch and keys.</span></div>
          <ul class="plain-facts" aria-label="Game facts"><li>Free to play.</li><li>No account.</li><li>Scores stay on this device.</li></ul>
        </div>
        <div class="home-game-shell" aria-label="Playable sample game">
          <p><strong>Playable sample</strong> · Use the pad or movement keys.</p>
          <div data-home-game-root></div>
        </div>
      </section>
      <section class="live-preview" aria-labelledby="preview-title">
        <div class="preview-copy">
          <p class="eyebrow">Today’s field</p><h2 id="preview-title">See the game before you start</h2>
          <p>Round mint targets add points. Red triangles break shields. You get three shields.</p>
          <a class="secondary-button" href="/play" data-link>Set up my controls</a>
        </div>
        <div class="mini-board" role="img" aria-label="Preview of the game board with a copper magnet, mint target, and red hazards.">
          <span class="preview-target"></span><span class="preview-hazard one"></span><span class="preview-hazard two"></span><span class="preview-magnet">∪</span>
        </div>
      </section>
      <section class="steps-section" aria-labelledby="steps-title">
        <p class="eyebrow">How it works</p><h2 id="steps-title">Start in three steps</h2>
        <ol class="steps-list">
          <li><span>01</span><div><h3>Choose your controls</h3><p>Calibrate phone tilt, or use touch and movement keys.</p></div></li>
          <li><span>02</span><div><h3>Collect mint targets</h3><p>Move the copper magnet over each round target.</p></div></li>
          <li><span>03</span><div><h3>Protect three shields</h3><p>Avoid red hazards until the 90-second timer ends.</p></div></li>
        </ol>
      </section>
      <section class="privacy-section" aria-labelledby="privacy-title">
        <div><p class="eyebrow">Privacy and limits</p><h2 id="privacy-title">Your phone handles the game</h2></div>
        <div><p>Live tilt readings control the magnet in memory. Only your chosen center offsets are saved, and nothing is sent.</p><p>There are no accounts or public leaderboards. Your settings and scores use local browser storage.</p><p>The game does not use a camera, location, ads, or third-party trackers.</p></div>
      </section>
    </main>${footer()}`;
}

function gamePage(demo: boolean): string {
  return `${header()}${demo ? demoBanner() : ''}
    <main id="main" class="play-page">
      <div class="play-intro">
        <p class="eyebrow">${demo ? 'Sample run' : 'Today’s run'}</p>
        <h1>${demo ? 'Play with sample scores' : 'Play today’s tilt run'}</h1>
        <p>${demo ? 'This run uses separate demo storage.' : 'Choose tilt, touch, or keys. Each run uses today’s layout.'}</p>
      </div>
      <div data-game-root></div>
      <aside class="control-help" aria-labelledby="control-help-title"><h2 id="control-help-title">Controls</h2><p>Drag the pad, use your chosen keys, or tilt after calibration. Press Escape to pause.</p></aside>
    </main>${footer()}`;
}

function privacyPage(): string {
  return `${header()}<main id="main" class="document-page">
    <p class="eyebrow">Privacy</p><h1>Your game stays on this device</h1>
    <p class="lede">Tilt Tag has no account system, advertising, or analytics.</p>
    <h2>What the game stores</h2><p>The browser stores your best score, run count, control settings, and an unfinished run. This data stays in local storage on your device.</p>
    <h2>Motion data</h2><p>Live phone orientation readings move the magnet while you play. The game does not save or send them. Your chosen center offsets stay with your control settings.</p>
    <h2>Demo data</h2><p>The demo uses keys that start with <code>demo:tilt-tag:</code>. It never reads or changes your real game keys. Reset demo removes only those demo keys.</p>
    <h2>Network requests</h2><p>The game loads its own files from this site. It does not load third-party scripts, fonts, or trackers.</p>
    <h2>Remove your data</h2><p>Clear this site’s storage in your browser settings. You can also reset demo data from the demo banner.</p>
    <h2>Contact</h2><p>For a privacy question, email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p>
    <p class="fine-print">Effective 1 September 2026.</p>
  </main>${footer()}`;
}

function termsPage(): string {
  return `${header()}<main id="main" class="document-page">
    <p class="eyebrow">Terms</p><h1>Play fairly and at your own pace</h1>
    <p class="lede">Tilt Tag is a free browser game for general audiences.</p>
    <h2>Using the game</h2><p>You may play and share your score. Do not disrupt the site or use it to harm another person.</p>
    <h2>Safety</h2><p>Hold your phone securely. Use touch or keys if motion feels uncomfortable. Stop if play causes discomfort.</p>
    <h2>Availability</h2><p>The game is provided as available. Features may change, and access may sometimes stop for maintenance.</p>
    <h2>Ownership</h2><p>The game code and original artwork are protected by their stated licenses. The repository code is available under the MIT License.</p>
    <h2>Contact</h2><p>For a terms question, email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p>
    <p class="fine-print">Effective 1 September 2026.</p>
  </main>${footer()}`;
}

function notFoundPage(): string {
  return `${header()}<main id="main" class="lost-page">
    <div><p class="eyebrow">404</p><h1>This target is out of range</h1><p>The page does not exist. The daily game is still ready.</p><a class="primary-button" href="/" data-link>Return to Tilt Tag</a></div>
  </main>${footer()}`;
}

function updateMeta(route: Route): void {
  const meta = routeMeta[route];
  document.title = meta.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', meta.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://tilt-tag.sociobot.in${meta.canonical}`);
}

function render(shouldFocus = false): void {
  gameView?.dispose();
  gameView = null;
  const route = routeFromPath();
  updateMeta(route);
  if (route === 'home') app.innerHTML = homePage();
  else if (route === 'demo') app.innerHTML = gamePage(true);
  else if (route === 'play') app.innerHTML = gamePage(false);
  else if (route === 'privacy') app.innerHTML = privacyPage();
  else if (route === 'terms') app.innerHTML = termsPage();
  else app.innerHTML = notFoundPage();

  if (route === 'home') {
    const root = app.querySelector<HTMLElement>('[data-home-game-root]');
    if (root) gameView = new GameView(root, true);
  } else if (route === 'demo' || route === 'play') {
    const root = app.querySelector<HTMLElement>('[data-game-root]');
    if (root) gameView = new GameView(root, route === 'demo');
  }
  if (shouldFocus) {
    const heading = app.querySelector<HTMLElement>('h1');
    heading?.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
  }
}

app.addEventListener('click', (event) => {
  const reset = (event.target as HTMLElement).closest<HTMLElement>('[data-reset-demo]');
  if (reset) {
    resetDemo();
    render(false);
    const banner = app.querySelector<HTMLElement>('.demo-banner p');
    if (banner) banner.innerHTML = '<strong>Demo reset</strong> — a fresh sample run is ready.';
    return;
  }
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-link]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.origin !== location.origin) return;
  event.preventDefault();
  history.pushState({}, '', link.href);
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  render(true);
});

window.addEventListener('popstate', () => render(true));

const networkStatus = document.createElement('div');
networkStatus.className = 'network-status';
networkStatus.setAttribute('role', 'status');
networkStatus.hidden = navigator.onLine;
networkStatus.textContent = 'You are offline. Cached game files still work.';
document.body.append(networkStatus);
window.addEventListener('online', () => { networkStatus.hidden = true; });
window.addEventListener('offline', () => { networkStatus.hidden = false; });

render(false);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js'); });
}
