# Architecture Patterns

**Domain:** Browser-based arcade shooting game (Phaser 3)
**Researched:** 2026-02-19
**Confidence:** MEDIUM — based on training knowledge of Phaser 3 (stable API, well-established patterns as of August 2025). No live web access during this session. Core Phaser 3 Scene/Physics/Input APIs have been stable since 2018; patterns here are consistent with official examples and community usage.

---

## Recommended Architecture

Franna is a single-player, single-round arcade game. It does not need a complex server, state machine, or data layer. The right architecture is: **one active gameplay Scene with thin supporting Scenes, a few focused manager classes, and a simple data model passed between scenes via the Scene registry or launch data.**

```
┌─────────────────────────────────────────────────────────────┐
│  Phaser.Game (config, renderer, scene list)                 │
│                                                             │
│  ┌──────────────┐  ┌─────────────────────────────────────┐ │
│  │  BootScene   │→ │  PreloadScene                       │ │
│  │  (config)    │  │  (load all assets, show progress)   │ │
│  └──────────────┘  └──────────────┬──────────────────────┘ │
│                                   │                         │
│                    ┌──────────────▼──────────────────────┐ │
│                    │  MenuScene                          │ │
│                    │  (title, start button, hi-score)    │ │
│                    └──────────────┬──────────────────────┘ │
│                                   │                         │
│  ┌────────────────────────────────▼──────────────────────┐ │
│  │  GameScene  (primary, runs the round)                 │ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │  Background  │  │  AnimalMgr   │  │  InputMgr   │ │ │
│  │  │  Layer       │  │  (spawner +  │  │  (mouse +   │ │ │
│  │  │  (parallax   │  │   pool)      │  │   keyboard) │ │ │
│  │  │   bushveld)  │  └──────┬───────┘  └──────┬──────┘ │ │
│  │  └──────────────┘         │                 │        │ │
│  │                           ▼                 ▼        │ │
│  │  ┌──────────────┐  ┌──────────────────────────────┐  │ │
│  │  │  ScopeOverlay│  │  CollisionSystem             │  │ │
│  │  │  (zoom mask, │  │  (hitTest: bullet vs animals)│  │ │
│  │  │   vignette)  │  └──────────────┬───────────────┘  │ │
│  │  └──────────────┘                 │                  │ │
│  │                                   ▼                  │ │
│  │  ┌──────────────┐  ┌──────────────────────────────┐  │ │
│  │  │  RoundTimer  │  │  ScoreManager                │  │ │
│  │  │  (countdown) │  │  (tally, combo, penalties)   │  │ │
│  │  └──────┬───────┘  └──────────────────────────────┘  │ │
│  │         │                                              │ │
│  │         └──── round end event ────────────────────┐   │ │
│  └────────────────────────────────────────────────────┼───┘ │
│                                                        │     │
│                    ┌───────────────────────────────────▼─┐   │
│                    │  ResultScene                        │   │
│                    │  (final score, play again)          │   │
│                    └─────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  HUDScene  (parallel scene, always-on overlay)       │   │
│  │  (ammo count, score ticker, round timer display)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Why parallel HUDScene

Phaser 3 supports running multiple scenes simultaneously. HUD elements (score, timer, ammo) live in a separate scene on top of GameScene. This keeps GameScene logic clean and means HUD never interferes with physics or depth sorting in the game world. Communication happens via `this.scene.get('HUDScene').events.emit(...)` or the shared registry.

---

## Component Boundaries

| Component | Responsibility | Communicates With | Lives In |
|-----------|---------------|-------------------|----------|
| `BootScene` | Set global scale mode, load minimal config | PreloadScene | Scene |
| `PreloadScene` | Load all textures, atlases, audio, tilemaps | MenuScene on complete | Scene |
| `MenuScene` | Title, high score display, "Play" button | GameScene + HUDScene on start | Scene |
| `GameScene` | Game loop, spawning, physics, win/lose logic | HUDScene (events), ResultScene (data) | Scene |
| `HUDScene` | Render score, timer, ammo — read-only display | Listens to GameScene events | Scene (parallel) |
| `ResultScene` | Final score, play-again, back-to-menu | MenuScene or GameScene | Scene |
| `AnimalManager` | Spawn pool of animal sprites, path movement, despawn | GameScene (owns it), CollisionSystem | Class inside GameScene |
| `ScopeOverlay` | Zoom lens mask, vignette, crosshair scaling | GameScene input state | Class inside GameScene |
| `ScoreManager` | Points +/-, combo multiplier, penalty logic | GameScene, emits to HUDScene | Class inside GameScene |
| `RoundTimer` | Countdown, emits round-end event | GameScene (listens), HUDScene display | Class inside GameScene |
| `CollisionSystem` | Hit detection: bullet → animal (Arcade Physics or manual overlap) | AnimalManager, ScoreManager | GameScene method or class |

---

## Data Flow

### Input → Action

```
Mouse move
  → Phaser Input Plugin
    → ScopeOverlay.updateCrosshair(pointer.x, pointer.y)
      → if Shift held: zoom view, shrink real hit area
        → Spacebar pressed: fire()
          → CollisionSystem.checkHit(crosshairPos)
            → AnimalManager.getAnimalAt(pos)
              → if target animal: ScoreManager.addPoints(animal.value)
              → if wrong animal: ScoreManager.applyPenalty()
              → if miss: play miss SFX
                → HUDScene receives score-update event → re-renders
