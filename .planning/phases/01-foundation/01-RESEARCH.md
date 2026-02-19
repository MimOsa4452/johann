# Phase 1: Foundation - Research

**Researched:** 2026-02-19
**Domain:** Phaser 3 + Vite project scaffold, scene graph, two-camera setup, atlas asset pipeline, GameState object
**Confidence:** HIGH — core findings verified against official Phaser 3 docs (docs.phaser.io, newdocs.phaser.io) and Context7-equivalent sources

---

## Summary

Phase 1 establishes the scaffold that all later phases build on. There are no greenfield technology choices — the stack (Phaser 3.90 + Vite 6) is fixed, official templates exist, and the scene lifecycle APIs are stable and well-documented. The primary research question is: **what architectural decisions made in Phase 1 are expensive to change later?**

There are three irreversible decisions: (1) the two-camera setup for separating world rendering from UI/HUD, (2) the scope overlay approach — circular masked RenderTexture not full-viewport `camera.setZoom()`, and (3) the GameState object pattern with `setState()`. If any of these are wrong, Phase 2 cascades into a rewrite. All three are verified against official Phaser 3 docs and are the established community approach.

Secondary decisions that are cheap to change later but expensive to do wrong from the start: depth constant map, atlas workflow, `Phaser.AUTO` renderer, `this.time.addEvent()` for the Phaser timer, and scene shutdown cleanup pattern. These should all be baked into the Phase 1 scaffold, not retrofitted in Phase 2.

One important finding about prior decisions: the project notes "tileSprite power-of-2 requirement may have changed in Phaser 3.80+." It has NOT changed. As of Phaser 3.90 (current stable), TileSprite in WebGL still requires POT textures or will auto-upscale NPOT textures with visible anti-aliasing. Background art must use power-of-two dimensions.

**Primary recommendation:** Use the official `phaserjs/template-vite` scaffold as the starting point (pinned to Phaser 3.90 / Vite 6.3.1), then add the two-camera setup, depth constants, GameState object, and scene graph in `create()` of GameScene before any gameplay code.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | 3.90.0 | Game framework — renderer, scenes, input, tweens, cameras, audio, sprites | Industry standard for 2D browser games; stable API since 3.0; official Vite template ships this version |
| vite | 6.3.1 | Dev server + bundler | Fast HMR, zero config for Phaser, tree-shaking production builds; official template uses v6 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | 5.x | Type safety | Optional — Phaser has excellent TS definitions; add after initial scaffold if team prefers |
| @types/phaser | matches phaser | Type definitions | Only needed with TypeScript |

### Asset Pipeline Tools (not npm packages)

| Tool | Purpose | Notes |
|------|---------|-------|
| Free Texture Packer | Sprite atlas generation | Free, cross-platform; outputs Phaser 3 JSON Hash format |
| TexturePacker | Sprite atlas generation | Paid; has explicit "Phaser 3" export preset — more reliable output |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite 6 | Vite 5 | Both work; 6 is current; no practical difference for this project |
| Free Texture Packer | Manually arranged atlases | Hand-rolled atlases break easily; use a tool from day one |
| TypeScript | Plain JavaScript | JS is faster to start; TS is better if codebase grows beyond ~800 lines |

**Installation:**
```bash
npm create @phaserjs/game@latest -- --template vite
# or clone directly:
git clone https://github.com/phaserjs/template-vite.git franna
cd franna && npm install
```

---

## Architecture Patterns

### Recommended Project Structure

```
franna/
├── index.html               # Phaser game mount point
├── package.json
├── vite/
│   └── config.dev.mjs       # Dev server config
│   └── config.prod.mjs      # Production build config
├── public/
│   └── assets/
│       ├── atlases/         # TexturePacker output (.png + .json pairs)
│       └── audio/           # .mp3 and .ogg pairs for each SFX
└── src/
    ├── main.js              # Phaser.Game config, scene list, launch
    ├── constants.js         # DEPTH, SCENE_KEYS, GAME_CONFIG constants
    ├── GameState.js         # GameState object + setState() factory
    ├── scenes/
    │   ├── BootScene.js     # Set renderer, scale mode — no assets
    │   ├── PreloadScene.js  # this.load.atlas(), audio, progress bar
    │   ├── MenuScene.js     # Title screen, "Play" button
    │   ├── GameScene.js     # Main game loop, owns all managers
    │   ├── HUDScene.js      # Parallel scene: score/timer overlay
    │   └── ResultScene.js   # Final score, replay/menu options
    └── objects/
        └── (Phase 2+: AnimalManager, ScopeOverlay, etc.)
```

