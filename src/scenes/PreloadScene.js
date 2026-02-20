import { SCENE_KEYS } from '../constants.js';

export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: SCENE_KEYS.PRELOAD }); }

  preload() {
    const { width, height } = this.scale;

    const barBg = this.add.rectangle(width / 2, height / 2, 880, 24, 0x333333);
    const bar   = this.add.rectangle(width / 2 - 440, height / 2, 0, 24, 0xffffff).setOrigin(0, 0.5);
    this.add.text(width / 2, height / 2 - 40, 'Loading...', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

    this.load.on('progress', (p) => { bar.width = 880 * p; });
    this.load.setPath('assets/');
  }

  create() {
    this.scene.start(SCENE_KEYS.MENU);
  }
}
