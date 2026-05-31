import Phaser from 'phaser';
import Player from '../entities/Player.js';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    this.load.image('tiles', 'assets/tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/tileset.json');
    this.load.image('player', 'assets/player.png');
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });

    if (!map) {
      console.error('Map failed to load!');
      return;
    }

    const tileset = map.addTilesetImage('tuxmon-sample-32px-extruded', 'tiles');

    if (!tileset) {
      console.error('Tileset not found! Name in JSON:', map.tilesets);
      return;
    }

    const belowLayer = map.createLayer('Below Player', tileset, 0, 0);
    const worldLayer = map.createLayer('World', tileset, 0, 0);
    const aboveLayer = map.createLayer('Above Player', tileset, 0, 0);

    if (!worldLayer) {
      console.error('Layer not found! Layers in map:', map.layers);
      return;
    }

    worldLayer.setCollisionByProperty({ collides: true });

    // Ensure aboveLayer renders on top of the player
    if (aboveLayer) {
      aboveLayer.setDepth(10);
    }

    // Spawn point from map, or center
    const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
    const spawnX = spawnPoint ? spawnPoint.x : map.widthInPixels / 2;
    const spawnY = spawnPoint ? spawnPoint.y : map.heightInPixels / 2;

    this.player = new Player(this, spawnX, spawnY);
    // Player depth should be below 'Above Player'
    this.player.setDepth(5);

    this.physics.add.collider(this.player, worldLayer);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2);
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }
  }
}
