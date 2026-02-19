# Project Research Summary

**Project:** Franna — African Antelope Hunting Game
**Domain:** Browser-based 2D arcade shooting gallery game (Phaser 3, desktop)
**Researched:** 2026-02-19
**Confidence:** MEDIUM

## Executive Summary

Franna is a browser-based arcade hunting game in the "shooting gallery" genre — a well-understood domain with established patterns from games like Duck Hunt through to modern browser clones. The right tool is Phaser 3 with a Vite build setup: this combination is the de-facto standard for 2D browser games, has a large community, and provides all required subsystems (input, audio, tweens, cameras, scene management, sprite groups) without requiring third-party dependencies. The game is architecturally simple — a single active gameplay scene with thin supporting scenes, a few focused manager classes, and hitscan-based shooting — and should be built that way. Resist any urge to introduce physics bodies for movement, 3D frameworks, or React/DOM overlays.

The core gameplay loop is well-defined: mouse-aimed crosshair, Shift-to-scope zoom, spacebar or click to shoot, targets moving across an African bush backdrop, correct/wrong target distinction with penalty, round timer, score, and replay. Nine MVP features must ship before the game is playable. Five differentiators (scope sway, parallax atmosphere, reload mechanic, combo multiplier, local leaderboard) are worth building in post-MVP passes. The most common failure mode for this genre is misjudging scope, adding multiplayer, story modes, or full ballistics simulation — none of which belong in an arcade browser game.

The highest-risk areas are the scope zoom implementation (wrong approach chosen early causes a cascade of rework), coordinate-space bugs in hit detection during zoom, and input state desync on tab switch. All three must be addressed in Phase 1 or early Phase 2, before building on top of them. Architecture, asset pipeline, and state management choices made in Phase 1 are foundational — if they are wrong, they are expensive to fix later.

---

## Key Findings

### Recommended Stack

Phaser 3 (3.80+) with Vite 5.x is the only sensible choice. Phaser handles rendering (Canvas/WebGL via `Phaser.AUTO`), input, audio, sprite groups, tweens, cameras, and scene management. Vite provides fast HMR and zero-config production builds. TypeScript is optional — start without it to move fast, add it if the codebase grows. No other frameworks are needed and most alternatives (PixiJS, Unity WebGL, React+canvas, Three.js) are worse fits for different reasons.

Asset pipeline requires a texture atlas workflow from day one (TexturePacker or Free Texture Packer). Sprite atlases reduce draw calls and HTTP requests. Audio must be dual-format (.ogg + .mp3) to support Safari. jsfxr can generate arcade-appropriate sound effects in-browser with no art budget.

**Core technologies:**
- **Phaser 3 (3.80+):** Game framework — handles everything the game needs natively
- **Vite 5.x:** Build tooling — fast dev server, simple Phaser config, production builds
- **TexturePacker / Free Texture Packer:** Asset pipeline — sprite atlas generation, required for performance
- **jsfxr:** Sound design — arcade SFX generation, no audio budget required
- **TypeScript (optional):** Type safety — Phaser has excellent TS definitions; add after initial scaffold

### Expected Features

The genre has strong expectations. Missing any table-stakes feature makes the game feel broken, not unfinished.

**Must have (table stakes):**
- Custom crosshair cursor replacing the OS cursor
- Click / spacebar to shoot with immediate hit feedback
- Scope / zoom view on Shift-hold (circular mask, not full-viewport zoom)
- Moving animal targets (tweened paths across the scene)
- Correct target vs. wrong target distinction with visible silhouette differences
- Penalty for shooting wrong targets (flat deduction, never go negative)
- Score display in HUD
- Round timer (60-90 seconds)
- Hit/miss sound effects and visual feedback (flash, puff, screen shake)
- Basic difficulty ramp over rounds or time
- Round-end screen with score and replay

