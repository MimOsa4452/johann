import { SCENE_KEYS, DEPTH } from '../constants.js';

export class HUDScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.HUD }); }

  create() {
    const { width } = this.scale;

    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setDepth(DEPTH.HUD);

    this.timerText = this.add.text(width - 20, 20, 'Time: 90', {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(DEPTH.HUD);

    // Phase indicator
    this.phaseText = this.add.text(width / 2, 20, '', {
      fontSize: '22px',
      color: '#ffaa00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(DEPTH.HUD);

    const gameScene = this.scene.get(SCENE_KEYS.GAME);
    const onStateChange = (state) => {
      this.scoreText.setText(`Score: ${state.score}`);
      this.timerText.setText(`Time: ${state.timeLeft}`);

      // Flash timer red when low
      if (state.timeLeft <= 10) {
        this.timerText.setColor('#ff4444');
      } else {
        this.timerText.setColor('#ffffff');
      }

      if (state.phase === 'ended') {
        this.phaseText.setText('TIME UP!');
      }
    };
    gameScene.events.on('stateChange', onStateChange, this);

    this.events.once('shutdown', () => {
      gameScene.events.off('stateChange', onStateChange, this);
    });
  }
}
