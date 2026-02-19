# Roadmap: Franna — African Antelope Hunting Game

## Overview

Franna is built in four phases that mirror the natural dependency order of a Phaser 3 arcade game. Phase 1 establishes the scene architecture that everything else builds on — getting the two-camera scope setup and game state object right here prevents cascading rewrites. Phase 2 delivers a fully playable but rough round. Phase 3 adds the atmosphere and feel that makes the game worth replaying. Phase 4 ships it with score persistence.

## Phases

- [ ] **Phase 1: Foundation** - Scene graph, asset pipeline, two-camera setup, game state object
- [ ] **Phase 2: Core Gameplay** - Animals, aiming, shooting, HUD, round flow
- [ ] **Phase 3: Atmosphere and Feel** - Sound, scope sway, combo multiplier, game-feel polish
- [ ] **Phase 4: Retention and Ship** - High scores, cross-browser QA, production deploy

## Phase Details

### Phase 1: Foundation
**Goal**: A navigable scaffold with the right architecture in place — the game can boot, show a menu, enter an empty game scene, and return to results. The two-camera setup and asset pipeline are proven.
**Depends on**: Nothing (first phase)
**Requirements**: ENV-01, ENV-02, FLOW-04
**Success Criteria** (what must be TRUE):
  1. Game boots in Chrome, Firefox, and Safari without console errors
  2. Player can navigate Boot → Menu → GameScene → ResultScene → Menu using keyboard/mouse
  3. African bush scene is visible as the game world background (placeholder or final art)
  4. Rifle/scope overlay is visible in the unzoomed view
  5. Two-camera setup (world + UI) is established; HUDScene launches as a parallel scene
**Plans**: TBD

Plans:
- [ ] 01-01: Project scaffold — Vite + Phaser 3 setup, atlas workflow, scene graph (Boot → Preload → Menu → Game → Result)
- [ ] 01-02: Scene architecture — two-camera setup, GameState object, depth constants, Phaser timer, background + scope overlay rendering

### Phase 2: Core Gameplay
**Goal**: A complete, playable round — animals spawn and move, the player can aim and shoot with the scope mechanic, hit/miss detection works correctly in both views, the HUD shows score and timer, and the round ends with a results screen.
**Depends on**: Phase 1
**Requirements**: AIM-01, AIM-02, AIM-03, AIM-04, TGT-01, TGT-02, TGT-03, TGT-04, TGT-05, FLOW-01, FLOW-02, FLOW-03
**Success Criteria** (what must be TRUE):
  1. Custom crosshair follows the mouse; OS cursor is hidden
  2. Holding Shift zooms into a circular scope view; releasing Shift returns to normal view
  3. Spacebar fires a shot; hitting an antelope awards points, hitting a wrong animal deducts points, missing shows a miss indicator with no score change
  4. Antelope (springbok, impala, kudu) and wrong animals (elephants, giraffes, birds, warthogs) spawn and move across the scene at varying speeds
  5. Score and countdown timer are visible in the HUD during play; round ends at zero and shows final score with a replay option
**Plans**: TBD

Plans:
- [ ] 02-01: Input and scope — crosshair, Shift-to-zoom circular scope overlay, AIM-03 scope sway, Shift-blur key state handling, coordinate transform for hitscan
- [ ] 02-02: Animals and collision — AnimalManager (object pool, tween paths), correct/wrong target types, hitscan CollisionSystem, ScoreManager with penalty logic
- [ ] 02-03: Round flow and HUD — RoundTimer, HUDScene (score + timer display), round-end transition to ResultScene with final score and replay

### Phase 3: Atmosphere and Feel
**Goal**: The game feels punchy and atmospheric — gunshot and hit sounds play, ambient bush audio runs throughout, missed shots are clearly communicated, consecutive hits build a combo multiplier, and the scope sway makes precision aiming feel skillful.
**Depends on**: Phase 2
**Requirements**: TGT-06, ENV-03, ENV-04
**Success Criteria** (what must be TRUE):
  1. Gunshot, hit confirmation, and miss sounds play on every shot
  2. Ambient bush sounds (insects, wind) play continuously during a round
  3. Consecutive antelope hits visibly build a combo multiplier shown in the HUD; breaking the combo resets it
  4. Miss feedback is clear (visual indicator — puff, flash, or screen shake) distinct from a hit
**Plans**: TBD

Plans:
- [ ] 03-01: Audio — gunshot, hit, and miss SFX (jsfxr generated); ambient loop; Safari audio unlock handling
- [ ] 03-02: Combo multiplier and feedback polish — TGT-06 combo logic in ScoreManager, hit/miss visual feedback effects, HUD combo display

### Phase 4: Retention and Ship
**Goal**: High scores persist across sessions and are visible on the menu and game-over screens; the game passes cross-browser testing; the production build is deployed and publicly accessible.
**Depends on**: Phase 3
**Requirements**: FLOW-05
**Success Criteria** (what must be TRUE):
  1. After a round, the player's score is compared to stored high scores; a new high score is saved to LocalStorage and highlighted on the results screen
  2. High score table is visible on the menu screen between sessions (persists after browser refresh)
  3. Game plays correctly in Chrome, Firefox, and Safari (audio, scope, hit detection all working)
  4. Production URL is publicly accessible; game loads and plays without a local dev server
**Plans**: TBD

Plans:
- [ ] 04-01: High scores — LocalStorage persistence, ScoreManager integration, results screen and menu display
- [ ] 04-02: Cross-browser QA and deploy — Safari audio verification, WebGL fallback test, Vite production build, deploy to GitHub Pages or Netlify

## Progress

**Execution Order:**
Phases execute in order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Core Gameplay | 0/3 | Not started | - |
| 3. Atmosphere and Feel | 0/2 | Not started | - |
| 4. Retention and Ship | 0/2 | Not started | - |