**Should have (differentiators):**
- Authentic African bush parallax background (acacia, grass, sky layers)
- Scope sway / rifle drift (sinusoidal offset while scoped)
- Reload mechanic with magazine counter
- Combo / streak multiplier
- LocalStorage high score leaderboard
- Environmental distractors (birds flushing, dust clouds)

**Defer (v2+):**
- Wind indicator affecting bullet path (High complexity, Low arcade value)
- Antelope behaviour state machine (grazing/alert/fleeing) — use simple tweens in MVP
- Golden hour / time-of-day lighting pass
- Mobile touch controls (fundamentally incompatible with scope mechanic — do not build)
- Multiplayer, story mode, inventory, microtransactions — anti-features for this genre

### Architecture Approach

The architecture is Scene-first with thin manager classes. One active GameScene owns AnimalManager, ScopeOverlay, ScoreManager, RoundTimer, and CollisionSystem as plain classes that receive the scene reference. A parallel HUDScene runs on top of GameScene, listening to events via Phaser's EventEmitter. Boot → Preload → Menu → [Game + HUD parallel] → Result is the scene graph. State flows one direction: user input triggers CollisionSystem, which updates ScoreManager, which emits events, which HUDScene renders. Round results pass via `scene.start(key, data)`; high score persists via `this.registry`.

**Major components:**
1. **BootScene / PreloadScene** — asset loading with progress bar; establishes atlas workflow
2. **GameScene** — game loop owner; wires all managers, owns physics world
3. **HUDScene** — parallel scene; renders score, timer, ammo as a read-only display layer
4. **AnimalManager** — object pool of 20 sprites max; tween-based path movement; explicit activate/deactivate lifecycle
5. **ScopeOverlay** — circular mask on zoomed sub-view (not camera.setZoom on full viewport); two-camera setup
6. **CollisionSystem** — hitscan (bounds check at moment of Spacebar press); not Arcade Physics overlap
7. **ScoreManager** — points, penalty, combo, configurable constants
8. **RoundTimer** — Phaser time.addEvent only; no setInterval
9. **ResultScene** — final score display; play again / menu transitions

### Critical Pitfalls

1. **Scope zoom via camera.setZoom() (wrong architecture)** — Use a circular masked render texture for the scope, not full-viewport camera zoom. Two-camera setup (world camera + UI camera) must be established in Phase 1. If you try to "exclude HUD from zoom" after the fact, you took the wrong path.

2. **Hit detection in screen space during zoom** — Convert pointer coordinates to world space with `camera.getWorldPoint()` before every shot. Write a dedicated `resolveShot(pointer, camera, scopeActive)` function and test it in isolation before wiring to ScoreManager.

3. **Animal movement as Arcade Physics bodies** — Animals share no physical interactions; they run on fixed paths. Use Phaser Tweens. Physics bodies add overhead and cause clumping. Reserve overlap checks (or skip them entirely in favor of `Phaser.Geom.Rectangle.Contains()`) for hitscan only.

4. **Loose scene variable state management** — All round state (score, timeLeft, phase, roundCount) must live in a single `GameState` object mutated via a `setState()` method. Round reset must be one call. Scattered variables on `this` cause stale state on replay.

5. **Shift key state lost on tab switch** — Add `window.addEventListener('blur', clearHeldKeys)` alongside the Shift key listener. Check key state in `update()` via `checkDown()` rather than relying solely on keyup events.

**Also high risk:** Safari audio autoplay (gate behind first user gesture; dual .ogg/.mp3 format); scene event listener leaks (always implement `shutdown()` cleanup); setInterval for timer (use `this.time.addEvent()` exclusively).

---

## Implications for Roadmap

Based on research, the build order from ARCHITECTURE.md maps cleanly to a 4-phase roadmap. Architecture decisions in Phase 1 are foundational — they cannot be skipped or deferred.

### Phase 1: Foundation — Scene Architecture, Asset Pipeline, Game Loop

