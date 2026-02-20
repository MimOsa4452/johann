import { SCENE_KEYS, DEPTH } from '../constants.js';

export class HUDScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.HUD }); }

  create() {
    const { width } = this.scale;

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
    }).setDepth(DEPTH.HUD);

    this.timerText = this.add.text(width - 20, 20, 'Time: 90', {
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(DEPTH.HUD);

    // Hint text
    this.add.text(width / 2, 690, 'SHIFT = Scope  |  SPACE = Shoot  |  Far + Slow = More Points', {
      fontSize: '14px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(DEPTH.HUD).setAlpha(0.6);

    const gameScene = this.scene.get(SCENE_KEYS.GAME);
    const onStateChange = (state) => {
      this.scoreText.setText(`Score: ${state.score}`);
      this.timerText.setText(`Time: ${state.timeLeft}`);

      if (state.timeLeft <= 10) {
        this.timerText.setColor('#ff4444');
        this.timerText.setFontSize(36);
      } else {
        this.timerText.setColor('#ffffff');
        this.timerText.setFontSize(32);
      }

      if (state.phase === 'ended') {
        const timeUp = this.add.text(this.scale.width / 2, this.scale.height / 2, 'TIME UP!', {
          fontSize: '64px',
          color: '#ff4444',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 6,
        }).setOrigin(0.5).setDepth(DEPTH.HUD);

        this.tweens.add({
          targets: timeUp,
          scaleX: 1.3,
          scaleY: 1.3,
          alpha: 0,
          duration: 600,
          ease: 'Power2',
        });
      }
    };
    gameScene.events.on('stateChange', onStateChange, this);

    this.events.once('shutdown', () => {
      gameScene.events.off('stateChange', onStateChange, this);
    });
  }
}
