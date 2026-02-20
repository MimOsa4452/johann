import { SCENE_KEYS, DEPTH } from '../constants.js';
import { createGameState }   from '../GameState.js';
import { AnimalManager }     from '../AnimalManager.js';

const SCOPE_RADIUS = 140;
const SCOPE_ZOOM   = 2.5;
const ROUND_TIME   = 90;

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.GAME }); }

  create() {
    const { width, height } = this.scale;
    this.w = width;
    this.h = height;

    // ── 1. GameState ─────────────────────────────────────────────────────
    this.gameState = createGameState(this);

    // ── 2. Two-camera setup ───────────────────────────────────────────────
    this.cameras.main.setBackgroundColor('#3d5a2a');

    this.uiCamera = this.cameras.add(0, 0, width, height, false, 'ui');
    this.uiCamera.setBackgroundColor('rgba(0,0,0,0)');

    // ── 3. Background ────────────────────────────────────────────────────
    const sky = this.add.rectangle(width / 2, height * 0.3, width, height * 0.6, 0x87ceeb)
      .setDepth(DEPTH.SKY);
    const hills = this.add.rectangle(width / 2, height * 0.55, width, height * 0.3, 0x6b8e4e)
      .setDepth(DEPTH.HILLS);
    const ground = this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, 0xc8a060)
      .setDepth(DEPTH.MIDGROUND);

    // Some grass tufts for atmosphere
    for (let i = 0; i < 12; i++) {
      const gx = Math.random() * width;
      const gy = height * 0.6 + Math.random() * height * 0.25;
      const grass = this.add.rectangle(gx, gy, 8 + Math.random() * 12, 15 + Math.random() * 20, 0x4a7a30)
        .setDepth(DEPTH.FOREGROUND);
      this.uiCamera.ignore(grass);
    }

    this.worldObjects = [sky, hills, ground];
    this.uiCamera.ignore(this.worldObjects);

    // ── 4. Scope overlay ─────────────────────────────────────────────────
    this.scoped = false;

    // Dark overlay with circular cutout (using mask)
    this.scopeOverlay = this.add.graphics()
      .setDepth(DEPTH.SCOPE_DARK)
      .setScrollFactor(0)
      .setVisible(false);

    this.scopeCircleShape = this.make.graphics({ x: 0, y: 0, add: false });

    // Scope ring border
    this.scopeRing = this.add.graphics()
      .setDepth(DEPTH.SCOPE_WINDOW)
      .setScrollFactor(0)
      .setVisible(false);

    // Rifle bar at bottom
    this.rifleBar = this.add.rectangle(width / 2, height - 30, width, 60, 0x1a0a00)
      .setDepth(DEPTH.SCOPE_WINDOW)
      .setScrollFactor(0);

    this.uiCamera.ignore([this.scopeOverlay, this.scopeRing, this.rifleBar]);

    // ── 5. Crosshair ─────────────────────────────────────────────────────
    this.input.setDefaultCursor('none');

    this.crosshair = this.add.graphics()
      .setDepth(DEPTH.CROSSHAIR)
      .setScrollFactor(0);
    this.drawCrosshair(this.crosshair, false);
    this.uiCamera.ignore(this.crosshair);

    // ── 6. Animals ───────────────────────────────────────────────────────
    this.animalManager = new AnimalManager(this);

    // ── 7. Input ─────────────────────────────────────────────────────────
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', this.onShoot, this);

    // ── 8. Shot feedback container ───────────────────────────────────────
    this.feedbackObjects = [];

    // ── 9. Launch HUD and start round ────────────────────────────────────
    this.scene.launch(SCENE_KEYS.HUD);
    this.startRound();

    // ── 10. Shutdown cleanup ─────────────────────────────────────────────
    this.events.once('shutdown', () => {
      this.input.setDefaultCursor('default');
      this.shiftKey.destroy();
      this.spaceKey.off('down', this.onShoot, this);
      this.spaceKey.destroy();
      this.animalManager.destroy();
      if (this.roundTimer) this.roundTimer.remove();
      this.feedbackObjects.forEach(f => { if (f.active) f.destroy(); });
    });
  }

  update() {
    const pointer = this.input.activePointer;
    const px = pointer.x;
    const py = pointer.y;

    // Update crosshair position
    this.crosshair.setPosition(px, py);

    // Scope toggle
    const wantScope = this.shiftKey.isDown;
    if (wantScope && !this.scoped) {
      this.enterScope(px, py);
    } else if (!wantScope && this.scoped) {
      this.exitScope();
    }

    if (this.scoped) {
      this.updateScope(px, py);
    }
  }

  // ── Scope mechanics ──────────────────────────────────────────────────

  enterScope(px, py) {
    this.scoped = true;
    const { w, h } = this;

    // Draw scope overlay (dark with circular hole)
    this.scopeOverlay.clear();
    this.scopeOverlay.fillStyle(0x000000, 0.9);
    this.scopeOverlay.fillRect(0, 0, w, h);
    this.scopeOverlay.setVisible(true);

    // Create mask to cut circle out of overlay
    this.scopeCircleShape.clear();
    this.scopeCircleShape.fillStyle(0xffffff);
    this.scopeCircleShape.fillCircle(px, py, SCOPE_RADIUS);
    const mask = this.scopeCircleShape.createGeometryMask();
    mask.invertAlpha = true;
    this.scopeOverlay.setMask(mask);

    // Scope ring
    this.scopeRing.clear();
    this.scopeRing.lineStyle(3, 0x333333, 1);
    this.scopeRing.strokeCircle(px, py, SCOPE_RADIUS);
    this.scopeRing.lineStyle(1, 0x666666, 0.5);
    // Crosshairs in scope
    this.scopeRing.lineBetween(px - SCOPE_RADIUS, py, px + SCOPE_RADIUS, py);
    this.scopeRing.lineBetween(px, py - SCOPE_RADIUS, px, py + SCOPE_RADIUS);
    this.scopeRing.setVisible(true);

    // Zoom main camera toward pointer position
    this.cameras.main.setZoom(SCOPE_ZOOM);
    this.cameras.main.centerOn(px, py);

    // Update crosshair for scoped mode
    this.crosshair.clear();
    this.drawCrosshair(this.crosshair, true);

    this.rifleBar.setVisible(false);
  }

  exitScope() {
    this.scoped = false;

    this.scopeOverlay.setVisible(false);
    this.scopeOverlay.clearMask(true);
    this.scopeRing.setVisible(false);

    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(this.w / 2, this.h / 2);

    this.crosshair.clear();
    this.drawCrosshair(this.crosshair, false);

    this.rifleBar.setVisible(true);
  }

  updateScope(px, py) {
    // Redraw scope circle and ring at new pointer position
    this.scopeCircleShape.clear();
    this.scopeCircleShape.fillStyle(0xffffff);
    this.scopeCircleShape.fillCircle(px, py, SCOPE_RADIUS);

    this.scopeRing.clear();
    this.scopeRing.lineStyle(3, 0x333333, 1);
    this.scopeRing.strokeCircle(px, py, SCOPE_RADIUS);
    this.scopeRing.lineStyle(1, 0x666666, 0.5);
    this.scopeRing.lineBetween(px - SCOPE_RADIUS, py, px + SCOPE_RADIUS, py);
    this.scopeRing.lineBetween(px, py - SCOPE_RADIUS, px, py + SCOPE_RADIUS);

    // Keep camera centered on pointer for scope tracking
    this.cameras.main.centerOn(px, py);
  }

  drawCrosshair(g, scoped) {
    g.clear();
    const size = scoped ? 10 : 18;
    const gap = scoped ? 3 : 5;
    const thickness = scoped ? 1 : 2;
    const color = scoped ? 0xff0000 : 0xff3333;

    g.lineStyle(thickness, color, 0.9);
    // Top
    g.lineBetween(0, -size, 0, -gap);
    // Bottom
    g.lineBetween(0, gap, 0, size);
    // Left
    g.lineBetween(-size, 0, -gap, 0);
    // Right
    g.lineBetween(gap, 0, size, 0);
    // Center dot
    g.fillStyle(color, 0.8);
    g.fillCircle(0, 0, scoped ? 1 : 2);
  }

  // ── Shooting ─────────────────────────────────────────────────────────

  onShoot() {
    const state = this.gameState.get();
    if (state.phase !== 'playing') return;

    const pointer = this.input.activePointer;

    // Convert screen position to world position for hit detection
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const result = this.animalManager.checkHit(worldPoint.x, worldPoint.y);

    if (result.hit) {
      const newScore = state.score + result.points;
      this.gameState.setState({ score: Math.max(0, newScore) });
      this.showHitFeedback(pointer.x, pointer.y, result);
    } else {
      this.showMissFeedback(pointer.x, pointer.y);
    }

    // Muzzle flash effect
    this.cameras.main.flash(50, 255, 200, 100, false);
  }

  showHitFeedback(x, y, result) {
    const color = result.correct ? '#00ff00' : '#ff0000';
    const prefix = result.correct ? '+' : '';
    const text = this.add.text(x, y - 30, `${prefix}${result.points}`, {
      fontSize: '24px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(DEPTH.HUD).setScrollFactor(0);

    this.uiCamera.ignore(text);
    this.feedbackObjects.push(text);

    this.tweens.add({
      targets: text,
      y: y - 80,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
        this.feedbackObjects = this.feedbackObjects.filter(f => f !== text);
      },
    });
  }

  showMissFeedback(x, y) {
    const puff = this.add.circle(x, y, 8, 0xccaa77, 0.6)
      .setDepth(DEPTH.HUD).setScrollFactor(0);
    this.uiCamera.ignore(puff);
    this.feedbackObjects.push(puff);

    this.tweens.add({
      targets: puff,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        puff.destroy();
        this.feedbackObjects = this.feedbackObjects.filter(f => f !== puff);
      },
    });
  }

  // ── Round flow ───────────────────────────────────────────────────────

  startRound() {
    this.gameState.reset();
    this.gameState.setState({ phase: 'playing', timeLeft: ROUND_TIME, roundCount: 1 });
    this.animalManager.start();
    this.startRoundTimer();
  }

  startRoundTimer() {
    this.roundTimer = this.time.addEvent({
      delay:         1000,
      callback:      this.onTimerTick,
      callbackScope: this,
      repeat:        ROUND_TIME - 1,
    });
  }

  onTimerTick() {
    const newTime = this.gameState.get().timeLeft - 1;
    this.gameState.setState({ timeLeft: newTime });
    if (newTime <= 0) {
      this.onRoundEnd();
    }
  }

  onRoundEnd() {
    if (this.roundTimer) { this.roundTimer.remove(); this.roundTimer = null; }
    this.animalManager.stop();
    this.gameState.setState({ phase: 'ended' });

    // Brief delay before showing results
    this.time.delayedCall(500, () => {
      this.scene.stop(SCENE_KEYS.HUD);
      this.scene.start(SCENE_KEYS.RESULT, {
        score:    this.gameState.get().score,
        roundNum: this.gameState.get().roundCount,
      });
    });
  }
}