**Rationale:** Camera setup, depth z-order constants, scene structure, game state object, Phaser timer, WebGL fallback config, and the preload/atlas pipeline are all foundational. Every other phase builds on top of them. Getting scope zoom architecture wrong in Phase 1 cascades into Phase 2 rewrites. Getting state management wrong causes replay bugs. These are cheapest to fix before anything else exists.

**Delivers:** Playable scaffold — Boot → Preload (progress bar) → Menu → GameScene (empty world) → ResultScene. Two-camera setup established. Depth constants map defined. GameState object with `setState()`. Phaser `time.addEvent()` timer. `Phaser.AUTO` renderer. Atlas workflow validated with placeholder sprites.

**Addresses:** Boot/preload, scene graph, game loop
**Avoids:** Pitfall 1 (scope zoom), Pitfall 5 (loose state), Pitfall 7 (depth z-order), Pitfall 11 (WebGL fallback), Pitfall 12 (scene listener leaks), Pitfall 13 (setInterval), Pitfall 14 (tileSprite WebGL seam)

### Phase 2: Core Gameplay Loop — Animals, Input, Shooting, HUD

**Rationale:** Once the foundation is solid, build the entire gameplay loop in one phase to achieve a playable-but-rough game. AnimalManager (with object pool and tween movement), InputManager (mouse tracking + Shift zoom), ScopeOverlay (masked sub-view), CollisionSystem (hitscan), ScoreManager, HUDScene (parallel), and basic sound effects all depend on each other and should land together.

**Delivers:** A fully playable round — animals spawn and move, player can aim and shoot, hit/miss detection works, scope zoom feels correct, score and timer display in HUD, round ends and results screen shows score.

**Uses:** Phaser Tweens (not physics) for movement; `getWorldPoint()` coordinate transform; `scene.launch('HUDScene')`; jsfxr for placeholder SFX; object pool with explicit `activate()`/`deactivate()`
**Implements:** AnimalManager, ScopeOverlay, CollisionSystem, ScoreManager, RoundTimer, HUDScene
**Avoids:** Pitfall 2 (spritesheet frame mismatch), Pitfall 3 (physics movement), Pitfall 4 (coordinate space), Pitfall 6 (Safari audio — test now), Pitfall 8 (stale animation pool state), Pitfall 10 (Shift key blur desync)

### Phase 3: Polish and Game Feel — Atmosphere, Feedback, Balance

**Rationale:** Core loop is playable after Phase 2. Phase 3 adds everything that makes it feel good: parallax background, ambient sound, hit particles, screen shake, combo multiplier, scope sway, reload mechanic, wrong-target penalty tuning, and difficulty ramp. These are all incremental additions on a working base — they cannot happen before Phase 2 is complete and they benefit from being able to playtest the reward/penalty ratio against actual gameplay.

**Delivers:** Polished, atmospherically complete game — African bush parallax, ambient audio, full hit/miss feedback effects, scope sway, reload, difficulty ramp, tuned penalty constants.

**Addresses:** Differentiator features (scope sway, combo multiplier, reload, parallax, distractors)
**Avoids:** Pitfall 9 (penalty tuning — expose as config constant in Phase 2, tune values in Phase 3)

### Phase 4: Retention and Distribution — Leaderboard, Final QA, Deploy

**Rationale:** LocalStorage high score, session leaderboard, species identification labels, and final cross-browser QA (especially Safari audio and WebGL fallback) can only happen after the game is complete. Static deployment to GitHub Pages or Netlify via `vite build` is straightforward.

**Delivers:** Shipped game — high score persistence, replay driver, Safari-tested audio, cross-browser QA, production deployment.

**Addresses:** High score leaderboard (LocalStorage), Safari audio verification, distribution

### Phase Ordering Rationale

