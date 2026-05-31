import Phaser from 'phaser';
import Player from '../entities/Player.js';

import tilesetImg from '../assets/tileset.png';
import tilesetJsonUrl from '../assets/tileset.json?url';

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene');
  }

  preload() {
    this.load.image('tiles', tilesetImg);
    this.load.tilemapTiledJSON('map', tilesetJsonUrl);
  }

  create() {
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('pokemon_tiles', 'tiles');

    if (!tileset) {
      console.error('Tileset not found! Check tileset name in JSON.');
      return;
    }

    const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

    if (!layer) {
      console.error('Layer not found! Check layer name in JSON.');
      return;
    }

    // Set collision on tiles based on property (e.g. collides: true)
    layer.setCollisionByProperty({ collides: true });

    // Spawn the player near the center of the map
    // Player constructor now handles add.existing and physics.add.existing internally
    this.player = new Player(this, map.widthInPixels / 2, map.heightInPixels / 2);

    this.physics.add.collider(this.player, layer);

    // Camera follow with offset parameters passed directly
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2); // Zoom in to give it that retro GBA feel
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(time, delta);
    }
  }
}
