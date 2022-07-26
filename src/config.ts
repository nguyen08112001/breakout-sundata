import { BootScene } from './scenes/boot-scene';
import { GameScene } from './scenes/game-scene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Breakout',
  url: 'https://github.com/digitsensitive/phaser3-typescript',
  version: '1.0',
  type: Phaser.AUTO,
  scene: [BootScene, GameScene],

  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true
    }
  },
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    parent: 'game',
    width: 480,
    height: 640
  },
  render: { pixelArt: true }
};
