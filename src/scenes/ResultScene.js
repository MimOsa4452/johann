import { SCENE_KEYS } from '../constants.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.RESULT }); }

  init(data) {
    this.finalScore = data.score ?? 0;
    this.roundNum   = data.roundNum ?? 1;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a0a00');

    this.add.text(width / 2, height * 0.25, 'Round Complete!', {
      fontSize: '52px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.45, `${this.finalScore}`, {
      fontSize: '72px', color: '#ffdd00', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.55, 'POINTS', {
      fontSize: '22px', color: '#aa9944'
    }).setOrigin(0.5);

    const playAgain = this.add.text(width / 2, height * 0.72, '[ SPACE - Play Again ]', {
      fontSize: '28px', color: '#cccccc'
    }).setOrigin(0.5);

    const menuText = this.add.text(width / 2, height * 0.82, '[ M - Menu ]', {
      fontSize: '20px', color: '#888888'
    }).setOrigin(0.5);

    // Pulse the play again text
    this.tweens.add({
      targets: playAgain,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => { this.scene.start(SCENE_KEYS.GAME); });

    const mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    mKey.once('down', () => { this.scene.start(SCENE_KEYS.MENU); });

    this.events.once('shutdown', () => {
      spaceKey.destroy();
      mKey.destroy();
    });
  }
}