- Two-camera setup and depth constants must precede scope overlay and sprite rendering — architectural decisions that are expensive to retrofit.
- Object pool and tween movement must be established before adding multiple animal types — adding species to a wrong-architecture spawner is a rewrite.
- Hit detection coordinate transform must be unit-tested before connecting to scoring — a game-feel bug here is invisible in unit tests if not isolated.
- Penalty tuning (Pitfall 9) requires measuring reward rates against real gameplay — cannot be done until Phase 2 is playable.
- Safari audio test (Pitfall 6) should happen in Phase 2, not Phase 4 — retrofitting autoplay gating late is painful.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 — Scope overlay:** The circular masked render texture implementation is the highest-risk technical element. Verify current Phaser 3 API for `camera.getWorldPoint()` and masked RenderTexture against live Phaser 3.80+ docs before implementation. [VERIFY]
- **Phase 2 — Safari audio:** Verify `this.sound.unlock()` vs `this.sound.context.resume()` behavior in current Phaser 3. Safari autoplay policy has evolved. [VERIFY]

Phases with standard patterns (research unnecessary):
- **Phase 1:** Scene structure, Vite config, PreloadScene, Phaser.AUTO renderer — all well-documented with official examples.
- **Phase 3:** Tweens, particles, screen shake, parallax tileSprite — all stable Phaser APIs with abundant examples.
- **Phase 4:** Vite production build, GitHub Pages / Netlify deploy — standard static site workflow.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Phaser 3 + Vite is the documented community standard. No alternatives are competitive for this use case. |
| Features | MEDIUM | Genre conventions derived from training data on Duck Hunt / browser gallery games. Core list is solid; differentiator priority order is inference. |
| Architecture | HIGH | Phaser 3 Scene, Input, Camera, Physics, Tween, and Sound Manager APIs are stable since v3.0. Hitscan and object pool patterns are confirmed community practice. |
| Pitfalls | HIGH (mostly) | Most pitfalls are based on stable Phaser 3 APIs and browser behaviors. Two items marked [VERIFY]: `camera.getWorldPoint()` signature and `tileSprite` WebGL wrap mode in Phaser 3.80+. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Scope zoom implementation detail:** `camera.getWorldPoint()` signature and RenderTexture masking approach should be verified against Phaser 3.80+ changelog before Phase 2 implementation starts.
- **Safari audio unlock API:** `this.sound.unlock()` vs `this.sound.context.resume()` — verify against current Phaser docs during Phase 2 audio integration.
- **tileSprite power-of-2 requirement:** May have changed in recent Phaser WebGL renderer updates. Test with actual background art dimensions in Phase 1.
- **Penalty/reward ratio:** Cannot be validated without playtest data. Expose all balance constants as a config object from Phase 2; tune in Phase 3.
- **Art assets:** No visual design research was in scope. Animal sprites, parallax backgrounds, and scope overlay art are unresolved. Placeholder art should unblock development; final art can be integrated at any phase.

---

## Sources

### Primary (HIGH confidence)
- Phaser 3 official documentation (newdocs.phaser.io) — Scene API, Physics.Arcade, Input, Sound Manager, Data Manager, Camera, Tweens
- Phaser 3 official examples (phaser.io/examples) — object pooling, parallax, camera zoom, scene management, HUD patterns

### Secondary (MEDIUM confidence)
- Phaser 3 community patterns (Phaser Discourse, GitHub issues) — parallel HUD scene, hitscan over physics overlap, object pool animation reset
- Genre conventions from Duck Hunt, Cabela's hunting games, browser shooting galleries — feature expectations, table stakes, anti-features
- Vite + Phaser starter templates (community) — project structure, build config

### Tertiary (LOW confidence — needs validation)
- Scope sway and reload patterns: standard in hunting simulation sub-genre — unverified against current browser game landscape
- `camera.getWorldPoint()` exact signature in Phaser 3.80+ [VERIFY against live docs]
- `this.sound.unlock()` behavior on Safari with current Phaser version [VERIFY against live docs]
- tileSprite power-of-2 requirement in current Phaser WebGL renderer [VERIFY with test]

---

*Research completed: 2026-02-19*
*Ready for roadmap: yes*
