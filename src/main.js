import Phaser from 'phaser';
import { BootScene }    from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene }    from './scenes/MenuScene.js';
import { GameScene }    from './scenes/GameScene.js';
import { HUDScene }     from './scenes/HUDScene.js';
import { ResultScene }  from './scenes/ResultScene.js';

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  parent: document.body,
  scene: [BootScene, PreloadScene, MenuScene, GameScene, HUDScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
