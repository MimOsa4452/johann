# Domain Pitfalls: Browser-Based Phaser 3 Arcade Hunting Game

**Domain:** 2D arcade browser game (Phaser 3, desktop, mouse+keyboard)
**Project:** Franna — African antelope hunting game
**Researched:** 2026-02-19
**Confidence:** MEDIUM — based on Phaser 3 training knowledge (Aug 2025 cutoff). No live web verification available. Flag critical items for manual verification against Phaser 3 docs and community forums.

---

## Critical Pitfalls

Mistakes that cause rewrites, broken game feel, or fundamental architectural failure.

---

### Pitfall 1: Scope Zoom Implemented as Camera Zoom (Wrong Architecture)

**What goes wrong:** Developer uses Phaser's `camera.setZoom()` to implement the rifle scope zoom. This zooms the entire viewport uniformly — it cannot produce the circular vignette, blurred periphery, or masked "scope tunnel" effect that makes a rifle scope feel real. It also zooms UI elements unless carefully excluded, and panning feels wrong because the zoom pivot is the camera center, not the crosshair position.

**Why it happens:** `camera.setZoom()` is the obvious first API reach. It's in the docs, works immediately, and appears correct until you try to add the scope mask overlay.

**Consequences:**
- Scope feel is wrong. The "look through a lens" illusion breaks.
- Retrofitting a mask + separate render texture on top of a zoom camera is painful mid-project.
- UI score/timer gets accidentally zoomed unless placed on a separate camera layer from the start.

**Prevention:**
- Implement scope as a masked render texture from day one, not camera zoom.
- Use two cameras: world camera (full scene) and UI camera (HUD overlay, never zooms).
- The scope effect = circular mask on a zoomed sub-view of the scene, rendered as a texture — not a full-viewport zoom.
- Decide on the two-camera setup in Phase 1 (scene structure). It affects everything downstream.

**Detection:** If you find yourself trying to "exclude HUD from zoom" after building zoom — you took the wrong path.

**Phase:** Address in Phase 1 (scene/camera architecture). Do not defer.

---

### Pitfall 2: Asset Loading Blocking Game Start (No Preload Strategy)

**What goes wrong:** All animal sprites, background layers, sound effects, and UI assets are loaded in a single preload pass with no loading screen or phased loading. On a slow connection or large asset set, the player sees a blank screen for several seconds. Worse: developers forget to size spritesheet frames correctly and Phaser silently loads the sheet but produces blank or wrongly-cropped animations.

**Why it happens:** Phaser's `preload()` is simple and works — until you have 15+ animal sprites with 8-frame animations each, parallax background layers, and sound files.

**Consequences:**
- Blank screen on load kills first impressions for a casual arcade game.
- Mismatched spritesheet frame dimensions cause invisible animations that are extremely hard to debug (no error thrown, sprite just shows nothing).

