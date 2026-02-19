# Franna — African Antelope Hunting Game

## What This Is

A browser-based arcade hunting game where players look through a rifle scope at an African bush scene and shoot antelope running past. Built with Phaser, it features timed rounds, score-based gameplay, and distractions that test the player's aim and judgment.

## Core Value

The shooting feels satisfying — aiming, zooming, and hitting a running antelope is fun and rewarding every single time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Player sees a full African bush scene with a rifle/scope overlay
- [ ] Player can aim with the mouse (crosshair follows cursor)
- [ ] Player holds Shift to zoom into scope view for precision aiming
- [ ] Player presses Spacebar to shoot
- [ ] Antelope run across the scene at varying speeds and directions
- [ ] Hitting an antelope awards points
- [ ] Wrong animals appear as distractions (elephants, birds, etc.) — shooting them costs points
- [ ] Environmental distractions (bushes, dust clouds) partially obscure the view
- [ ] Timed rounds (60-90 seconds)
- [ ] Score display during and after round
- [ ] Arcade feel — fast-paced, punchy feedback, quick restart

### Out of Scope

- Realistic simulation — this is arcade, not a hunting sim
- Multiplayer — single player only for v1
- Mobile support — desktop browser with mouse/keyboard
- Story mode or campaign — just score-chasing rounds
- Monetization or accounts — no login, no payments

## Context

- Phaser game engine (browser-based, canvas/WebGL)
- Target audience: casual gamers looking for a quick, fun session
- African bush setting with savanna/grassland visuals
- Antelope species: springbok, impala, kudu — recognizable silhouettes
- Wrong targets: elephants, giraffes, birds, warthogs
- Environmental elements: tall grass, acacia trees, dust, heat haze

## Constraints

- **Tech stack**: Phaser 3 — lightweight, well-documented, good for 2D arcade games
- **Platform**: Desktop browsers (Chrome, Firefox, Safari)
- **Input**: Mouse + keyboard (no touch/gamepad)
- **Art style**: Arcade/stylized — sprites or simple illustrated assets

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser 3 over plain Canvas | Game framework handles sprites, physics, input, scenes out of the box | — Pending |
| Shift-to-zoom mechanic | Adds skill depth — normal view for spotting, scoped view for precision | — Pending |
| Score penalty for wrong targets | Creates tension and judgment calls, not just reflexes | — Pending |

---
*Last updated: 2026-02-19 after initialization*
