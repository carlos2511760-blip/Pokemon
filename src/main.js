import Phaser from 'phaser';
import WorldScene from './scene/WorldScene.js';
import IndoorScene from './scene/IndoorScene.js';
import BattleScene from './scene/BattleScene.js';

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
  scene: [WorldScene, IndoorScene, BattleScene]
};

const game = new Phaser.Game(config);
