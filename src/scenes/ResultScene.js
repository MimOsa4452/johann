import { SCENE_KEYS } from '../constants.js';

export class ResultScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.RESULT }); }

  init(data) {
    this.finalScore = data.score ?? 0;
    this.roundNum   = data.roundNum ?? 1;
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 60, 'Round Complete!', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 10, `Score: ${this.finalScore}`, { fontSize: '36px', color: '#ffdd00' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 70, 'Press SPACE for Menu', { fontSize: '22px', color: '#aaaaaa' }).setOrigin(0.5);

    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => { this.scene.start(SCENE_KEYS.MENU); });

    this.events.once('shutdown', () => { spaceKey.destroy(); });
  }
}
