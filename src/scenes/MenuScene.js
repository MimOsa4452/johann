import { SCENE_KEYS } from '../constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.MENU }); }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 80, 'JOHANN', { fontSize: '72px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 20, 'Press SPACE to Play', { fontSize: '28px', color: '#cccccc' }).setOrigin(0.5);

    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', () => { this.scene.start(SCENE_KEYS.GAME); });

    this.events.once('shutdown', () => { spaceKey.destroy(); });
  }
}