```

### Round Lifecycle

```
GameScene.create()
  → AnimalManager.start()   // begin spawning
  → RoundTimer.start(90s)
  → HUDScene.launch()       // parallel scene
    ↓
  [game loop: spawn / aim / shoot / score]
    ↓
  RoundTimer fires 'roundEnd'
  → GameScene pauses spawning
  → GameScene collects final ScoreManager.getScore()
  → this.scene.start('ResultScene', { score, hits, misses, penalties })
    ↓
  ResultScene displays result
  → 'Play Again' → this.scene.start('GameScene')
  → 'Menu' → this.scene.start('MenuScene')
```

### Cross-Scene Data

Use Phaser's `scene.start(key, data)` to pass round results to ResultScene. Use `this.registry` (Phaser.Data.DataManager, global to the game) for persistent state like high score. Do not use global JS variables — the registry is observable and serialization-friendly.

```
ScoreManager.getScore() → passed via scene.start() data arg → ResultScene
registry.set('hiScore', n) → persists across scenes, read by MenuScene
```

---

## Patterns to Follow

### Pattern 1: Object Pooling for Animals

**What:** Pre-allocate a fixed-size group of animal sprites at scene creation. Reuse inactive sprites instead of creating/destroying on every spawn.

**When:** Any time you have frequent short-lived sprites (animals running across screen). Prevents GC spikes mid-round.

**Example:**
```typescript
// In AnimalManager
this.pool = this.scene.physics.add.group({
  classType: Animal,
  maxSize: 20,
  runChildUpdate: true,
});

spawn(config: AnimalConfig) {
  const animal = this.pool.get(config.x, config.y, config.texture);
  if (!animal) return; // pool exhausted — safe fallback
  animal.activate(config);
}
```

### Pattern 2: Parallel HUD Scene

**What:** Launch HUDScene alongside GameScene using `this.scene.launch('HUDScene')`. HUDScene listens for events emitted by GameScene.

**When:** UI that must persist cleanly above game world, needs different depth sorting, or might need to pause independently of game.

**Example:**
```typescript
// In GameScene.create()
this.scene.launch('HUDScene');
this.events.on('scoreUpdate', (score: number) => {
  this.scene.get('HUDScene').events.emit('scoreUpdate', score);
});
```

### Pattern 3: Scope Zoom via Camera Zoom + Mask

**What:** On Shift hold, lerp `this.cameras.main.zoom` from 1 to 2.5 and apply a circular mask (Graphics object) to simulate a rifle scope. Revert on Shift release.

**When:** The zoom mechanic is central to Franna's feel. Camera zoom is cheap; mask gives the circular scope window.

**Example:**
```typescript
// In ScopeOverlay
enter() {
  this.tweens.add({ targets: this.cameras.main, zoom: 2.5, duration: 120 });
  this.scopeMask.setVisible(true);
  this.vignette.setVisible(true);
}
exit() {
  this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 80 });
  this.scopeMask.setVisible(false);
  this.vignette.setVisible(false);
}
```

### Pattern 4: Animal Path Movement via Tweens or Physics Velocity

**What:** Animals move on straight or curved paths across the scene. Use `physics.velocityX/Y` for straight runs with randomized speed. Use Tweens on position for curved paths. Avoid expensive pathfinding — this is arcade.

**When:** Straight runs work for springbok/impala. Curved tweens work for birds. Do not use NavMesh or grid movement.

**Example:**
```typescript
// Simple straight run (Arcade Physics)
animal.setVelocityX(Phaser.Math.Between(-300, -180)); // left-to-right or right-to-left

