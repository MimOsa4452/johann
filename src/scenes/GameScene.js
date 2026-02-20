import { SCENE_KEYS, DEPTH } from '../constants.js';
import { createGameState }   from '../GameState.js';

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.GAME }); }

  create() {
    const { width, height } = this.scale;

    // ── 1. GameState ─────────────────────────────────────────────────────
    this.gameState = createGameState(this);

    // ── 2. Two-camera setup ───────────────────────────────────────────────
    this.cameras.main.setBackgroundColor('#3d5a2a');

    this.uiCamera = this.cameras.add(0, 0, width, height, false, 'ui');
    this.uiCamera.setBackgroundColor('rgba(0,0,0,0)');

    // ── 3. Background placeholder ─────────────────────────────────────────
    const sky = this.add.rectangle(width / 2, height * 0.3, width, height * 0.6, 0x87ceeb)
      .setDepth(DEPTH.SKY);
    const hills = this.add.rectangle(width / 2, height * 0.55, width, height * 0.3, 0x6b8e4e)
      .setDepth(DEPTH.HILLS);
    const ground = this.add.rectangle(width / 2, height * 0.8, width, height * 0.4, 0xc8a060)
      .setDepth(DEPTH.MIDGROUND);

    this.uiCamera.ignore([sky, hills, ground]);

    // ── 4. Scope overlay skeleton ─────────────────────────────────────────
    this.scopeOverlay = this.add.graphics()
      .setDepth(DEPTH.SCOPE_DARK)
      .setScrollFactor(0)
      .setVisible(false);
    this.scopeOverlay.fillStyle(0x000000, 0.85);
    this.scopeOverlay.fillRect(0, 0, width, height);

    this.scopeCircle = this.add.graphics()
      .setDepth(DEPTH.SCOPE_WINDOW)
      .setScrollFactor(0)
      .setVisible(false);
    const scopeRadius = 120;
    this.scopeCircle.fillStyle(0xffffff);
    this.scopeCircle.fillCircle(width / 2, height / 2, scopeRadius);

    const rifleBar = this.add.rectangle(width / 2, height - 30, width, 60, 0x1a0a00)
      .setDepth(DEPTH.SCOPE_WINDOW)
      .setScrollFactor(0);

    this.uiCamera.ignore([this.scopeOverlay, this.scopeCircle, rifleBar]);

    // ── 5. Phaser timer scaffold ──────────────────────────────────────────
    this.roundTimer = null;

    // ── 6. Launch HUDScene in parallel ────────────────────────────────────
    this.scene.launch(SCENE_KEYS.HUD);

    // ── 7. Dev shortcut — remove in Phase 2 ──────────────────────────────
    const rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    rKey.once('down', () => {
      this.scene.stop(SCENE_KEYS.HUD);
      this.scene.start(SCENE_KEYS.RESULT, { score: this.gameState.get().score, roundNum: 1 });
    });

    // ── 8. Shutdown cleanup ───────────────────────────────────────────────
    this.events.once('shutdown', () => {
      rKey.destroy();
      if (this.roundTimer) { this.roundTimer.remove(); }
    });
  }

  startRoundTimer() {
    this.roundTimer = this.time.addEvent({
      delay:         1000,
      callback:      this.onTimerTick,
      callbackScope: this,
      repeat:        89,
    });
    this.gameState.setState({ phase: 'playing' });
  }

  onTimerTick() {
    const newTime = this.gameState.get().timeLeft - 1;
    this.gameState.setState({ timeLeft: newTime });
    if (newTime <= 0) {
      this.onRoundEnd();
    }
  }

  onRoundEnd() {
    if (this.roundTimer) { this.roundTimer.remove(); }
    this.gameState.setState({ phase: 'ended' });
    this.scene.stop(SCENE_KEYS.HUD);
    this.scene.start(SCENE_KEYS.RESULT, {
      score:    this.gameState.get().score,
      roundNum: this.gameState.get().roundCount,
    });
  }
}