### Pattern 1: Two-Camera Setup (World + UI)

**What:** Every GameScene has two cameras. The main camera renders the game world and can pan, scroll, or zoom. A second `uiCamera` is fixed and renders only HUD game objects — it never moves and is never zoomed.

**When to use:** Any time some game objects must scroll/zoom with the world while others (HUD text, crosshair, scope overlay frame) must stay fixed on screen.

**Why established in Phase 1:** If you add a scope zoom to `cameras.main` and later try to "un-zoom" the HUD elements, you have already coupled them incorrectly. The separation must exist from the first frame.

**Example:**
```javascript
// Source: docs.phaser.io/phaser/concepts/cameras + rexrainbow community docs
// In GameScene.create():
const { width, height } = this.scale;

// Main camera already exists as this.cameras.main
// It renders the world — animals, background, scope

// Add a fixed UI camera that ignores all world objects
this.uiCamera = this.cameras.add(0, 0, width, height, false, 'ui');

// When adding a world object:
//   this.uiCamera.ignore(worldSprite);
// When adding a UI object (HUD text, crosshair):
//   this.cameras.main.ignore(hudText);
```

### Pattern 2: Scope Overlay via Circular Masked RenderTexture (NOT camera.setZoom)

**What:** The scope view is a circular window showing a magnified sub-region of the world. It is implemented as a `RenderTexture` with a circular `GeometryMask` applied, positioned at the crosshair. The world scene is drawn into the RenderTexture using a zoomed internal camera. The rest of the screen is darkened by a semi-transparent overlay behind the circular cutout.

**When to use:** Scope zoom mechanic, spotlight effects, portals. Any time you need a "window into the world" that does not affect the full viewport.

**Why NOT camera.setZoom:** `camera.setZoom()` on the main camera zooms the entire viewport uniformly. You cannot produce a circular vignette. HUD elements accidentally zoom unless you go to heroic lengths. This is the most common architecture mistake in this type of game (PITFALL-01).

**Example:**
```javascript
// Source: Phaser 3 docs - RenderTexture + Geometry Mask
// In GameScene.create() — scope overlay bones:

// 1. Dark overlay covering the full screen
this.scopeOverlay = this.add.graphics();
this.scopeOverlay.fillStyle(0x000000, 0.85);
this.scopeOverlay.fillRect(0, 0, width, height);
this.scopeOverlay.setDepth(DEPTH.SCOPE_OVERLAY);
this.scopeOverlay.setScrollFactor(0);
this.scopeOverlay.setVisible(false);

// 2. Circular mask cut from the overlay
this.scopeCircle = this.add.graphics();
this.scopeCircle.fillStyle(0xffffff);
this.scopeCircle.fillCircle(width / 2, height / 2, SCOPE_RADIUS);
const mask = this.scopeCircle.createGeometryMask();

// 3. RenderTexture sized to the circle, receives zoomed world draw
//    (Implementation details belong to Phase 2 — this is the Phase 1 bones)
```

### Pattern 3: Scene Graph Registration

**What:** All scenes are registered in `Phaser.Game` config at startup. The boot sequence is: BootScene (sync config) → PreloadScene (asset loading with progress bar) → MenuScene → [GameScene + HUDScene in parallel] → ResultScene.

**When to use:** Always. Phaser requires all scenes to be registered at game creation. The order in the array matters for scene rendering depth (last scene in array renders on top).