**Prevention:**
- Add a dedicated loading `Scene` with a progress bar in Phase 1.
- Verify every spritesheet with explicit `frameWidth` and `frameHeight` in `this.load.spritesheet()`. Log frame counts after load.
- Use a texture atlas (Texture Packer or Phaser's built-in atlas support) for all animal sprites — reduces HTTP requests and GPU texture swaps.
- Load audio last; it's the most likely to fail silently on Safari due to autoplay restrictions.

**Detection:** Blank canvas on first load. Animations that play but show nothing. Console shows no errors — check `scene.textures.get('key').frameTotal` to verify frame count.

**Phase:** Address in Phase 1 (asset pipeline). Establish atlas workflow before adding any sprites.

---

### Pitfall 3: Animal Pathfinding Implemented as Physics Bodies (Wrong Tool)

**What goes wrong:** Developer uses Phaser's Arcade Physics to move animals across the scene, expecting physics to handle movement naturally. Animals collide with each other, get stuck on invisible physics boundaries, or jitter when multiple bodies occupy the same lane. Physics bodies add overhead for what is fundamentally a tween/path problem.

**Why it happens:** Phaser has an integrated physics system. It seems natural to make moving game objects physics bodies. Tutorials often use physics for everything.

**Consequences:**
- Animals clump or collide unrealistically.
- Frame rate drops with 8+ active physics bodies on complex scenes.
- Debugging physics colliders is significantly harder than debugging tweens.

**Prevention:**
- Use Phaser Tweens or `scene.tweens.addCounter()` for animal movement. Animals in this game run on fixed paths (left-to-right, or curved arcs) — this is a tween problem, not a physics problem.
- Reserve Arcade Physics only for the bullet/hit detection (point-in-rect overlap test), or skip it entirely in favor of manual `Phaser.Geom.Rectangle.Contains()` checks on the click position.
- Animals share no physical interactions — they run past each other. Tweens model this perfectly.

**Detection:** Animals stuttering or clumping. CPU profiler shows physics step consuming >5ms per frame.

**Phase:** Address in Phase 2 (animal movement system). Commit to tweens-based movement before implementing animal spawning.

---

### Pitfall 4: Hit Detection on Scope View Coordinates vs. World Coordinates

**What goes wrong:** The scope zoom shows a magnified sub-view of the world. If mouse coordinates are used directly for hit detection while the scope is active, the hit point is calculated in screen space (zoomed) rather than world space. Shots that visually appear to hit an animal miss in the hit test, or shots at the edge of the scope tunnel hit animals that are visually outside it.

**Why it happens:** Phaser's `pointer.x / pointer.y` returns screen coordinates. When a custom zoom/mask is applied (not a camera zoom), those coordinates are not automatically transformed to world space.

**Consequences:**
- Aiming feels broken — visible hits don't register, or misses register as hits.
- This is a game-feel killer. Players will immediately notice and the game becomes unplayable.

**Prevention:**
- Always work in world coordinates for hit detection. Convert: `camera.getWorldPoint(pointer.x, pointer.y)` to get world position from screen position.
- When scope is active, the zoomed world coordinate under the crosshair center is the shot origin — not the mouse cursor position (since the scope centers the view on the crosshair).
- Write a dedicated `resolveShot(pointer, camera, scopeActive)` function in Phase 2, tested with explicit coordinate assertions before integrating visuals.

**Detection:** Shots that visually hit but don't register. Testing with `scene.add.graphics().fillPoint(worldX, worldY, 5)` to visualize the resolved shot point.

**Phase:** Address in Phase 2 (shooting system). Test coordinate transform in isolation before connecting to scoring.

---

### Pitfall 5: Game Loop State Managed as Loose Scene Variables

**What goes wrong:** Round timer, score, current game state (idle / playing / paused / round-end) are stored as loose `this.score = 0`, `this.timer = 90` variables directly on the scene. As the game grows, state mutations scatter across event handlers, tween callbacks, and update loops. Resetting for a new round requires hunting down and zeroing every variable manually — and inevitably one gets missed.

**Why it happens:** Phaser scenes have `this` as a convenient bag for state. Small games start this way and it works until it doesn't.

**Consequences:**
- Score bleeds across rounds (leftover state from previous round).
- Timer doesn't reset, or resets but doesn't restart the countdown event.
- Hard to add pause/resume logic because state lives in 12 different places.

**Prevention:**
- Define a single `GameState` object (plain JS object, not a class) at scene creation:
  ```javascript
  this.state = { score: 0, timeLeft: 90, phase: 'idle', roundCount: 0 };
  ```
- All mutations go through a `setState(patch)` method that also triggers UI updates.
- Round reset = `Object.assign(this.state, INITIAL_STATE)` — one call, everything resets.
- Use Phaser's `EventEmitter` to broadcast state changes to HUD, not direct property reads.

**Detection:** Score shows wrong value at round start. Timer UI shows stale value after restart. "Quick restart" (arcade requirement) feels janky.

**Phase:** Address in Phase 1 (game loop scaffolding). State architecture is foundational.

---

## Moderate Pitfalls

Mistakes that cause significant rework or poor game feel but not complete rewrites.

---

### Pitfall 6: Audio Failing Silently on Safari / Autoplay Policy

**What goes wrong:** Gunshot, hit, and ambient sounds work in Chrome during development but fail silently on Safari (and sometimes Firefox) in production due to browser autoplay policies. Safari requires a user gesture before any AudioContext can be created. Phaser's sound manager handles this, but only if you initialize audio after the first user interaction.

**Prevention:**
- Gate all audio initialization behind the first click/keypress. Phaser's `this.sound.unlock()` handles this, but must be called from a user-gesture handler.
- Test on Safari during Phase 2 (first audio integration), not at the end.
- Provide a visible "Click to Start" screen that serves double duty as the autoplay unlock gesture.
- Use `.ogg` + `.mp3` dual format for all audio assets. Safari does not support `.ogg`.

**Detection:** Sounds work in Chrome dev, silent in Safari. `this.sound.locked` property is `true` after page load.

**Phase:** Address in Phase 2 (audio integration). Safari test must happen before audio is deeply integrated.

---

### Pitfall 7: Parallax Background Causing Z-Order Confusion with Animals

**What goes wrong:** African bush scene has multiple depth layers (sky, distant hills, midground grass, foreground brush). Animals run in the midground. If depth values are not managed from the start, animals appear behind bushes they should be in front of, or in front of foreground elements that should obscure them. Phaser's default depth is 0 for all objects — everything piles up at the same z-level.

**Prevention:**
- Define a depth constant map at project start:
  ```javascript
  const DEPTH = { SKY: 0, HILLS: 10, MIDGROUND: 20, ANIMALS: 30, FOREGROUND_GRASS: 40, SCOPE_OVERLAY: 50, HUD: 100 };
  ```
- Apply `gameObject.setDepth(DEPTH.ANIMALS)` explicitly on every object creation.
- Foreground obscuring elements (tall grass, dust clouds) must be at `DEPTH.FOREGROUND_GRASS` to partially hide animals — this is a gameplay mechanic, get it right early.

**Detection:** Animals visible through foreground grass that should obscure them. Scope overlay appears behind game objects.

**Phase:** Address in Phase 1 (scene structure). Depth map is an initialization artifact, not a feature.

---

### Pitfall 8: Spritesheet Animation States Not Cleaned Up on Animal Death

**What goes wrong:** When an animal is shot or runs off-screen, the animation still plays on the recycled/destroyed sprite. If using an object pool (correct for performance), the reused sprite starts its new life mid-animation in the wrong frame, or plays the "hit" animation when it should play "running." Phaser does not automatically reset animation state on sprite reuse.

**Prevention:**
- On pool return, always call `sprite.anims.stop()` and `sprite.setFrame(0)` before deactivating.
- On pool checkout, always call `sprite.anims.play('run')` explicitly — never assume state from previous use.
- Define an `Animal` class that wraps the sprite and has explicit `activate()` / `deactivate()` lifecycle methods.

**Detection:** Animals spawning in mid-"death" animation. Flickering sprites at spawn point.

**Phase:** Address in Phase 2 (animal spawning system). Use object pool from the first animal implementation.

---

### Pitfall 9: Score Penalty System Creating Frustrating Negative Loops

**What goes wrong:** Score penalty for shooting wrong animals (elephants, giraffes, etc.) starts at a value that feels punishing rather than instructive. Players who accidentally click on a wrong target get set back 30-40% of their accumulated score. They feel cheated, not challenged. The mechanic intended to create tension instead creates frustration and rage-quits.

**Why it happens:** The penalty value is set arbitrarily during implementation without playtesting against real score accumulation rates.

**Prevention:**
- Implement penalty as a small flat value initially (e.g., -10 points when antelope hit = +25 points).
- Never let score go negative — floor at 0.
- Add a distinct sound + visual feedback for wrong-target penalties so the player understands what happened.
- The penalty value is a tuning parameter — expose it as a config constant from day one so it can be adjusted without code changes.
- Playtest the penalty vs. reward ratio in Phase 3 (game balance), not Phase 2.

**Detection:** Playtesters stop shooting entirely to avoid penalties. Score reaches 0 repeatedly. Feedback: "feels unfair."

**Phase:** Phase 3 (game balance/tuning). But expose as configurable constant in Phase 2.

---

### Pitfall 10: Shift-Hold Zoom Causing Input State Desync on Focus Loss

**What goes wrong:** Player holds Shift to zoom, then the browser loses focus (tab switch, OS notification). `keyup` event for Shift is never received by the game. Scope stays permanently locked in zoom mode after the player refocuses the tab. This is a common input state bug in browser games.

**Prevention:**
- Listen to `window.addEventListener('blur', ...)` to force-release all held keys.
- Maintain a `keysHeld = new Set()` and clear it on window blur.
- Phaser has `scene.input.keyboard.addCapture()` but it doesn't guard against tab-switch state loss — must handle at the window level.
- In `update()`, check `!this.input.keyboard.checkDown(shiftKey)` rather than relying solely on event-based state.

**Detection:** Scope stays zoomed after Alt+Tab and back. Player reports "stuck in scope" bug.

**Phase:** Address in Phase 2 (input system). Add blur handler alongside Shift key listener.

---

### Pitfall 11: WebGL Renderer Chosen Without Fallback Strategy

**What goes wrong:** Phaser defaults to WebGL renderer, which is correct for performance. However, some corporate/institutional environments (VMs, older hardware, some Linux configurations) disable WebGL or report `webgl` as unavailable. Game loads a blank canvas with a console error and no user-facing message.

**Prevention:**
- Set renderer to `Phaser.AUTO` (not `Phaser.WEBGL`) in config — Phaser will fall back to Canvas renderer automatically.
- Test that Canvas renderer produces acceptable performance with the planned sprite count.
- Add an explicit check: if neither WebGL nor Canvas is available, show a human-readable error message.

**Detection:** Blank canvas in certain browser/OS combinations with no error shown to user.

**Phase:** Address in Phase 1 (game config). One-line change with significant compatibility improvement.

---

## Minor Pitfalls

---

### Pitfall 12: Scene Transition Leaving Event Listeners Active

**What goes wrong:** In Phaser, if you use `scene.start('GameScene')` without properly shutting down the previous scene, event listeners registered in the previous scene (keyboard events, custom events) remain active. Keyboard input fires in the wrong scene context. Score events trigger from a scene that should be dead.

**Prevention:**
- Always use Phaser's scene lifecycle correctly: `create()` registers listeners, `shutdown()` removes them.
- Use `this.events.on('shutdown', this.cleanup, this)` pattern in every scene.
- Prefer `scene.start()` over `scene.launch()` for sequential scenes to avoid stacking.

**Detection:** Spacebar fires shoot event on the menu screen. Score increments after round ends.

**Phase:** Address in Phase 1 (scene structure scaffolding).

---

### Pitfall 13: Using `setInterval` / `setTimeout` Instead of Phaser's Timer

**What goes wrong:** Round countdown implemented with `setInterval`. When the game tab is backgrounded, browsers throttle `setInterval` to 1Hz. 90-second round becomes 90+ seconds. Player returns to tab to find the round still "running" slowly. Also, `setInterval` callbacks run outside Phaser's game loop, causing state mutations at unpredictable times relative to `update()`.

**Prevention:**
- Use `this.time.addEvent({ delay: 1000, callback: this.tickTimer, repeat: 89 })` — Phaser's time events are tied to the game loop and pause correctly when the game pauses.
- If background throttling is acceptable, add `document.addEventListener('visibilitychange', ...)` to pause the game loop explicitly when the tab is hidden.

**Detection:** Timer runs slowly after tab switch. Timer fires during paused state.

**Phase:** Address in Phase 1 (game loop / timer system).

---

### Pitfall 14: Background Tile Scrolling with Wrong Wrap Mode

**What goes wrong:** For parallax scrolling or looping background, developer uses `tileSprite` or manual position wrapping. If the background image width doesn't cleanly tile (non-power-of-2 width, or seam is visible), a visible gap/flash appears as the background loops. Particularly noticeable in WebGL renderer where texture wrap mode defaults differ from Canvas.

**Prevention:**
- In WebGL mode, textures used in `tileSprite` must have power-of-2 dimensions or have `gl.CLAMP_TO_EDGE` wrap mode set explicitly.
- Test background loop seam at all parallax scroll speeds during Phase 1 (background implementation).
- Use seamless-tileable source art from the start — fixing tiling seams in art assets is cheaper than fixing it in code.

**Detection:** Flashing white line at background seam during scroll. Visible gap at loop point.

**Phase:** Phase 1 (background/scene art integration).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Scene/camera setup | Scope zoom using `camera.setZoom()` instead of masked render texture | Two-camera architecture from day one (Pitfall 1) |
| Scene/camera setup | Depth z-order not defined upfront | DEPTH constants map before adding any sprites (Pitfall 7) |
| Game loop scaffolding | State scattered as loose scene variables | Single `GameState` object + `setState()` (Pitfall 5) |
| Asset pipeline | Spritesheet frame dimensions mismatched | Explicit frameWidth/frameHeight + atlas workflow (Pitfall 2) |
| Animal movement | Using Arcade Physics for path movement | Tween-based movement from the start (Pitfall 3) |
| Shooting system | Hit detection in screen space during zoom | `resolveShot()` with coordinate transform, tested in isolation (Pitfall 4) |
| Audio integration | Sounds silent on Safari | Audio unlock gate + .ogg/.mp3 dual format (Pitfall 6) |
| Input system | Shift held-key state lost on tab switch | `window.blur` handler to clear key state (Pitfall 10) |
| Animal spawning | Object pool returning sprites with stale animation state | Explicit `activate()`/`deactivate()` lifecycle (Pitfall 8) |
| Game balance | Penalty too punishing before reward rate is measured | Configurable constant + floor at 0 + playtest (Pitfall 9) |
| Timer system | Using `setInterval` for round countdown | Phaser `time.addEvent()` exclusively (Pitfall 13) |
| Background art | Tiling seam visible in WebGL | Power-of-2 textures + seamless source art (Pitfall 14) |
| All scenes | Event listeners surviving scene transitions | `shutdown()` cleanup pattern in every scene (Pitfall 12) |
| Game config | WebGL failure shows blank canvas | `Phaser.AUTO` renderer + user-facing error message (Pitfall 11) |

---

## Sources

**Confidence note:** WebSearch and WebFetch were unavailable during this research session. All findings are based on Phaser 3 training knowledge (knowledge cutoff August 2025), direct experience with Phaser 3 API patterns, and general browser game development practices.

- Phaser 3 official documentation: https://newdocs.phaser.io/ (verify current API for camera, tweens, time, sound)
- Phaser 3 GitHub issues (search for "camera zoom mask", "audio safari", "tileSprite WebGL"): https://github.com/photonstorm/phaser
- Phaser 3 Discourse forum for community-confirmed patterns: https://phaser.discourse.group/
- Items marked with [VERIFY] below should be confirmed against current Phaser 3 docs:
  - [VERIFY] `camera.getWorldPoint()` signature and behavior during custom zoom (Pitfall 4)
  - [VERIFY] `this.sound.unlock()` vs `this.sound.context.resume()` on Safari (Pitfall 6)
  - [VERIFY] `tileSprite` power-of-2 requirement in current WebGL renderer (Pitfall 14)

| Pitfall | Confidence | Basis |
|---------|------------|-------|
| 1 — Scope zoom architecture | HIGH | Core Phaser camera API is stable, well-documented |
| 2 — Asset loading / spritesheet | HIGH | Phaser load API behavior is well-established |
| 3 — Physics vs tweens | HIGH | Phaser physics/tween APIs are stable |
| 4 — Coordinate transform on zoom | MEDIUM | API names may have changed; verify `getWorldPoint` signature |
| 5 — State management | HIGH | JavaScript pattern, framework-agnostic |
| 6 — Safari audio | HIGH | Browser autoplay policy is stable and well-documented |
| 7 — Depth/z-order | HIGH | Phaser `setDepth()` API stable |
| 8 — Object pool animation state | HIGH | Phaser animation state behavior well-documented |
| 9 — Penalty balance | HIGH | Game design principle, not API-dependent |
| 10 — Shift key blur desync | HIGH | Browser input event behavior is stable |
| 11 — WebGL fallback | HIGH | `Phaser.AUTO` documented behavior |
| 12 — Scene event listener leaks | HIGH | Phaser scene lifecycle is stable |
| 13 — setInterval vs Phaser timer | HIGH | Browser throttling behavior is stable |
| 14 — TileSprite WebGL wrap | MEDIUM | WebGL texture requirements may vary by Phaser version |
