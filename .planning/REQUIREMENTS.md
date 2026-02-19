# Requirements: Franna

**Defined:** 2026-02-19
**Core Value:** The shooting feels satisfying — aiming, zooming, and hitting a running antelope is fun and rewarding every single time.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Input & Aiming

- [ ] **AIM-01**: Player sees a custom crosshair that follows the mouse cursor (OS cursor hidden)
- [ ] **AIM-02**: Player can hold Shift to zoom into a circular scope view for precision aiming
- [ ] **AIM-03**: Scope view has subtle sway/drift that the player must compensate for
- [ ] **AIM-04**: Player presses Spacebar to fire a shot at the crosshair position

### Targets & Scoring

- [ ] **TGT-01**: Antelope (springbok, impala, kudu) run across the scene at varying speeds and directions
- [ ] **TGT-02**: Hitting an antelope awards points based on difficulty (speed, distance)
- [ ] **TGT-03**: Wrong animals (elephants, giraffes, birds, warthogs) appear as distractions
- [ ] **TGT-04**: Shooting a wrong animal deducts points
- [ ] **TGT-05**: Missing a shot has no penalty but provides clear miss feedback
- [ ] **TGT-06**: Consecutive hits build a combo multiplier that increases score per hit

### Game Flow

- [ ] **FLOW-01**: Each round has a countdown timer (60-90 seconds)
- [ ] **FLOW-02**: Score and timer are displayed in a HUD during gameplay
- [ ] **FLOW-03**: Round ends when timer reaches zero, showing final score and replay option
- [ ] **FLOW-04**: Player can start a new round from a menu screen
- [ ] **FLOW-05**: High scores are saved to LocalStorage and displayed on menu/game-over screen

### Scene & Atmosphere

- [ ] **ENV-01**: Player sees a full African bush scene with savanna/grassland visuals
- [ ] **ENV-02**: Rifle/scope overlay is visible in the normal (unzoomed) view
- [ ] **ENV-03**: Sound effects play for gunshot, hit confirmation, and miss
- [ ] **ENV-04**: Ambient sounds (insects, wind) create African bush atmosphere

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Gameplay Depth

- **DEEP-01**: Reload mechanic — limited shots per magazine, manual reload
- **DEEP-02**: Difficulty ramp — targets get faster and more frequent over time
- **DEEP-03**: Antelope behaviour states (grazing → alert → fleeing based on nearby shots)

### Atmosphere

- **ATM-01**: Layered parallax scrolling background for depth
- **ATM-02**: Environmental distractors (birds flushing, dust clouds blocking view)
- **ATM-03**: Time-of-day lighting variation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multiplayer | Arcade single-player focus; networking adds massive scope |
| Mobile / touch controls | Scope aiming requires mouse precision; touch degrades core mechanic |
| Realistic ballistics (bullet drop, wind) | Arcade feel, not hunting simulation |
| Story mode / campaign | Score-chasing rounds only; no narrative framing |
| Accounts / monetization | No login, no payments — pure browser game |
| Animal gore / blood effects | Arcade tone; stylized hit effects only |
| Procedural terrain | Hand-crafted bush scene is sufficient |
| Inventory / loadout system | Single rifle; no RPG scope creep |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AIM-01 | — | Pending |
| AIM-02 | — | Pending |
| AIM-03 | — | Pending |
| AIM-04 | — | Pending |
| TGT-01 | — | Pending |
| TGT-02 | — | Pending |
| TGT-03 | — | Pending |
| TGT-04 | — | Pending |
| TGT-05 | — | Pending |
| TGT-06 | — | Pending |
| FLOW-01 | — | Pending |
| FLOW-02 | — | Pending |
| FLOW-03 | — | Pending |
| FLOW-04 | — | Pending |
| FLOW-05 | — | Pending |
| ENV-01 | — | Pending |
| ENV-02 | — | Pending |
| ENV-03 | — | Pending |
| ENV-04 | — | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 0
- Unmapped: 19 ⚠️

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after initial definition*