**Example:**
```javascript
// Source: Phaser 3 official template (phaserjs/template-vite)
// src/main.js
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import HUDScene from './scenes/HUDScene';
import ResultScene from './scenes/ResultScene';

const config = {
  type: Phaser.AUTO,           // WebGL with Canvas fallback
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a2e',
  scene: [BootScene, PreloadScene, MenuScene, GameScene, HUDScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

### Pattern 4: HUDScene as Parallel Scene

**What:** `HUDScene` launches alongside `GameScene` using `this.scene.launch('HUDScene')`. HUDScene listens for events emitted by GameScene. It renders score, timer, and other display-only elements.

**When to use:** UI that must render cleanly on top of the game world without interfering with physics, depth sorting, or scene pause behavior.

**Example:**
```javascript
// Source: Phaser 3 official example - launch-parallel-scene
// In GameScene.create():
this.scene.launch('HUDScene');

// Emitting to HUDScene from GameScene:
this.events.emit('scoreUpdate', this.gameState.score);

// In HUDScene.create():
const gameScene = this.scene.get('GameScene');
gameScene.events.on('scoreUpdate', (score) => {
  this.scoreText.setText(`Score: ${score}`);
}, this);

// In HUDScene — cleanup on shutdown:
this.events.once('shutdown', () => {
  gameScene.events.off('scoreUpdate');
});
```

### Pattern 5: GameState Object with setState()

**What:** A single plain object holds all mutable round state. All mutations go through a `setState(patch)` method that applies the patch and emits a change event. Round reset is `setState(INITIAL_STATE)` — one call.

**When to use:** Always. Scattered `this.score`, `this.timeLeft` variables on the scene class cause stale state on replay and make round reset fragile.

**Example:**
```javascript
// Source: Game design pattern — verified against Phaser community best practice
// src/GameState.js

const INITIAL_STATE = {
  score: 0,
  timeLeft: 90,
  phase: 'idle',   // 'idle' | 'playing' | 'paused' | 'ended'
  roundCount: 0,
};

export function createGameState(scene) {
  let state = { ...INITIAL_STATE };

  return {
    get: () => ({ ...state }),
    setState(patch) {
      state = { ...state, ...patch };
      scene.events.emit('stateChange', state);
    },
    reset() {
      state = { ...INITIAL_STATE };
      scene.events.emit('stateChange', state);
    },
  };
}

// In GameScene.create():
// this.gameState = createGameState(this);
// this.gameState.setState({ phase: 'playing' });
```

### Pattern 6: Scene Shutdown Cleanup

**What:** Every scene that registers event listeners must remove them in a `shutdown` handler to prevent ghost listeners surviving scene transitions.

**When to use:** All scenes, no exceptions.

**Example:**
```javascript
// Source: docs.phaser.io/phaser/concepts/scenes - shutdown lifecycle
// In every scene's create():
this.events.once('shutdown', () => {
  // Remove any listeners registered with external objects
  // Clear interval references (should use Phaser timers, not setInterval, but just in case)
  // Nullify references to avoid memory leaks
});
```

### Pattern 7: Asset Preloading with Progress Bar

**What:** All assets (atlases, audio) loaded in PreloadScene using `this.load.atlas()` and `this.load.audio()`. A progress bar is rendered using `this.load.on('progress', ...)`. PreloadScene calls `this.scene.start('MenuScene')` when complete.

**When to use:** Always — PreloadScene only loads assets. No game logic.

**Example:**
```javascript
// Source: Phaser 3 official docs - LoaderPlugin
// In PreloadScene.preload():
this.load.setPath('assets/');

// Texture atlas (TexturePacker JSON Hash format)
this.load.atlas('animals', 'atlases/animals.png', 'atlases/animals.json');
this.load.atlas('ui', 'atlases/ui.png', 'atlases/ui.json');

// Background (must be POT dimensions for TileSprite in WebGL — see Pitfalls)
this.load.image('bg-sky', 'backgrounds/sky.png');
this.load.image('bg-hills', 'backgrounds/hills.png');

// Audio — dual format for Safari
this.load.audio('gunshot', ['audio/gunshot.mp3', 'audio/gunshot.ogg']);

// Progress bar
this.load.on('progress', (progress) => {
  progressBar.clear();
  progressBar.fillRect(barX, barY, barWidth * progress, barHeight);
});