// Curved bird path (Tween)
this.tweens.add({
  targets: bird,
  x: targetX,
  y: { value: targetY, ease: 'Sine.easeInOut' },
  duration: 2000,
});
```

### Pattern 5: Hit Detection Without Physics Collision

**What:** For shooting, don't rely on Arcade Physics `overlap()` between a bullet sprite and animals. Instead, treat the shot as an instant raycast: on Spacebar, sample the crosshair world position and call `getWorldTransformMatrix` on each active animal to check if the point falls within the animal's bounds.

**When:** Hitscan weapons (rifle) feel more accurate than projectile-based collision and are simpler to implement. No bullet sprite needed.

**Example:**
```typescript
fire(worldX: number, worldY: number) {
  for (const animal of this.animalManager.active()) {
    if (animal.getBounds().contains(worldX, worldY)) {
      this.onHit(animal);
      return;
    }
  }
  this.onMiss();
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Putting All Logic in Scene Class

**What:** Writing AnimalManager, ScoreManager, ScopeOverlay as methods directly on GameScene instead of separate classes.

**Why bad:** GameScene becomes a 1000-line file. Hard to test, hard to reason about. Scope overlay logic tangled with spawning logic.

**Instead:** Extract each manager into a class that receives the scene reference in its constructor. GameScene wires them together, delegates to them.

### Anti-Pattern 2: Using Arcade Physics for Hit Detection on Shots

**What:** Creating a bullet sprite and using `physics.add.overlap(bullet, animalGroup, ...)`.

**Why bad:** Bullets move too fast (or are hitscan). Physics overlap runs once per tick — a fast bullet can tunnel through animals between frames. Also adds visual bullet sprite that may not match the "silent scope" feel.

**Instead:** Hitscan — check bounds at moment of Spacebar press (see Pattern 5).

### Anti-Pattern 3: Creating/Destroying Sprites Per Spawn

**What:** `this.add.sprite(x, y, 'animal')` on every spawn, `sprite.destroy()` on exit.

**Why bad:** Garbage collection pressure over a 90-second round with many spawns causes frame stutters.

**Instead:** Object pool (Pattern 1). Recycle, never destroy during play.

### Anti-Pattern 4: Global JavaScript State

**What:** `window.score = 0`, `window.hiScore = 0` or module-level mutable singletons.

**Why bad:** Breaks Phaser scene lifecycle. State leaks between play sessions. Not observable.

**Instead:** `this.registry.set('hiScore', n)` for cross-scene persistence. Pass round data via `scene.start(key, data)`.

### Anti-Pattern 5: Blocking PreloadScene with Logic

**What:** Running game initialization code (spawning, layout) inside PreloadScene.

**Why bad:** PreloadScene should only load assets. Any failure in logic contaminates the loading screen.

**Instead:** All game init in `GameScene.create()`. PreloadScene calls `this.scene.start('MenuScene')` when complete.

### Anti-Pattern 6: Single Monolithic Scene

**What:** One scene for everything — menu, game, HUD, results.

**Why bad:** Can't independently pause HUD, can't cleanly transition, restart is a mess.

**Instead:** Separate scenes per concern. Boot → Preload → Menu → [Game + HUD parallel] → Result.

---

## Scalability Considerations

This is a single-round arcade game. Scalability is not a concern in the traditional sense. The relevant dimension is **performance within a 90-second round**.

| Concern | Acceptable approach | Would break at |
|---------|--------------------|---------------------------------|
| Animal count on screen | Pool of 20 max; 6-10 typical | > 50 active physics bodies may drop FPS on low-end hardware |
| Parallax layers | 3-4 layers (sky, midground, foreground bushes) | > 8 layers with large textures |
| Particle effects (dust, hit flash) | Phaser Particles — burst emitters, short lifespan | Continuous high-count emitters; keep max 50 particles/burst |
| Audio | Web Audio API via Phaser Sound Manager; preload all clips | Streaming or dynamic loading mid-round |
| Texture memory | Pack all sprites into a single atlas (TexturePacker) | Many individual PNGs cause draw call overhead |

---

## Build Order (Component Dependencies)

The architecture has a clear dependency graph. Build in this order to avoid blocking:

```
1. BootScene + PreloadScene
   (nothing depends on art/assets until this works)

2. GameScene skeleton (create/update loop, camera setup)
   (everything else lives inside GameScene)

3. Background layers + parallax scrolling
   (establishes world space that animals move through)

4. AnimalManager — spawn, movement, despawn (no shooting yet)
   (validates asset loading, movement feel, pool correctness)

5. InputManager — mouse tracking, Shift zoom, crosshair rendering
   (establishes the player's view before shooting matters)

6. ScopeOverlay — zoom mask, vignette
   (depends on InputManager being wired; camera zoom needs GameScene camera)

7. CollisionSystem (hitscan fire())
   (depends on AnimalManager active list + InputManager world position)

8. ScoreManager + RoundTimer
   (depends on CollisionSystem emitting hit/miss events)

9. HUDScene (parallel)
   (depends on ScoreManager/RoundTimer emitting events to display)

10. MenuScene + ResultScene
    (depends on ScoreManager final state; scene transitions wire everything together)

11. Polish: particles, SFX, screen shake, combo feedback
    (depends on all core systems working)
```

---

## Sources

- Phaser 3 official documentation (newdocs.phaser.io) — Scene API, Physics.Arcade, Input, Sound Manager, Data Manager (registry). Confidence: HIGH — trained on official docs through August 2025.
- Phaser 3 official examples (phaser.io/examples) — object pooling, parallax, camera zoom, scene management patterns. Confidence: HIGH.
- Community patterns from Phaser Discord and GitHub discussions — parallel HUD scene pattern, hitscan over physics overlap for shooting games. Confidence: MEDIUM — consistent across multiple sources in training data but not live-verified.
- Note: No live web access was available during this research session. All findings are from training knowledge. Phaser 3 core APIs (Scene, Physics.Arcade, Input, Camera) have been stable since v3.0 and are unlikely to have breaking changes.
