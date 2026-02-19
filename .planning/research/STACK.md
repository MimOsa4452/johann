# Stack Research

**Domain:** Browser-based arcade hunting game
**Project:** Franna — African antelope hunting game
**Researched:** 2026-02-19
**Confidence:** MEDIUM — Phaser 3 is well-established; versions verified via npm where possible

---

## Recommended Stack

### Core Framework

| Technology | Version | Why | Confidence |
|-----------|---------|-----|------------|
| **Phaser 3** | 3.80+ (latest) | Industry-standard browser game framework. Handles rendering (Canvas/WebGL), input, audio, sprites, tweens, cameras, scenes. Massive community, extensive examples. | HIGH |
| **Vite** | 5.x | Fast dev server with HMR, native ES modules, simple config. Phaser + Vite is the recommended modern setup. | HIGH |
| **TypeScript** | 5.x (optional) | Type safety for game objects, scenes, configs. Phaser has excellent TS definitions. Can start with JS and migrate. | MEDIUM |

### Build & Dev

| Tool | Purpose | Why |
|------|---------|-----|
| **Vite** | Bundler + dev server | Zero-config for Phaser, fast HMR, production builds with tree-shaking |
| **npm** | Package manager | Standard, no special requirements |

### Asset Pipeline

| Tool | Purpose | Notes |
|------|---------|-------|
| **TexturePacker** or **Free Texture Packer** | Sprite atlas generation | Pack animal sprites into atlases to reduce draw calls. Critical for performance. |
| **Audacity** or **sfxr/jsfxr** | Sound effects | Generate arcade-style gunshot, hit, miss sounds. jsfxr runs in browser. |

### Key Phaser 3 Systems Used

| System | Use Case |
|--------|----------|
| `Phaser.Scene` | Game states: Boot, Menu, Play, GameOver |
| `Phaser.GameObjects.Sprite` | Animals, crosshair, scope overlay |
| `Phaser.Input.Pointer` | Mouse tracking for aim |
| `Phaser.Input.Keyboard` | Shift (zoom), Space (shoot) |
| `Phaser.Cameras.Scene2D` | Scope zoom effect via camera zoom |
| `Phaser.Tweens` | Animal movement paths |
| `Phaser.Sound` | Gunshot, hit, ambient sounds |
| `Phaser.Time.TimerEvent` | Round countdown, spawn intervals |
| `Phaser.Physics.Arcade` | Hit detection (overlap checks) |

---

## What NOT to Use

| Technology | Why Not |
|-----------|---------|
| **Three.js / Babylon.js** | 3D overkill for a 2D sprite game |
| **PixiJS** | Lower-level than Phaser; you'd rebuild scene management, input, audio yourself |
| **Unity WebGL** | Massive bundle size (10MB+), slow load, overkill for arcade 2D |
| **Webpack** | Slower than Vite, more config. No advantage for this project. |
| **React/Vue + canvas** | DOM framework adds unnecessary complexity for a game |
| **Phaser 2 / CE** | Legacy, unmaintained. Phaser 3 is the active version. |
| **Matter.js physics** | Phaser's Arcade physics is sufficient for overlap detection. Matter adds complexity for no benefit here. |

---

## Project Structure

```
franna/
├── index.html          # Entry point
├── package.json
├── vite.config.js
├── src/
│   ├── main.js         # Phaser game config, launch
│   ├── scenes/
│   │   ├── BootScene.js    # Asset preloading
│   │   ├── MenuScene.js    # Start screen
│   │   ├── GameScene.js    # Main gameplay
│   │   └── GameOverScene.js # Score + replay
│   ├── objects/
│   │   ├── Animal.js       # Base animal class
│   │   ├── Antelope.js     # Target animals
│   │   ├── Distractor.js   # Wrong animals
│   │   └── Crosshair.js    # Scope/crosshair
│   └── managers/
│       ├── ScoreManager.js # Points, penalties, combos
│       ├── SpawnManager.js # Animal spawning logic
│       └── SoundManager.js # Audio pooling
├── public/
│   └── assets/
│       ├── sprites/    # Animal sprites, scope overlay
│       ├── backgrounds/# Bush scene layers
│       └── audio/      # Sound effects
```

---

## Sources

- Phaser 3 official examples and documentation — HIGH confidence
- Vite + Phaser starter templates (community) — HIGH confidence
- Browser game architecture patterns — MEDIUM confidence (training data)