this.load.on('complete', () => {
  this.scene.start('MenuScene');
});
```

### Pattern 8: Phaser Timer for Countdown

**What:** Use `this.time.addEvent()` for all timed operations. Never use `setInterval` or `setTimeout` — these are throttled by the browser when the tab is backgrounded (to ~1Hz) and fire outside the Phaser game loop.

**When to use:** Always. Round countdown, spawn intervals, everything.

**Example:**
```javascript
// Source: docs.phaser.io/phaser/concepts/time
// Countdown timer: fires every 1 second, 90 times
this.roundTimer = this.time.addEvent({
  delay: 1000,
  callback: this.onTimerTick,
  callbackScope: this,
  repeat: 89,   // initial fire + 89 repeats = 90 ticks
});

// Stop it:
this.roundTimer.remove();
```

### Anti-Patterns to Avoid

- **Full-viewport scope zoom via camera.setZoom():** Use circular masked RenderTexture. If you find yourself trying to exclude HUD from zoom, you are on the wrong path.
- **HUD elements in GameScene with no UI camera:** Add the second `uiCamera` in Phase 1 `create()` before any HUD objects are added.
- **Loose scene variables for round state:** `this.score = 0`, `this.timeLeft = 90` scattered on GameScene causes stale state on replay. Use the GameState object.
- **setInterval / setTimeout for timers:** Browser background throttling makes these unreliable. Use `this.time.addEvent()`.
- **No shutdown() cleanup:** Event listeners survive scene transitions, causing actions to fire in the wrong scene.
- **All logic in scene class:** GameScene should be a wiring file. Extract managers (Phase 2+) as separate classes that take the scene reference.
- **NPOT background textures in TileSprite:** Background images used in `tileSprite` must be power-of-two dimensions in WebGL mode. NPOT textures are auto-upscaled with visible anti-aliasing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Asset loading with progress | Custom XHR + canvas drawing | `this.load.*` + `load.on('progress')` | Phaser handles retry, caching, format detection, texture upload |
| Sprite atlases | Individual PNG loads | TexturePacker + `this.load.atlas()` | Individual PNGs = one draw call per sprite; atlas = one draw call for all sprites sharing the sheet |
| Timers | `setInterval` | `this.time.addEvent()` | Browser throttles setInterval in background tabs; Phaser timer pauses with the game |
| Scene data passing | Global window variables | `scene.start(key, data)` and `this.registry` | Global vars survive scene restarts and cause state bleed |
| Camera masking | Manual canvas clip | `camera.ignore()` + GeometryMask | Phaser's masking composites correctly with WebGL renderer |
| Depth sorting | Manual z-index hacks | `gameObject.setDepth(n)` | Phaser handles sort order per frame; depth values are integers |

**Key insight:** Phaser 3 provides production-grade implementations of every common game system. The custom solutions for these problems are always worse — they break in edge cases Phaser already handles (WebGL context loss, scene pause, texture upload timing).

---

## Common Pitfalls

### Pitfall 1: Scope Zoom via camera.setZoom() — Wrong Architecture
**What goes wrong:** Full-viewport zoom cannot produce a circular scope window. HUD elements accidentally zoom. Retrofitting a mask + circular cutout on top of a zoom camera is extremely painful.
**Why it happens:** `camera.setZoom()` is the obvious first API reach. It is in the docs, works immediately, and looks correct until you try to add the circular mask.
**How to avoid:** Use a circular GeometryMask on a semi-transparent overlay `Graphics` object. In Phase 2 the zoomed world view fills the circle using a RenderTexture with a dedicated zoomed camera draw. Establish the two-camera bones in Phase 1.
**Warning signs:** Phaser zooms score text and timer when Shift is held. The HUD jumps or scales. You are writing `uiCamera.setZoom(1)` to compensate for main camera zoom.

### Pitfall 2: TileSprite Non-Power-of-Two Textures
**What goes wrong:** Background image used in `tileSprite` shows visible anti-aliasing / blurring because Phaser auto-upscales the NPOT texture to a POT size before applying GL_REPEAT.
**Why it happens:** The project notes said this "may have changed in Phaser 3.80+" — it has NOT changed as of 3.90. The POT requirement remains.
**How to avoid:** Author all background images destined for TileSprite at POT dimensions: 512, 1024, 2048 px wide. Verify with a scrolling seam test in Phase 1.
**Warning signs:** Background looks slightly blurry or blurred in WebGL mode but sharp in Canvas mode.

### Pitfall 3: Event Listeners Surviving Scene Transitions
**What goes wrong:** Keyboard events, custom events, and `scene.get('HUDScene').events.on(...)` listeners from GameScene survive after `scene.start('MenuScene')`, causing actions to fire in the wrong context.
**Why it happens:** Phaser does not automatically remove external event listeners when a scene shuts down.
**How to avoid:** In every scene's `create()`, register a `this.events.once('shutdown', cleanup)` handler that removes all external listeners.
**Warning signs:** Spacebar fires a shot sound on the menu screen. Score increments after the round ends.

### Pitfall 4: Using setInterval for Round Timer
**What goes wrong:** `setInterval(tick, 1000)` gets throttled to ~1Hz when the tab is backgrounded. The 90-second round becomes 90+ seconds. Timer callbacks fire outside the Phaser update loop, causing mutations at unexpected times.
**Why it happens:** Native JS timers are the default mental model for timing.
**How to avoid:** `this.time.addEvent({ delay: 1000, callback: tick, repeat: 89 })`. Phaser timers pause with the game and fire inside the update loop.
**Warning signs:** Timer runs slowly after Alt+Tab. Timer fires during the results screen.

### Pitfall 5: GameState Scattered as Scene Properties
**What goes wrong:** `this.score`, `this.timeLeft`, `this.isPlaying` on the GameScene class. On replay (`scene.start('GameScene')`), some of these do not reset because the scene is recreated from scratch but developers forget to initialize some variables in `create()` vs. class-level initialization.
**Why it happens:** `this` on a Phaser Scene is a convenient bag for any state.
**How to avoid:** Single `this.gameState = createGameState(this)` in `create()`. All round state in that object. `reset()` is one call.
**Warning signs:** Score shows a non-zero value at the start of a new round. Timer starts at a value other than 90.

### Pitfall 6: No Depth Constants — Z-Order Chaos
**What goes wrong:** Background layers, animals, scope overlay, and HUD text all get default depth 0. Things render in the wrong order. Scope overlay appears behind animals. HUD appears behind the scope vignette.
**Why it happens:** `setDepth()` is not required to make things appear on screen, so developers skip it until problems emerge.
**How to avoid:** Define a `DEPTH` constants object in `src/constants.js` before adding any sprites. Apply `setDepth(DEPTH.X)` explicitly on every game object.
**Warning signs:** Background layers are visible in front of animals. Scope overlay is not on top.

### Pitfall 7: Phaser.WEBGL Instead of Phaser.AUTO
**What goes wrong:** Some environments (corporate VMs, old GPUs, certain Linux configurations) have WebGL disabled. The game shows a blank canvas with no user-facing error.
**Why it happens:** Developers default to `type: Phaser.WEBGL` for performance.
**How to avoid:** Always use `type: Phaser.AUTO`. Phaser falls back to Canvas renderer automatically. One-line fix with significant compatibility benefit.
**Warning signs:** Blank screen in some browser/OS combinations with no console error visible to end users.

---

## Code Examples

Verified patterns from official sources:

### Phaser.Game Config (main.js)
```javascript
// Source: phaserjs/template-vite (Phaser 3.90 / Vite 6)
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { ResultScene } from './scenes/ResultScene';

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  scene: [BootScene, PreloadScene, MenuScene, GameScene, HUDScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
```

### DEPTH Constants (constants.js)
```javascript
// Source: established Phaser 3 community pattern — verified against setDepth() docs
export const DEPTH = {
  SKY:            0,
  HILLS:         10,
  MIDGROUND:     20,
  ANIMALS:       30,
  FOREGROUND:    40,
  SCOPE_DARK:    50,   // semi-transparent overlay
  SCOPE_WINDOW:  60,   // the circular cutout / lens
  CROSSHAIR:     70,
  HUD:          100,
};

export const SCENE_KEYS = {
  BOOT:    'BootScene',
  PRELOAD: 'PreloadScene',
  MENU:    'MenuScene',
  GAME:    'GameScene',
  HUD:     'HUDScene',
  RESULT:  'ResultScene',
};
```

### Two-Camera Setup (GameScene.create)
```javascript
// Source: docs.phaser.io/phaser/concepts/cameras
// In GameScene.create():
const { width, height } = this.scale;

// Main camera: renders world (animals, background, scope)
// Already exists as this.cameras.main — configure it:
this.cameras.main.setBackgroundColor('#1a1a2e');

// UI camera: renders HUD overlay, crosshair, scope frame
// Never scrolls or zooms
this.uiCamera = this.cameras.add(0, 0, width, height, false, 'ui');
this.uiCamera.setBackgroundColor('rgba(0,0,0,0)');

// After adding a world object (background, animals):
// this.uiCamera.ignore(worldObject);
//
// After adding a UI object (score text, crosshair):
// this.cameras.main.ignore(uiObject);
```

### Atlas Loading (PreloadScene.preload)
```javascript
// Source: docs.phaser.io/api-documentation/class/loader-loaderplugin
// In PreloadScene.preload():
this.load.setPath('assets/');

// Texture atlases (TexturePacker JSON Hash format)
this.load.atlas('animals', 'atlases/animals.png', 'atlases/animals.json');
this.load.atlas('ui',      'atlases/ui.png',      'atlases/ui.json');

// Static images (backgrounds — must be POT for tileSprite)
this.load.image('bg-sky',   'backgrounds/sky-1024x512.png');
this.load.image('bg-hills', 'backgrounds/hills-2048x512.png');

// Audio (dual format for Safari compatibility)
this.load.audio('gunshot', ['audio/gunshot.mp3', 'audio/gunshot.ogg']);

// Progress display
const bar = this.add.graphics();
this.load.on('progress', (p) => {
  bar.clear();
  bar.fillStyle(0xffffff, 1);
  bar.fillRect(200, 360, 880 * p, 24);
});
this.load.on('complete', () => {
  this.scene.start(SCENE_KEYS.MENU);
});
```

### Parallel HUDScene Launch
```javascript
// Source: Phaser 3 official example - launch-parallel-scene
// In GameScene.create():
this.scene.launch(SCENE_KEYS.HUD);

// Emit score updates to HUDScene:
this.events.emit('scoreUpdate', this.gameState.get().score);
```

### Phaser Timer (not setInterval)
```javascript
// Source: docs.phaser.io/phaser/concepts/time
// In GameScene — start a 90-second round countdown:
this.roundTimer = this.time.addEvent({
  delay: 1000,
  callback: this.onTimerTick,
  callbackScope: this,
  repeat: 89,  // 90 total ticks (initial + 89 repeats)
});

onTimerTick() {
  const newTime = this.gameState.get().timeLeft - 1;
  this.gameState.setState({ timeLeft: newTime });
  if (newTime <= 0) {
    this.onRoundEnd();
  }
}
```

### Scene Transition with Data
```javascript
// Source: docs.phaser.io/phaser/concepts/scenes
// Pass round result to ResultScene:
this.scene.start(SCENE_KEYS.RESULT, {
  score:    this.gameState.get().score,
  roundNum: this.gameState.get().roundCount,
});

// In ResultScene.init(data):
this.finalScore = data.score;
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Webpack + Phaser | Vite + Phaser | ~2022; official template since 2024 | Much faster HMR; zero-config setup |
| Phaser.WEBGL explicit | Phaser.AUTO | Stable since Phaser 3 launch | Automatic Canvas fallback for environments without WebGL |
| `scene.start()` passing globals | `scene.start(key, data)` + `this.registry` | Stable since Phaser 3 | Clean data passing without global variable leakage |
| Individual PNG loads | Texture atlases via `load.atlas()` | Well-established | Fewer draw calls; texture atlases reduce GPU overhead significantly |
| TileSprite POT | TileSprite still POT (no change) | NOT changed in 3.80+ despite project assumption | Background images MUST be power-of-two for tileSprite in WebGL |

**Deprecated / outdated:**
- `Phaser.Game(config)` passing `state:` (Phaser 2 API): replaced by `scene:` array
- `this.state.start()` (Phaser 2): replaced by `this.scene.start()`
- Phaser 2 / Phaser CE: dead, unmaintained — do not use
- Webpack as primary Phaser bundler: Vite is the official recommendation

---

## Open Questions

1. **Placeholder background art dimensions**
   - What we know: Background images used in `tileSprite` must be POT in WebGL mode (512, 1024, 2048 px)
   - What's unclear: What placeholder art will be created for Phase 1 — generated solid color? Simple gradient? Actual bush scene?
   - Recommendation: Use solid color `graphics.fillRect()` for Phase 1 background to unblock architecture validation. Replace with real art in Phase 2. Do not block Phase 1 on art production.

2. **HUDScene rendering the scope overlay vs. GameScene**
   - What we know: Scope overlay is a circular masked RenderTexture with a darkened surround; the `uiCamera` in GameScene can handle this
   - What's unclear: Whether the scope overlay should live in GameScene (on the uiCamera) or in HUDScene
   - Recommendation: Keep scope overlay in GameScene on the `uiCamera` layer. HUDScene is for text/numbers (score, timer). Scope overlay is tightly coupled to the world camera and crosshair position — it belongs in GameScene.

3. **Scale mode for 1280x720 target**
   - What we know: `Phaser.Scale.FIT` with `CENTER_BOTH` is the standard approach
   - What's unclear: Whether the game should lock aspect ratio or allow letterboxing
   - Recommendation: Use `Phaser.Scale.FIT` — letterboxing with black bars is acceptable for an arcade game. Do not allow stretching as it distorts the scope overlay circle.

---

## Sources

### Primary (HIGH confidence)
- `docs.phaser.io/phaser/concepts/scenes` — scene lifecycle, shutdown event, scene.start() data passing
- `docs.phaser.io/phaser/concepts/cameras` — multiple cameras, camera.ignore(), UI camera pattern
- `docs.phaser.io/phaser/concepts/time` — time.addEvent(), repeat vs loop, timer removal
- `docs.phaser.io/phaser/concepts/textures` — load.atlas(), multiatlas(), supported formats
- `docs.phaser.io/api-documentation/class/loader-loaderplugin` — setPath(), atlas(), audio()
- `docs.phaser.io/api-documentation/class/gameobjects-rendertexture` — draw(), camera property, mask support
- `docs.phaser.io/phaser/concepts/gameobjects/tile-sprite` — POT requirement confirmed for Phaser 3.90

### Secondary (MEDIUM confidence)
- `github.com/phaserjs/template-vite` — Phaser 3.90 + Vite 6.3.1 as pinned versions in official template (verified via WebFetch)
- `phaser.io/download/stable` — Phaser v3.90.0 "Tsugumi" is current stable (verified via WebSearch)
- `rexrainbow.github.io/phaser3-rex-notes/docs/site/camera/` — two-camera setup code examples cross-verified with official docs
- `phaser.discourse.group` — community confirmation of scope overlay approach (masked overlay vs camera.setZoom)

### Tertiary (LOW confidence — not used for prescriptive claims)
- `phaser.io/news/2024/07/phaser-beam-technical-preview-3` — TileSprite POT requirement will be removed in Phaser Beam (next-gen renderer), but Beam is NOT Phaser 3.x stable. Do not assume this change has landed.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified Phaser 3.90 + Vite 6.3.1 as official template versions
- Scene graph: HIGH — stable Phaser 3 API, multiple official source confirmations
- Two-camera setup: HIGH — verified against docs.phaser.io camera docs and Rex Rainbow notes
- Scope overlay architecture: HIGH — circular mask approach verified; camera.setZoom pitfall confirmed in official docs
- GameState pattern: HIGH — JavaScript pattern, framework-agnostic, confirmed by Phaser community
- TileSprite POT requirement: HIGH — explicitly documented at docs.phaser.io/phaser/concepts/gameobjects/tile-sprite for current Phaser 3.90
- Atlas loading: HIGH — LoaderPlugin API stable, format requirements documented

**Research date:** 2026-02-19
**Valid until:** 2026-03-20 (Phaser 3 core APIs are stable; version bump unlikely within 30 days)
