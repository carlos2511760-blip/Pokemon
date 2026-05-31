import Phaser from 'phaser';
import WorldScene from './scene/WorldScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [WorldScene]
};

const game = new Phaser.Game(config);
